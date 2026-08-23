import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ logs: [] });

    const logs = await prisma.tahajjudLog.findMany({
      where: { profile_id: profile.id },
      orderBy: { created_at: "desc" },
      take: 30,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Tahajjud API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const body = await request.json();

    const log = await prisma.tahajjudLog.upsert({
      where: { profile_id_date: { profile_id: profile.id, date: body.date } },
      update: {
        completed: body.completed,
        rakah_count: body.rakah_count,
        time: body.time,
        reflection: body.reflection,
      },
      create: {
        profile_id: profile.id,
        date: body.date,
        completed: body.completed,
        rakah_count: body.rakah_count,
        time: body.time,
        reflection: body.reflection,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Tahajjud POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
