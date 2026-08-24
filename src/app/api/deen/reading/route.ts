import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ logs: [] });

    const logs = await prisma.quranReading.findMany({
      where: { profile_id: profile.id },
      orderBy: { created_at: "desc" },
      take: 50,
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
    const { date, surah, ayah_from, ayah_to, pages, duration_minutes, reflection } = body;

    if (!date || typeof date !== "string") return NextResponse.json({ error: "Date required" }, { status: 400 });
    if (!surah || typeof surah !== "string") return NextResponse.json({ error: "Surah required" }, { status: 400 });
    if (typeof ayah_from !== "number" || ayah_from < 1) return NextResponse.json({ error: "ayah_from must be a positive number" }, { status: 400 });
    if (typeof ayah_to !== "number" || ayah_to < ayah_from) return NextResponse.json({ error: "ayah_to must be >= ayah_from" }, { status: 400 });

    const log = await prisma.quranReading.create({
      data: {
        profile_id: profile.id,
        date,
        surah,
        ayah_from,
        ayah_to,
        pages: pages ?? 1,
        duration_minutes: duration_minutes ?? 0,
        reflection: reflection ?? "",
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Reading POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      await prisma.quranReading.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Error && e.message.includes("Record to delete does not exist")) {
        return NextResponse.json({ error: "Log not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reading DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
