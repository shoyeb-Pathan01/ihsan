import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/deen/arabic/practice - Get practice exercises for a lecture
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

// POST /api/deen/arabic/practice - Create or update practice exercise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (id) {
      const exercise = await prisma.arabicPractice.update({
        where: { id },
        data,
      });
      return NextResponse.json({ exercise });
    }

    const exercise = await prisma.arabicPractice.create({
      data,
    });
    return NextResponse.json({ exercise });
  } catch (error) {
    console.error("Error saving practice exercise:", error);
    return NextResponse.json({ error: "Failed to save exercise" }, { status: 500 });
  }
}

// PATCH /api/deen/arabic/practice - Update practice exercise
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Exercise ID required" }, { status: 400 });
    }

    const exercise = await prisma.arabicPractice.update({
      where: { id },
      data,
    });

    return NextResponse.json({ exercise });
  } catch (error) {
    console.error("Error updating practice exercise:", error);
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}
