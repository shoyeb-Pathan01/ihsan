import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      profile = await prisma.profile.create({ data: {} });
    }

    return NextResponse.json({
      settings: {
        name: profile.name,
        mission_start: profile.mission_start,
        mission_end: profile.mission_end,
        baseline_azure: profile.baseline_azure,
        baseline_arabic: profile.baseline_arabic,
        baseline_comm: profile.baseline_comm,
      },
    });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const body = await request.json();

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        name: body.name,
        mission_start: body.mission_start,
        mission_end: body.mission_end,
        baseline_azure: body.baseline_azure,
        baseline_arabic: body.baseline_arabic,
        baseline_comm: body.baseline_comm,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
