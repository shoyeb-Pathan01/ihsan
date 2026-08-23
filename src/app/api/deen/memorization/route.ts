import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ logs: [] });

    const logs = await prisma.quranMemorization.findMany({
      where: { profile_id: profile.id },
      orderBy: { created_at: "desc" },
      take: 30,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Memorization API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const body = await request.json();

    const log = await prisma.quranMemorization.create({
      data: {
        profile_id: profile.id,
        date: body.date,
        surah: body.surah,
        ayah_from: body.ayah_from,
        ayah_to: body.ayah_to,
        is_new: body.is_new,
        confidence: body.confidence,
        mistakes: body.mistakes || 0,
        notes: body.notes,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Memorization POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
