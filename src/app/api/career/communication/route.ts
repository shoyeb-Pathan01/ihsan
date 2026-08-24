import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const VALID_PRACTICE_TYPES = ["shadowing", "role_play", "discussion", "presentation", "freestyle"];

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ sessions: [] });

    const sessions = await prisma.communicationSession.findMany({
      where: { profile_id: profile.id },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Communication API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const body = await request.json();
    const { date, practice_type, duration_minutes, topic, confidence_score, clarity_score, fluency_score, notes } = body;

    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "Date required (YYYY-MM-DD)" }, { status: 400 });
    }
    if (!practice_type || !VALID_PRACTICE_TYPES.includes(practice_type)) {
      return NextResponse.json({ error: `Practice type must be one of: ${VALID_PRACTICE_TYPES.join(", ")}` }, { status: 400 });
    }
    if (duration_minutes !== undefined && (typeof duration_minutes !== "number" || duration_minutes < 0)) {
      return NextResponse.json({ error: "duration_minutes must be a non-negative number" }, { status: 400 });
    }
    for (const score of [confidence_score, clarity_score, fluency_score]) {
      if (score !== undefined && (typeof score !== "number" || score < 1 || score > 5)) {
        return NextResponse.json({ error: "Scores must be numbers between 1 and 5" }, { status: 400 });
      }
    }

    const session = await prisma.communicationSession.create({
      data: {
        profile_id: profile.id,
        date,
        practice_type,
        duration_minutes: duration_minutes ?? 0,
        topic: topic ?? "",
        confidence_score: confidence_score ?? 3,
        clarity_score: clarity_score ?? 3,
        fluency_score: fluency_score ?? 3,
        notes: notes ?? "",
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Communication POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      await prisma.communicationSession.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Error && e.message.includes("Record to delete does not exist")) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Communication DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
