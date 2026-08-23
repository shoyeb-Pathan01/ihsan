import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ logs: [] });

    const logs = await prisma.quranReading.findMany({
      where: { profile_id: profile.id },
      orderBy: { created_at: "desc" },
      take: 30,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Reading API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const body = await request.json();

    const log = await prisma.quranReading.create({
      data: {
        profile_id: profile.id,
        date: body.date,
        surah: body.surah,
        ayah_from: body.ayah_from,
        ayah_to: body.ayah_to,
        pages: body.pages || 1,
        duration_minutes: body.duration_minutes,
        reflection: body.reflection,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Reading POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
