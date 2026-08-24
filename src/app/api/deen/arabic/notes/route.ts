import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/deen/arabic/notes - Get notes for a lecture or all notes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lectureId");
    const category = searchParams.get("category");

    const where: any = {};
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

// POST /api/deen/arabic/notes - Create or update note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (id) {
      const note = await prisma.arabicNote.update({
        where: { id },
        data,
      });
      return NextResponse.json({ note });
    }

    const note = await prisma.arabicNote.create({
      data,
    });
    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}

// DELETE /api/deen/arabic/notes - Delete note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    await prisma.arabicNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
