import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PRACTICE_ALLOWED_FIELDS = {
  status: true, score: true, notes: true, user_answer: true, is_correct: true,
};

const VALID_STATUSES = ["not_started", "in_progress", "completed"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lectureId");

    if (!lectureId) {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }

    const exercises = await prisma.arabicPractice.findMany({
      where: { lecture_id: lectureId },
      orderBy: { exercise_number: "asc" },
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("Error fetching practice exercises:", error);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;

    if (id) {
      const safeData: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(rawData)) {
        if (PRACTICE_ALLOWED_FIELDS[key as keyof typeof PRACTICE_ALLOWED_FIELDS] && val !== undefined) safeData[key] = val;
      }
      if (safeData.status && !VALID_STATUSES.includes(safeData.status as string)) {
        return NextResponse.json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
      }
      try {
        const exercise = await prisma.arabicPractice.update({ where: { id }, data: safeData });
        return NextResponse.json({ exercise });
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Record to ")) {
          return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
        }
        throw e;
      }
    }

    const exercise = await prisma.arabicPractice.create({ data: rawData });
    return NextResponse.json({ exercise });
  } catch (error) {
    console.error("Error saving practice exercise:", error);
    return NextResponse.json({ error: "Failed to save exercise" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;

    if (!id) return NextResponse.json({ error: "Exercise ID required" }, { status: 400 });

    const safeData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(rawData)) {
      if (PRACTICE_ALLOWED_FIELDS[key as keyof typeof PRACTICE_ALLOWED_FIELDS] && val !== undefined) safeData[key] = val;
    }
    if (safeData.status && !VALID_STATUSES.includes(safeData.status as string)) {
      return NextResponse.json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    try {
      const exercise = await prisma.arabicPractice.update({ where: { id }, data: safeData });
      return NextResponse.json({ exercise });
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Record to ")) {
        return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Error updating practice exercise:", error);
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      await prisma.arabicPractice.delete({ where: { id } });
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Record to ")) {
        return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting practice exercise:", error);
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}
