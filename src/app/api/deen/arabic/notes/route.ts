import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const NOTE_ALLOWED_FIELDS = {
  lecture_id: true, topic: true, arabic_term: true, meaning: true,
  examples: true, my_understanding: true, category: true,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lectureId");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (lectureId) where.lecture_id = lectureId;
    if (category) where.category = category;

    const notes = await prisma.arabicNote.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: { lecture: true },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;

    const safeData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(rawData)) {
      if (NOTE_ALLOWED_FIELDS[key as keyof typeof NOTE_ALLOWED_FIELDS] && val !== undefined) safeData[key] = val;
    }

    if (!safeData.lecture_id) {
      return NextResponse.json({ error: "lecture_id required" }, { status: 400 });
    }

    if (id) {
      try {
        const note = await prisma.arabicNote.update({ where: { id }, data: safeData });
        return NextResponse.json({ note });
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Record to ")) {
          return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }
        throw e;
      }
    }

    const note = await prisma.arabicNote.create({ data: safeData as never });
    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Note ID required" }, { status: 400 });

    try {
      await prisma.arabicNote.delete({ where: { id } });
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Record to ")) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
