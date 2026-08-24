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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, objective, status } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        objective: objective ?? "",
        status: status ?? "not_started",
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Projects POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const allowedFields: Record<string, boolean> = { name: true, objective: true, status: true, completion_pct: true, notes: true };
    const safeData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data)) {
      if (allowedFields[key]) safeData[key] = val;
    }

    try {
      const project = await prisma.project.update({ where: { id }, data: safeData });
      return NextResponse.json({ project });
    } catch (e) {
      if (e instanceof Error && e.message.includes("Record to update does not exist")) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Projects PATCH error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      await prisma.project.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Error && e.message.includes("Record to delete does not exist")) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Projects DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
