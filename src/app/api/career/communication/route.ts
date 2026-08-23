import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ sessions: [] });

    const sessions = await prisma.communicationSession.findMany({
      where: { profile_id: profile.id },
      orderBy: { created_at: "desc" },
      take: 20,
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

    const session = await prisma.communicationSession.create({
      data: {
        profile_id: profile.id,
        date: body.date,
        practice_type: body.practice_type,
        duration_minutes: body.duration_minutes,
        topic: body.topic,
        confidence_score: body.confidence_score,
        clarity_score: body.clarity_score,
        fluency_score: body.fluency_score,
        notes: body.notes,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Communication POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
