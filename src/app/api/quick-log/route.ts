import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(request: Request) {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const body = await request.json();
    const { type, value } = body;
    const now = today();

    if (type === "reading") {
      // value = number of pages
      const pages = parseInt(value) || 0;
      if (pages <= 0) return NextResponse.json({ error: "Invalid pages" }, { status: 400 });

      // Upsert: if today's reading exists, add to it
      const existing = await prisma.quranReading.findFirst({
        where: { profile_id: profile.id, date: now },
      });

      if (existing) {
        await prisma.quranReading.update({
          where: { id: existing.id },
          data: { pages: existing.pages + pages },
        });
      } else {
        await prisma.quranReading.create({
          data: { profile_id: profile.id, date: now, surah: "Qur'an", pages },
        });
      }

      return NextResponse.json({ success: true, pages });
    }

    if (type === "tahajjud") {
      // Toggle tahajjud for today
      const existing = await prisma.tahajjudLog.findFirst({
        where: { profile_id: profile.id, date: now },
      });

      if (existing) {
        await prisma.tahajjudLog.update({
          where: { id: existing.id },
          data: { completed: !existing.completed },
        });
        return NextResponse.json({ success: true, completed: !existing.completed });
      } else {
        await prisma.tahajjudLog.create({
          data: { profile_id: profile.id, date: now, completed: true },
        });
        return NextResponse.json({ success: true, completed: true });
      }
    }

    if (type === "memorization") {
      // Toggle memorization for today
      const existing = await prisma.quranMemorization.findFirst({
        where: { profile_id: profile.id, date: now },
      });

      if (existing) {
        // Already logged, do nothing special
        return NextResponse.json({ success: true, logged: true });
      } else {
        await prisma.quranMemorization.create({
          data: {
            profile_id: profile.id,
            date: now,
            surah: "Review",
            ayah_from: 0,
            ayah_to: 0,
            is_new: false,
            confidence: 3,
          },
        });
        return NextResponse.json({ success: true, logged: true });
      }
    }

    if (type === "task_done") {
      // Mark a task as done (azure session or arabic lecture)
      const { taskType, id } = body;

      if (taskType === "azure") {
        await prisma.azureSession.update({
          where: { id },
          data: { status: "completed", completed_at: new Date() },
        });
      }

      if (taskType === "arabic") {
        await prisma.lisanLecture.update({
          where: { id },
          data: { status: "completed", completed_at: new Date() },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Quick log error:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}
