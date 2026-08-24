import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/deen/arabic/revision - Get revision sessions for a lecture
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

// POST /api/deen/arabic/revision - Create revision session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lecture_id, date, understanding, confidence, struggles } = body;

    if (!lecture_id) {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }

    // Calculate next revision date using spaced repetition
    // Simple algorithm: 1 day, 3 days, 7 days, 14 days, 30 days
    const lecture = await prisma.lisanLecture.findUnique({
      where: { id: lecture_id },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    const revisionCount = lecture.revision_count + 1;
    let daysToAdd = 1;
    if (revisionCount === 2) daysToAdd = 3;
    else if (revisionCount === 3) daysToAdd = 7;
    else if (revisionCount === 4) daysToAdd = 14;
    else if (revisionCount >= 5) daysToAdd = 30;

    const nextDate = new Date(date || new Date().toISOString().split("T")[0]);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    const next_revision_date = nextDate.toISOString().split("T")[0];

    // Create revision record
    const revision = await prisma.arabicRevision.create({
      data: {
        lecture_id,
        date: date || new Date().toISOString().split("T")[0],
        understanding,
        confidence,
        struggles,
        next_revision_date,
      },
    });

    // Update lecture revision count and next date
    await prisma.lisanLecture.update({
      where: { id: lecture_id },
      data: {
        revision_count: revisionCount,
        last_revision_date: date || new Date().toISOString().split("T")[0],
        next_revision_date,
      },
    });

    return NextResponse.json({ revision });
  } catch (error) {
    console.error("Error creating revision:", error);
    return NextResponse.json({ error: "Failed to create revision" }, { status: 500 });
  }
}
