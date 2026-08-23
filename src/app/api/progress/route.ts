import { prisma } from "@/lib/db";
import {
  getToday,
  getDaysBetween,
  getWeekStart,
  getWeekEnd,
  levelFromXP,
} from "@/lib/utils";

export async function GET() {
  try {
    const today = getToday();

    const profile = await prisma.profile.findUnique({
      where: { id: "default" },
    });

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const dayNumber = getDaysBetween(profile.mission_start, today) + 1;
    const missionCompleted = today > profile.mission_end;

    const [azureTopics, arabicTopics] = await Promise.all([
      prisma.goalTopic.findMany({
        where: { goal: { category: "azure" } },
      }),
      prisma.goalTopic.findMany({
        where: { goal: { category: "arabic" } },
      }),
    ]);

    const azureCompletion =
      azureTopics.length > 0
        ? Math.round(
            azureTopics.reduce((s, t) => s + t.completion_percentage, 0) /
              azureTopics.length,
          )
        : 0;

    const azureMastery =
      azureTopics.length > 0
        ? Math.round(
            azureTopics.reduce((s, t) => s + t.mastery_percentage, 0) /
              azureTopics.length,
          )
        : 0;

    const arabicCompletion =
      arabicTopics.length > 0
        ? Math.round(
            arabicTopics.reduce((s, t) => s + t.completion_percentage, 0) /
              arabicTopics.length,
          )
        : 0;

    const arabicMastery =
      arabicTopics.length > 0
        ? Math.round(
            arabicTopics.reduce((s, t) => s + t.mastery_percentage, 0) /
              arabicTopics.length,
          )
        : 0;

    const overallProgress = Math.round(
      (azureCompletion * profile.azure_weight +
        arabicCompletion * profile.arabic_weight) /
        (profile.azure_weight + profile.arabic_weight),
    );

    const xpResult = await prisma.xPTransaction.aggregate({
      where: { profile_id: "default" },
      _sum: { amount: true },
    });
    const totalXP = xpResult._sum.amount ?? 0;
    const level = levelFromXP(totalXP);

    const streaks = await prisma.streak.findMany({
      where: { profile_id: "default" },
    });

    const badges = await prisma.userBadge.findMany({
      where: { profile_id: "default" },
      orderBy: { unlocked_at: "asc" },
    });

    const thisWeekStart = getWeekStart();
    const thisWeekEnd = getWeekEnd();
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekStart = getWeekStart(lastWeekDate);
    const lastWeekEnd = getWeekEnd(lastWeekDate);

    const [thisWeekTasks, lastWeekTasks] = await Promise.all([
      prisma.dailyTask.findMany({
        where: {
          profile_id: "default",
          completed: true,
          date: { gte: thisWeekStart, lte: thisWeekEnd },
        },
        select: { date: true },
      }),
      prisma.dailyTask.findMany({
        where: {
          profile_id: "default",
          completed: true,
          date: { gte: lastWeekStart, lte: lastWeekEnd },
        },
        select: { date: true },
      }),
    ]);

    const thisWeekDates = new Set(thisWeekTasks.map((t) => t.date));
    const lastWeekDates = new Set(lastWeekTasks.map((t) => t.date));

    const consistencyThisWeek = Number(
      (thisWeekDates.size / 7).toFixed(2),
    );
    const consistencyLastWeek = Number(
      (lastWeekDates.size / 7).toFixed(2),
    );
    const consistencyTrend = Number(
      (consistencyThisWeek - consistencyLastWeek).toFixed(2),
    );

    const weeklyReview = await prisma.weeklyReview.findFirst({
      where: { profile_id: "default" },
      orderBy: { week_start: "desc" },
    });

    return Response.json({
      dayNumber,
      missionCompleted,
      overallProgress,
      azureCompletion,
      azureMastery,
      arabicCompletion,
      arabicMastery,
      totalXP,
      level,
      streaks: streaks.map((s) => ({
        category: s.category,
        current_streak: s.current_streak,
        best_streak: s.best_streak,
      })),
      badges: badges.map((b) => ({
        badge_key: b.badge_key,
        unlocked_at: b.unlocked_at.toISOString(),
      })),
      consistencyThisWeek,
      consistencyLastWeek,
      consistencyTrend,
      weeklyReview: weeklyReview
        ? {
            week_start: weeklyReview.week_start,
            week_end: weeklyReview.week_end,
            azure_progress: weeklyReview.azure_progress ?? 0,
            arabic_progress: weeklyReview.arabic_progress ?? 0,
            tasks_completed: weeklyReview.tasks_completed,
            tasks_missed: weeklyReview.tasks_missed,
            xp_earned: weeklyReview.xp_earned,
            strongest_area: weeklyReview.strongest_area,
            weakest_area: weeklyReview.weakest_area,
            focus_1: weeklyReview.focus_1,
            focus_2: weeklyReview.focus_2,
            focus_3: weeklyReview.focus_3,
          }
        : null,
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return Response.json(
      { error: "Failed to fetch progress data" },
      { status: 500 },
    );
  }
}
