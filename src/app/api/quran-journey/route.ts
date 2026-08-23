import { prisma } from "@/lib/db";
import { getToday, getWeekStart, getWeekEnd, getDaysBetween } from "@/lib/utils";

export async function GET() {
  try {
    const today = getToday();
    const profile = await prisma.profile.findUnique({
      where: { id: "default" },
    });

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const TOTAL_LECTURES = 60;

    const [lectures, readingRecords, memorizationRecords, tahajjudRecords] =
      await Promise.all([
        prisma.lisanLecture.findMany(),
        prisma.quranReading.findMany({
          where: { profile_id: "default", completed: true },
          orderBy: { date: "desc" },
        }),
        prisma.quranMemorization.findMany({
          where: { profile_id: "default" },
        }),
        prisma.tahajjudLog.findMany({
          where: { profile_id: "default", completed: true },
          orderBy: { date: "desc" },
        }),
      ]);

    // 1. Arabic lectures
    const watchedCount = lectures.filter((l) => l.watched).length;
    const avgMastery =
      lectures.length > 0
        ? Math.round(
            lectures.reduce((sum, l) => sum + l.mastery, 0) / lectures.length
          )
        : 0;
    const highMasteryCount = lectures.filter((l) => l.mastery >= 80).length;

    // 2. Reading stats
    let readingStreak = 0;
    if (readingRecords.length > 0) {
      let checkDate = new Date(today);
      const dateSet = new Set(readingRecords.map((r) => r.date));
      while (dateSet.has(checkDate.toISOString().split("T")[0])) {
        readingStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();
    const weekPages = readingRecords
      .filter((r) => r.date >= weekStart && r.date <= weekEnd)
      .reduce((sum, r) => sum + r.pages, 0);
    const totalPages = readingRecords.reduce((sum, r) => sum + r.pages, 0);

    const monthStart = today.slice(0, 7) + "-01";
    const daysElapsedThisMonth =
      getDaysBetween(monthStart, today) + 1;
    const readingDaysThisMonth = new Set(
      readingRecords
        .filter((r) => r.date >= monthStart && r.date <= today)
        .map((r) => r.date)
    ).size;
    const readingConsistency =
      daysElapsedThisMonth > 0
        ? Number((readingDaysThisMonth / daysElapsedThisMonth).toFixed(2))
        : 0;

    // 3. Memorization stats
    const surahsCount = new Set(memorizationRecords.map((r) => r.surah)).size;
    const revisionSessions = memorizationRecords.filter(
      (r) => !r.is_new
    ).length;
    const weakAreas = memorizationRecords.filter((r) => r.confidence < 3);

    // 4. Tahajjud stats
    let tahajjudStreak = 0;
    if (tahajjudRecords.length > 0) {
      let checkDate = new Date(today);
      const dateSet = new Set(tahajjudRecords.map((r) => r.date));
      while (dateSet.has(checkDate.toISOString().split("T")[0])) {
        tahajjudStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    const tahajjudDaysThisMonth = new Set(
      tahajjudRecords
        .filter((r) => r.date >= monthStart && r.date <= today)
        .map((r) => r.date)
    ).size;
    const tahajjudConsistency =
      daysElapsedThisMonth > 0
        ? Number((tahajjudDaysThisMonth / daysElapsedThisMonth).toFixed(2))
        : 0;

    // 5. Pacing
    const lecturesStarted = lectures.filter((l) => l.started_at !== null).length;
    const weeksElapsed =
      Math.max(getDaysBetween(profile.mission_start, today), 1) / 7;
    const lecturesStartedPerWeek = Number(
      (lecturesStarted / weeksElapsed).toFixed(2)
    );
    const lecturesRemaining = TOTAL_LECTURES - lecturesStarted;
    const daysRemaining = getDaysBetween(today, profile.mission_end);
    const estimatedCompletionDay =
      lecturesStartedPerWeek > 0
        ? Math.ceil(lecturesRemaining / lecturesStartedPerWeek) + getDaysBetween(profile.mission_start, today)
        : null;
    const revisionDaysLeft =
      lecturesStartedPerWeek > 0
        ? Math.round(
            daysRemaining - (lecturesRemaining / lecturesStartedPerWeek) * 7
          )
        : null;

    return Response.json({
      arabic: {
        watchedCount,
        totalLectures: TOTAL_LECTURES,
        avgMastery,
        highMasteryCount,
        lectureData: lectures.map((l) => ({
          id: l.lecture_number,
          name: l.title,
          mastery: l.mastery,
          watched: l.watched,
          duration_seconds: l.duration_seconds,
        })),
      },
      reading: {
        currentStreak: readingStreak,
        weekPages,
        totalPages,
        monthlyConsistency: readingConsistency,
      },
      memorization: {
        surahsCount,
        revisionSessions,
        weakAreas: weakAreas.map((r) => ({
          id: r.id,
          surah: r.surah,
          ayah_from: r.ayah_from,
          ayah_to: r.ayah_to,
          confidence: r.confidence,
        })),
      },
      tahajjud: {
        currentStreak: tahajjudStreak,
        monthlyConsistency: tahajjudConsistency,
      },
      pacing: {
        lecturesStarted,
        mission_start: profile.mission_start,
        weeksElapsed: Number(weeksElapsed.toFixed(2)),
        lecturesStartedPerWeek,
        lecturesRemaining,
        daysRemaining,
        estimatedCompletionDay,
        revisionDaysLeft,
      },
    });
  } catch (error) {
    console.error("Quran journey API error:", error);
    return Response.json(
      { error: "Failed to fetch Quran journey data" },
      { status: 500 }
    );
  }
}
