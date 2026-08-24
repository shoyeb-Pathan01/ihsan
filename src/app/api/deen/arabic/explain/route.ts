import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/deen/arabic/explain - Get explain sessions for a lecture
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lectureId");

    if (!lectureId) {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }

    const sessions = await prisma.arabicExplainIt.findMany({
      where: { lecture_id: lectureId },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching explain sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// POST /api/deen/arabic/explain - Create explain session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lecture_id, prompt, understanding, confidence, notes } = body;

    if (!lecture_id) {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }

    const session = await prisma.arabicExplainIt.create({
      data: {
        lecture_id,
        prompt,
        understanding,
        confidence,
        notes,
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating explain session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
