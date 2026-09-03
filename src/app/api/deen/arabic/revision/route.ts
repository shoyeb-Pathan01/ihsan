import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Spaced repetition intervals in days (by level)
const INTERVALS = [3, 7, 14, 30, 45];

function todayLocal(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + 5.5 * 3600000);
  return local.toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lectureId");
    const needsSelfTest = searchParams.get("needsSelfTest");

    // Get revision history for a lecture
    if (lectureId) {
      const revisions = await prisma.arabicRevision.findMany({
        where: { lecture_id: lectureId },
        orderBy: { date: "desc" },
      });

      const lecture = await prisma.lisanLecture.findUnique({ where: { id: lectureId } });

      return NextResponse.json({
        revisions,
        lecture: lecture ? {
          revision_count: lecture.revision_count,
          next_revision_date: lecture.next_revision_date,
          mastery_percentage: lecture.mastery_percentage,
          practice_status: lecture.practice_status,
        } : null,
      });
    }

    // Get all lectures that need self-test prompts
    if (needsSelfTest === "true") {
      const now = todayLocal();
      const lectures = await prisma.lisanLecture.findMany({
        where: {
          practice_status: "completed",
          next_revision_date: { not: null },
        },
        orderBy: { lecture_number: "asc" },
      });

      const needsTest = lectures.filter((lec) => {
        if (!lec.next_revision_date) return false;
        const daysUntil = daysBetween(now, lec.next_revision_date);
        return daysUntil <= 0;
      });

      return NextResponse.json({ lectures: needsTest });
    }

    return NextResponse.json({ error: "Provide lectureId or needsSelfTest" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching revisions:", error);
    return NextResponse.json({ error: "Failed to fetch revisions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lecture_id, date, understanding, confidence, struggles } = body;

    if (!lecture_id || typeof lecture_id !== "string") {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }
    if (understanding === undefined || typeof understanding !== "number" || understanding < 1 || understanding > 5) {
      return NextResponse.json({ error: "understanding must be a number between 1 and 5" }, { status: 400 });
    }
    if (confidence === undefined || typeof confidence !== "number" || confidence < 1 || confidence > 5) {
      return NextResponse.json({ error: "confidence must be a number between 1 and 5" }, { status: 400 });
    }

    const lecture = await prisma.lisanLecture.findUnique({ where: { id: lecture_id } });
    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    const revisionCount = lecture.revision_count + 1;
    let daysToAdd = INTERVALS[0]; // 3 days
    if (revisionCount === 2) daysToAdd = INTERVALS[1]; // 7 days
    else if (revisionCount === 3) daysToAdd = INTERVALS[2]; // 14 days
    else if (revisionCount === 4) daysToAdd = INTERVALS[3]; // 30 days
    else if (revisionCount >= 5) daysToAdd = INTERVALS[4]; // 45 days

    const todayStr = todayLocal();
    const revisionDate = date || todayStr;
    const nextDate = new Date(revisionDate + "T00:00:00Z");
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    const next_revision_date = nextDate.toISOString().split("T")[0];

    // Calculate mastery based on understanding + confidence
    const masteryDelta = ((understanding + confidence) / 10) * 10;
    const newMastery = Math.min(100, lecture.mastery_percentage + masteryDelta);

    const intervalLevel = Math.min(revisionCount, 5);

    const [revision] = await prisma.$transaction([
      prisma.arabicRevision.create({
        data: {
          lecture_id,
          date: revisionDate,
          understanding,
          confidence,
          struggles: struggles ?? "",
          next_revision_date,
          interval_level: intervalLevel,
        },
      }),
      prisma.lisanLecture.update({
        where: { id: lecture_id },
        data: {
          revision_count: revisionCount,
          last_revision_date: revisionDate,
          next_revision_date,
          mastery_percentage: newMastery,
        },
      }),
    ]);

    return NextResponse.json({ revision, next_revision_date, mastery: newMastery });
  } catch (error) {
    console.error("Error creating revision:", error);
    return NextResponse.json({ error: "Failed to create revision" }, { status: 500 });
  }
}

// PATCH: Record self-test result (pass/fail) and update revision schedule
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { lecture_id, result } = body;

    if (!lecture_id || typeof lecture_id !== "string") {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }
    if (result !== "pass" && result !== "fail") {
      return NextResponse.json({ error: "result must be 'pass' or 'fail'" }, { status: 400 });
    }

    const lecture = await prisma.lisanLecture.findUnique({ where: { id: lecture_id } });
    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    const todayStr = todayLocal();
    let next_revision_date: string;
    let intervalLevel = lecture.revision_count;

    if (result === "pass") {
      // Pass: advance to next interval
      const daysToAdd = INTERVALS[Math.min(intervalLevel, INTERVALS.length - 1)];
      const nextDate = new Date(todayStr + "T00:00:00Z");
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      next_revision_date = nextDate.toISOString().split("T")[0];
      intervalLevel = Math.min(intervalLevel + 1, INTERVALS.length);
    } else {
      // Fail: reschedule to today (or tomorrow at latest)
      next_revision_date = todayStr;
      intervalLevel = 1; // Reset to first interval
    }

    // Update the latest revision with recall result
    const latestRevision = await prisma.arabicRevision.findFirst({
      where: { lecture_id },
      orderBy: { date: "desc" },
    });

    if (latestRevision) {
      await prisma.arabicRevision.update({
        where: { id: latestRevision.id },
        data: { last_recall_result: result },
      });
    }

    // Update lecture with new revision date
    const masteryBoost = result === "pass" ? 5 : 0;
    const newMastery = Math.min(100, lecture.mastery_percentage + masteryBoost);

    await prisma.lisanLecture.update({
      where: { id: lecture_id },
      data: {
        next_revision_date,
        mastery_percentage: newMastery,
      },
    });

    return NextResponse.json({
      result,
      next_revision_date,
      mastery: newMastery,
      message: result === "pass" ? "InshAllah, interval advanced." : "Revision rescheduled. Practice karo.",
    });
  } catch (error) {
    console.error("Error updating recall result:", error);
    return NextResponse.json({ error: "Failed to update recall result" }, { status: 500 });
  }
}
