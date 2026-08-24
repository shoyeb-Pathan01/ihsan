import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/deen/arabic/examples - Get examples for a lecture
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

// POST /api/deen/arabic/examples - Create or update example
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (id) {
      const example = await prisma.arabicExample.update({
        where: { id },
        data,
      });
      return NextResponse.json({ example });
    }

    const example = await prisma.arabicExample.create({
      data,
    });
    return NextResponse.json({ example });
  } catch (error) {
    console.error("Error saving example:", error);
    return NextResponse.json({ error: "Failed to save example" }, { status: 500 });
  }
}

// DELETE /api/deen/arabic/examples - Delete example
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Example ID required" }, { status: 400 });
    }

    await prisma.arabicExample.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting example:", error);
    return NextResponse.json({ error: "Failed to delete example" }, { status: 500 });
  }
}
