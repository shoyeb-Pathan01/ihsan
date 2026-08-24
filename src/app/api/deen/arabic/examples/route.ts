import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EXAMPLE_ALLOWED_FIELDS = {
  lecture_id: true, arabic_text: true, translation: true,
  grammar_note: true, category: true,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lectureId");

    if (!lectureId) {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }

    const examples = await prisma.arabicExample.findMany({
      where: { lecture_id: lectureId },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ examples });
  } catch (error) {
    console.error("Error fetching examples:", error);
    return NextResponse.json({ error: "Failed to fetch examples" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;

    const safeData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(rawData)) {
      if (EXAMPLE_ALLOWED_FIELDS[key as keyof typeof EXAMPLE_ALLOWED_FIELDS] && val !== undefined) safeData[key] = val;
    }

    if (!safeData.lecture_id) {
      return NextResponse.json({ error: "lecture_id required" }, { status: 400 });
    }

    if (id) {
      try {
        const example = await prisma.arabicExample.update({ where: { id }, data: safeData });
        return NextResponse.json({ example });
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Record to ")) {
          return NextResponse.json({ error: "Example not found" }, { status: 404 });
        }
        throw e;
      }
    }

    const example = await prisma.arabicExample.create({ data: safeData as never });
    return NextResponse.json({ example });
  } catch (error) {
    console.error("Error saving example:", error);
    return NextResponse.json({ error: "Failed to save example" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Example ID required" }, { status: 400 });

    try {
      await prisma.arabicExample.delete({ where: { id } });
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Record to ")) {
        return NextResponse.json({ error: "Example not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting example:", error);
    return NextResponse.json({ error: "Failed to delete example" }, { status: 500 });
  }
}
