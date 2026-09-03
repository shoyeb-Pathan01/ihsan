import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.ceil((db.getTime() - da.getTime()) / 86400000);
}

function getDayOfWeek(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function getSprintNumber(missionStart: string): number {
  const start = new Date(missionStart + "T00:00:00Z");
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.floor(daysSinceStart / 7) + 1;
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const now = today();
    const dayOfWeek = getDayOfWeek();
    const daysRemaining = profile.mission_end ? Math.max(0, daysBetween(now, profile.mission_end)) : 0;
    const daysElapsed = profile.mission_start ? Math.max(0, daysBetween(profile.mission_start, now)) : 0;
    const sprint = getSprintNumber(profile.mission_start);

    // Get 7-day activity data for dots
    const last7 = lastNDays(7);

    const [
      // Arabic data
      lectures,
      nextRevision,
      // Azure data
      azureTopics,
      azureSessions,
      // Today's activity
      todayReading,
      todayTahajjud,
      todayMemorization,
      todayCommunication,
      // 7-day activity
      readingByDay,
      tahajjudByDay,
      azureActivityByDay,
      arabicActivityByDay,
      reminder,
    ] = await Promise.all([
      // Next lecture to work on (not completed, lowest number)
      prisma.lisanLecture.findFirst({
        where: { status: { not: "completed" } },
        orderBy: { lecture_number: "asc" },
      }),
      // Overdue revision
      prisma.lisanLecture.findFirst({
        where: {
          next_revision_date: { not: null },
          status: { not: "not_started" },
        },
        orderBy: { next_revision_date: "asc" },
      }),
      // Azure topics for activity tracking
      prisma.goalTopic.findMany({
        where: { status: { not: "not_started" } },
        select: { id: true, status: true, updated_at: true },
      }),
      // Azure sessions
      prisma.azureSession.findMany({
        orderBy: { session_number: "asc" },
      }),
      // Today's reading
      prisma.quranReading.findFirst({
        where: { profile_id: profile.id, date: now },
      }),
      // Today's tahajjud
      prisma.tahajjudLog.findFirst({
        where: { profile_id: profile.id, date: now },
      }),
      // Today's memorization
      prisma.quranMemorization.findFirst({
        where: { profile_id: profile.id, date: now },
      }),
      // Today's communication
      prisma.communicationSession.findFirst({
        where: { profile_id: profile.id, date: now },
      }),
      // 7-day reading
      prisma.quranReading.findMany({
        where: { profile_id: profile.id, date: { in: last7 } },
        select: { date: true, pages: true },
      }),
      // 7-day tahajjud
      prisma.tahajjudLog.findMany({
        where: { profile_id: profile.id, date: { in: last7 } },
        select: { date: true, completed: true },
      }),
      // 7-day Azure activity (topics updated in last 7 days)
      prisma.goalTopic.findMany({
        where: {
          status: { not: "not_started" },
          updated_at: { gte: new Date(Date.now() - 7 * 86400000) },
        },
        select: { updated_at: true },
      }),
      // 7-day Arabic activity (lectures completed/learning in last 7 days)
      prisma.lisanLecture.findMany({
        where: {
          status: { not: "not_started" },
          updated_at: { gte: new Date(Date.now() - 7 * 86400000) },
        },
        select: { updated_at: true },
      }),
      prisma.reminder.findFirst({ where: { enabled: true }, orderBy: { created_at: "asc" } }),
    ]);

    // Build 7-day dots
    const careerDots = last7.map((day) => {
      const dayStart = new Date(day + "T00:00:00Z");
      const dayEnd = new Date(day + "T23:59:59Z");
      const hasActivity = azureActivityByDay.some((a) => {
        const d = new Date(a.updated_at);
        return d >= dayStart && d <= dayEnd;
      });
      return { date: day, active: hasActivity };
    });

    const deenDots = last7.map((day) => {
      const dayStart = new Date(day + "T00:00:00Z");
      const dayEnd = new Date(day + "T23:59:59Z");
      const hasReading = readingByDay.some((r) => r.date === day);
      const hasArabic = arabicActivityByDay.some((a) => {
        const d = new Date(a.updated_at);
        return d >= dayStart && d <= dayEnd;
      });
      return { date: day, active: hasReading || hasArabic };
    });

    const careerDaysActive = careerDots.filter((d) => d.active).length;
    const deenDaysActive = deenDots.filter((d) => d.active).length;

    // Find next Azure session
    const nextAzureSession = azureSessions.find((s) => s.status !== "completed");

    // Check for streak risk (azure untouched 2+ days)
    const lastAzureActivity = azureActivityByDay.length > 0
      ? new Date(Math.max(...azureActivityByDay.map((a) => new Date(a.updated_at).getTime())))
      : null;
    const azureDaysSinceActivity = lastAzureActivity
      ? Math.floor((Date.now() - lastAzureActivity.getTime()) / 86400000)
      : 999;
    const azureStreakRisk = azureDaysSinceActivity >= 2;

    // Priority engine: decide what goes in NOW and TODAY'S 3
    const tasks: { type: string; label: string; id: string; done: boolean; priority: number }[] = [];

    // 1. Overdue revision?
    if (nextRevision && nextRevision.next_revision_date && nextRevision.next_revision_date < now) {
      tasks.push({
        type: "revision",
        label: `Revise Lecture ${nextRevision.lecture_number} — ${nextRevision.title}`,
        id: nextRevision.id,
        done: false,
        priority: 1,
      });
    }

    // 2. Deen untouched today AND before Dhuhr?
    const hour = new Date().getHours();
    const deenDone = todayReading || todayTahajjud || todayMemorization;
    if (!deenDone && hour < 13 && lectures) {
      tasks.push({
        type: "arabic",
        label: `Arabic — Lecture ${lectures.lecture_number}: ${lectures.title}`,
        id: lectures.id,
        done: false,
        priority: 2,
      });
    }

    // 3. Azure untouched 2+ days?
    if (azureStreakRisk && nextAzureSession) {
      tasks.push({
        type: "azure",
        label: `Azure Session ${nextAzureSession.session_number} — ${nextAzureSession.title}`,
        id: nextAzureSession.id,
        done: false,
        priority: 3,
      });
    }

    // Fill remaining slots with current work
    if (tasks.length < 3 && lectures) {
      const alreadyHasArabic = tasks.some((t) => t.type === "arabic");
      if (!alreadyHasArabic) {
        tasks.push({
          type: "arabic",
          label: `Arabic — Lecture ${lectures.lecture_number}: ${lectures.title}`,
          id: lectures.id,
          done: false,
          priority: 4,
        });
      }
    }
    if (tasks.length < 3 && nextAzureSession) {
      const alreadyHasAzure = tasks.some((t) => t.type === "azure");
      if (!alreadyHasAzure) {
        tasks.push({
          type: "azure",
          label: `Azure Session ${nextAzureSession.session_number} — ${nextAzureSession.title}`,
          id: nextAzureSession.id,
          done: false,
          priority: 5,
        });
      }
    }

    // Tahajjud
    if (tasks.length < 3 && !todayTahajjud) {
      tasks.push({
        type: "tahajjud",
        label: "Tahajjud tonight",
        id: "tahajjud",
        done: false,
        priority: 6,
      });
    }

    // Trim to 3
    const today3 = tasks.slice(0, 3);

    // NOW card
    const nowTask = today3[0] || null;

    // Quick-log state
    const quickLog = {
      readingToday: todayReading ? todayReading.pages : 0,
      tahajjudToday: todayTahajjud ? todayTahajjud.completed : false,
      memorizationToday: todayMemorization ? true : false,
    };

    // Overall stats
    const totalLectures = await prisma.lisanLecture.count();
    const completedLectures = await prisma.lisanLecture.count({ where: { status: "completed" } });
    const totalAzureTopics = await prisma.goalTopic.count();
    const completedAzureTopics = await prisma.goalTopic.count({ where: { status: { not: "not_started" } } });

    const allDone = today3.length > 0 && today3.every((t) => t.done);

    return NextResponse.json({
      profile: { name: profile.name, mission_start: profile.mission_start, mission_end: profile.mission_end },
      dayNumber: daysElapsed + 1,
      dayOfWeek,
      sprint,
      daysRemaining,
      now: nowTask,
      today3,
      quickLog,
      careerDots,
      deenDots,
      careerDaysActive,
      deenDaysActive,
      azureStreakRisk,
      reminder: reminder ? { text: reminder.text, source_type: reminder.source_type, reference: reminder.reference } : null,
      arabicProgress: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0,
      azureProgress: totalAzureTopics > 0 ? Math.round((completedAzureTopics / totalAzureTopics) * 100) : 0,
      allDone,
    });
  } catch (error) {
    console.error("Today API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
