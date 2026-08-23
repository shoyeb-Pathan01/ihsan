import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getToday } from "@/lib/utils";

export async function GET() {
  try {
    const today = getToday();
    const tasks = await prisma.dailyTask.findMany({
      where: { profile_id: "default", date: today },
      orderBy: [{ is_must_do: "desc" }, { created_at: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, category, xp_value, is_must_do } = await request.json();

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    const today = getToday();

    const task = await prisma.dailyTask.create({
      data: {
        profile_id: "default",
        date: today,
        title,
        category,
        xp_value: xp_value || 5,
        is_must_do: is_must_do || false,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating daily task:", error);
    return NextResponse.json(
      { error: "Failed to create daily task" },
      { status: 500 }
    );
  }
}