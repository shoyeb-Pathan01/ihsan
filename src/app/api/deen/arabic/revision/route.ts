import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lectureId");

    if (!lectureId) {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }

    const revisions = await prisma.arabicRevision.findMany({
      where: { lecture_id: lectureId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ revisions });
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
    let daysToAdd = 1;
    if (revisionCount === 2) daysToAdd = 3;
    else if (revisionCount === 3) daysToAdd = 7;
    else if (revisionCount === 4) daysToAdd = 14;
    else if (revisionCount >= 5) daysToAdd = 30;

    const todayStr = new Date().toISOString().split("T")[0];
    const revisionDate = date || todayStr;
    const nextDate = new Date(revisionDate + "T00:00:00Z");
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    const next_revision_date = nextDate.toISOString().split("T")[0];

    const [revision] = await prisma.$transaction([
      prisma.arabicRevision.create({
        data: {
          lecture_id,
          date: revisionDate,
          understanding,
          confidence,
          struggles: struggles ?? "",
          next_revision_date,
        },
      }),
      prisma.lisanLecture.update({
        where: { id: lecture_id },
        data: {
          revision_count: revisionCount,
          last_revision_date: revisionDate,
          next_revision_date,
        },
      }),
    ]);

    return NextResponse.json({ revision });
  } catch (error) {
    console.error("Error creating revision:", error);
    return NextResponse.json({ error: "Failed to create revision" }, { status: 500 });
  }
}
