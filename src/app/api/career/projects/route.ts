import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { tasks: true },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
