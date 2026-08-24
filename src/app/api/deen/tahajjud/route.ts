import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ logs: [] });

    const logs = await prisma.tahajjudLog.findMany({
      where: { profile_id: profile.id },
      orderBy: { created_at: "desc" },
      take: 50,
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
    const { date, completed, rakah_count, time, reflection } = body;

    if (!date || typeof date !== "string") return NextResponse.json({ error: "Date required" }, { status: 400 });
    if (typeof completed !== "boolean") return NextResponse.json({ error: "completed must be boolean" }, { status: 400 });
    if (rakah_count !== undefined && (typeof rakah_count !== "number" || rakah_count < 0)) {
      return NextResponse.json({ error: "rakah_count must be a non-negative number" }, { status: 400 });
    }

    const log = await prisma.tahajjudLog.upsert({
      where: { profile_id_date: { profile_id: profile.id, date } },
      update: {
        completed,
        rakah_count: rakah_count ?? 0,
        time: time ?? "",
        reflection: reflection ?? "",
      },
      create: {
        profile_id: profile.id,
        date,
        completed,
        rakah_count: rakah_count ?? 0,
        time: time ?? "",
        reflection: reflection ?? "",
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Tahajjud POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      await prisma.tahajjudLog.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Error && e.message.includes("Record to delete does not exist")) {
        return NextResponse.json({ error: "Log not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Tahajjud DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
