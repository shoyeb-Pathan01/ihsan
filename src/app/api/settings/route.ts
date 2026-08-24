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
    const { name, mission_start, mission_end, baseline_azure, baseline_arabic, baseline_comm } = body;

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "name must be a string" }, { status: 400 });
    }
    if (mission_start !== undefined && typeof mission_start !== "string") {
      return NextResponse.json({ error: "mission_start must be a string (YYYY-MM-DD)" }, { status: 400 });
    }
    if (mission_end !== undefined && typeof mission_end !== "string") {
      return NextResponse.json({ error: "mission_end must be a string (YYYY-MM-DD)" }, { status: 400 });
    }
    if (mission_start && mission_end && mission_end <= mission_start) {
      return NextResponse.json({ error: "mission_end must be after mission_start" }, { status: 400 });
    }
    for (const [label, val] of [["baseline_azure", baseline_azure], ["baseline_arabic", baseline_arabic], ["baseline_comm", baseline_comm]]) {
      if (val !== undefined && (typeof val !== "number" || val < 1 || val > 5)) {
        return NextResponse.json({ error: `${label} must be between 1 and 5` }, { status: 400 });
      }
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(name !== undefined && { name }),
        ...(mission_start !== undefined && { mission_start }),
        ...(mission_end !== undefined && { mission_end }),
        ...(baseline_azure !== undefined && { baseline_azure }),
        ...(baseline_arabic !== undefined && { baseline_arabic }),
        ...(baseline_comm !== undefined && { baseline_comm }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
