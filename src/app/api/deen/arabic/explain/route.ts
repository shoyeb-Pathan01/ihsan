import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lecture_id, prompt, understanding, confidence, notes } = body;

    if (!lecture_id || typeof lecture_id !== "string") {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }
    if (understanding !== undefined && (typeof understanding !== "number" || understanding < 1 || understanding > 5)) {
      return NextResponse.json({ error: "understanding must be between 1 and 5" }, { status: 400 });
    }
    if (confidence !== undefined && (typeof confidence !== "number" || confidence < 1 || confidence > 5)) {
      return NextResponse.json({ error: "confidence must be between 1 and 5" }, { status: 400 });
    }

    const session = await prisma.arabicExplainIt.create({
      data: {
        lecture_id,
        prompt: prompt ?? "",
        understanding: understanding ?? 3,
        confidence: confidence ?? 3,
        notes: notes ?? "",
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating explain session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      await prisma.arabicExplainIt.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Error && e.message.includes("Record to delete does not exist")) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting explain session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
