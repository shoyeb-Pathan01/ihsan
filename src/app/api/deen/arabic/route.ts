import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const lectures = await prisma.lisanLecture.findMany({
      orderBy: { lecture_number: "asc" },
    });
    return NextResponse.json({ lectures });
  } catch (error) {
    console.error("Arabic API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, watched } = await request.json();
    await prisma.lisanLecture.update({
      where: { id },
      data: {
        watched,
        started_at: watched ? new Date() : undefined,
        completed_at: watched ? new Date() : undefined,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Arabic PATCH error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
