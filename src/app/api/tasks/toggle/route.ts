import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getToday } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();
    const today = getToday();

    const task = await prisma.dailyTask.findUnique({ where: { id: taskId } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const newCompleted = !task.completed;

    await prisma.dailyTask.update({
      where: { id: taskId },
      data: { completed: newCompleted },
    });

    // Award XP if completing
    if (newCompleted && task.xp_value > 0) {
      await prisma.xPTransaction.create({
        data: {
          profile_id: task.profile_id,
          amount: task.xp_value,
          source: task.category === "azure" ? "azure_topic" : task.category === "arabic" ? "arabic_topic" : "daily_bonus",
          description: task.title,
          date: today,
        },
      });

      // Update streak
      const streak = await prisma.streak.findFirst({
        where: { profile_id: task.profile_id, category: "overall" },
      });

      if (streak) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newStreak = streak.current_streak;
        if (streak.last_active_date === today) {
          // Already active today, no change
        } else if (streak.last_active_date === yesterdayStr) {
          newStreak = streak.current_streak + 1;
        } else {
          newStreak = 1;
        }

        await prisma.streak.update({
          where: { id: streak.id },
          data: {
            current_streak: newStreak,
            best_streak: Math.max(streak.best_streak, newStreak),
            last_active_date: today,
          },
        });
      }
    }

    return NextResponse.json({ success: true, completed: newCompleted });
  } catch (error) {
    console.error("Error toggling task:", error);
    return NextResponse.json({ error: "Failed to toggle task" }, { status: 500 });
  }
}
