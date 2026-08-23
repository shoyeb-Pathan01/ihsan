import { prisma } from "@/lib/db";
import {
  getToday,
  getDaysBetween,
  getWeekStart,
  getWeekEnd,
  getDaysAgo,
  levelFromXP,
} from "@/lib/utils";
import { SEED_REMINDERS } from "@/lib/data/reminders";

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
    const daysRemaining = getDaysBetween(today, profile.mission_end);
    const missionCompleted = today > profile.mission_end;

    const [azureTopics, arabicTopics] = await Promise.all([
      prisma.goalTopic.findMany({
        where: { goal: { category: "azure" } },
      }),
      prisma.goalTopic.findMany({
        where: { goal: { category: "arabic" } },
      }),
    ]);

    const azureProgress =
      azureTopics.length > 0
        ? Math.round(
            azureTopics.reduce((s, t) => s + t.completion_percentage, 0) /
              azureTopics.length,
          )
        : 0;

    const arabicProgress =
      arabicTopics.length > 0
        ? Math.round(
            arabicTopics.reduce((s, t) => s + t.completion_percentage, 0) /
              arabicTopics.length,
          )
        : 0;

    const overallProgress = Math.round(
      (azureProgress * profile.azure_weight +
        arabicProgress * profile.arabic_weight) /
        (profile.azure_weight + profile.arabic_weight),
    );

    const streaks = await prisma.streak.findMany({
      where: { profile_id: "default" },
    });

    const xpResult = await prisma.xPTransaction.aggregate({
      where: { profile_id: "default" },
      _sum: { amount: true },
    });
    const totalXP = xpResult._sum.amount ?? 0;
    const level = levelFromXP(totalXP);

    const todayTasks = await prisma.dailyTask.findMany({
      where: { profile_id: "default", date: today },
    });

    const todayDate = new Date(today + "T00:00:00.000Z");

    const revisionDue = await prisma.goalTopic.count({
      where: {
        next_revision: { not: null, lte: todayDate },
      },
    });

    let reminder = null;
    const dbReminders = await prisma.reminder.findMany({
      where: { enabled: true },
    });
    const reminderSource =
      dbReminders.length > 0 ? dbReminders : SEED_REMINDERS;
    if (reminderSource.length > 0) {
      const r =
        reminderSource[Math.floor(Math.random() * reminderSource.length)];
      reminder = {
        text_paraphrase: r.text_paraphrase,
        source_type: r.source_type,
        reference: r.reference,
        category: r.category,
      };
    }

    const readingRecords = await prisma.quranReading.findMany({
      where: { profile_id: "default", completed: true },
      orderBy: { date: "desc" },
    });
    let readingStreak = 0;
    if (readingRecords.length > 0) {
      let checkDate = new Date(today);
      for (const rec of readingRecords) {
        const expected = checkDate.toISOString().split("T")[0];
        if (rec.date === expected) {
          readingStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (rec.date < getDaysAgo(readingStreak + 1)) {
          break;
        }
      }
    }

    const tahajjudRecords = await prisma.tahajjudLog.findMany({
      where: { profile_id: "default", completed: true },
      orderBy: { date: "desc" },
    });
    let tahajjudStreak = 0;
    if (tahajjudRecords.length > 0) {
      let checkDate = new Date(today);
      for (const rec of tahajjudRecords) {
        const expected = checkDate.toISOString().split("T")[0];
        if (rec.date === expected) {
          tahajjudStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (rec.date < getDaysAgo(tahajjudStreak + 1)) {
          break;
        }
      }
    }

    const thisWeekStart = getWeekStart();
    const thisWeekEnd = getWeekEnd();
    const communicationSessions = await prisma.communicationLog.count({
      where: {
        profile_id: "default",
        date: { gte: thisWeekStart, lte: thisWeekEnd },
      },
    });

    const memorizationCount = await prisma.quranMemorization.count({
      where: { profile_id: "default" },
    });

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

    const strongest =
      arabicProgress >= azureProgress
        ? { name: "Arabic", value: `${arabicProgress}%` }
        : { name: "Azure", value: `${azureProgress}%` };

    const needsAttention =
      azureProgress <= arabicProgress
        ? { name: "Azure", value: `${azureProgress}%` }
        : { name: "Arabic", value: `${arabicProgress}%` };

    const nextMilestone =
      level.current < level.next
        ? { name: `Level ${level.level + 1}`, remaining: level.next - level.current }
        : { name: "Max Level", remaining: 0 };

    return Response.json({
      dayNumber,
      daysRemaining,
      missionCompleted,
      profile: {
        name: profile.name,
        mission_start: profile.mission_start,
        mission_end: profile.mission_end,
      },
      azureProgress,
      arabicProgress,
      overallProgress,
      streaks: streaks.map((s) => ({
        category: s.category,
        current_streak: s.current_streak,
        best_streak: s.best_streak,
      })),
      totalXP,
      level,
      todayTasks: todayTasks.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        xp_value: t.xp_value,
        completed: t.completed,
        is_must_do: t.is_must_do,
      })),
      revisionDue,
      reminder,
      readingStreak,
      tahajjudStreak,
      communicationSessions,
      memorizationCount,
      consistencyThisWeek,
      consistencyLastWeek,
      consistencyTrend,
      strongest,
      needsAttention,
      nextMilestone,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
