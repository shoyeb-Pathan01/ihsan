import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

interface Schedule {
  azureBlock: string;  // "19:00-21:00"
  arabicBlock: string; // "21:00-23:00"
  mvd: string[];       // ["1 ayah reading", "1 revision card review"]
}

function getLocalNow(): Date {
  // Asia/Kolkata = UTC+5:30
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

function formatTime(d: Date): string {
  return d.toTimeString().slice(0, 5); // "HH:MM"
}

function parseBlock(block: string): { start: number; end: number } {
  const [s, e] = block.split("-");
  const [sh, sm] = s.split(":").map(Number);
  const [eh, em] = e.split(":").map(Number);
  return { start: sh * 60 + sm, end: eh * 60 + em };
}

function isInRange(minutes: number, start: number, end: number): boolean {
  if (start <= end) {
    return minutes >= start && minutes < end;
  }
  // Overnight block (e.g., 23:00-02:00)
  return minutes >= start || minutes < end;
}

function today(): string {
  return getLocalNow().toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.ceil((db.getTime() - da.getTime()) / 86400000);
}

function getDayOfWeek(): string {
  return getLocalNow().toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" });
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

function parseSchedule(raw: string | null): Schedule {
  const defaults: Schedule = {
    azureBlock: "19:00-21:00",
    arabicBlock: "21:00-23:00",
    mvd: ["1 ayah reading", "1 revision card review"],
  };
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const schedule = parseSchedule(profile.schedule);
    const localNow = getLocalNow();
    const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
    const currentTime = formatTime(localNow);
    const now = today();
    const dayOfWeek = getDayOfWeek();
    const daysRemaining = profile.mission_end ? Math.max(0, daysBetween(now, profile.mission_end)) : 0;
    const daysElapsed = profile.mission_start ? Math.max(0, daysBetween(profile.mission_start, now)) : 0;
    const sprint = getSprintNumber(profile.mission_start);

    // Determine which block we're in
    const azureWindow = parseBlock(schedule.azureBlock);
    const arabicWindow = parseBlock(schedule.arabicBlock);

    const inAzureBlock = isInRange(currentMinutes, azureWindow.start, azureWindow.end);
    const inArabicBlock = isInRange(currentMinutes, arabicWindow.start, arabicWindow.end);

    // Wind-down: after arabic block ends (11 PM) until midnight
    const arabicEndMinutes = arabicWindow.end;
    const isWindDown = currentMinutes >= arabicEndMinutes || currentMinutes < azureWindow.start;

    // Get 7-day activity data for dots
    const last7 = lastNDays(7);

    const [
      lectures,
      nextRevision,
      azureSessions,
      todayReading,
      todayTahajjud,
      todayMemorization,
      readingByDay,
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
      // 7-day reading
      prisma.quranReading.findMany({
        where: { profile_id: profile.id, date: { in: last7 } },
        select: { date: true, pages: true },
      }),
      // 7-day Azure activity
      prisma.goalTopic.findMany({
        where: {
          status: { not: "not_started" },
          updated_at: { gte: new Date(Date.now() - 7 * 86400000) },
        },
        select: { updated_at: true },
      }),
      // 7-day Arabic activity
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

    // Find current Azure session (first not completed)
    const nextAzureSession = azureSessions.find((s) => s.status !== "completed");

    // Azure session done = no more sessions left
    const todayAzureDone = !nextAzureSession;

    // Check if today's Arabic lecture is done
    const todayArabicDone = !lectures || lectures.status === "completed";

    // Check overdue revision
    const isOverdue = nextRevision && nextRevision.next_revision_date && nextRevision.next_revision_date < now;
    const overdueDays = isOverdue
      ? Math.floor((new Date(now).getTime() - new Date(nextRevision.next_revision_date!).getTime()) / 86400000)
      : 0;

    // Build task list based on time-aware priority rules
    const tasks: { type: string; label: string; id: string; done: boolean; reason: string }[] = [];

    // RULE 1: Overdue revision → recommend ANY time of day
    if (isOverdue && nextRevision) {
      tasks.push({
        type: "revision",
        label: `Revise Lecture ${nextRevision.lecture_number} — ${nextRevision.title}`,
        id: nextRevision.id,
        done: false,
        reason: `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}`,
      });
    }

    // RULE 2: Time-aware block recommendations
    if (inAzureBlock && !todayAzureDone && nextAzureSession) {
      tasks.push({
        type: "azure",
        label: `Azure Session ${nextAzureSession.session_number} — ${nextAzureSession.title}`,
        id: nextAzureSession.id,
        done: false,
        reason: `Azure block active (${schedule.azureBlock})`,
      });
    }

    if (inArabicBlock && !todayArabicDone && lectures) {
      tasks.push({
        type: "arabic",
        label: `Arabic — Lecture ${lectures.lecture_number}: ${lectures.title}`,
        id: lectures.id,
        done: false,
        reason: `Arabic block active (${schedule.arabicBlock})`,
      });
    }

    // RULE 3: Outside blocks (7 AM - 7 PM) → no new content push, only quick-log + MVD
    // RULE 4: Wind-down (after 11 PM) → no new suggestions, only tomorrow preview

    // Fill TODAY'S 3 if we have room (max 3)
    if (tasks.length < 3 && !todayAzureDone && nextAzureSession) {
      const alreadyHasAzure = tasks.some((t) => t.type === "azure");
      if (!alreadyHasAzure) {
        tasks.push({
          type: "azure",
          label: `Azure Session ${nextAzureSession.session_number} — ${nextAzureSession.title}`,
          id: nextAzureSession.id,
          done: false,
          reason: "Today's Azure session",
        });
      }
    }

    if (tasks.length < 3 && !todayArabicDone && lectures) {
      const alreadyHasArabic = tasks.some((t) => t.type === "arabic");
      if (!alreadyHasArabic) {
        tasks.push({
          type: "arabic",
          label: `Arabic — Lecture ${lectures.lecture_number}: ${lectures.title}`,
          id: lectures.id,
          done: false,
          reason: "Today's Arabic lecture",
        });
      }
    }

    if (tasks.length < 3 && !todayTahajjud) {
      tasks.push({
        type: "tahajjud",
        label: "Tahajjud tonight",
        id: "tahajjud",
        done: false,
        reason: "Deen habit",
      });
    }

    const today3 = tasks.slice(0, 3);
    const allDone = today3.length > 0 && today3.every((t) => t.done);

    // NOW recommendation with reason
    let nowRecommendation = null;
    if (allDone) {
      nowRecommendation = {
        label: "Aaj ka kaam mukammal.",
        reason: "Bonus: extra reading if you wish.",
        type: "rest",
      };
    } else if (isWindDown) {
      nowRecommendation = {
        label: "Wind down mode.",
        reason: "No new content. Review what you did today.",
        type: "winddown",
      };
    } else if (today3.length > 0) {
      const next = today3[0];
      const relevantWindow = next.type === "azure" ? azureWindow : arabicWindow;
      const minsSinceBlockStart = currentMinutes - relevantWindow.start;
      const timeContext = minsSinceBlockStart > 0 ? ` started ${minsSinceBlockStart} min ago` : ` starts in ${Math.abs(minsSinceBlockStart)} min`;
      nowRecommendation = {
        label: next.label,
        reason: next.reason + (inAzureBlock || inArabicBlock ? timeContext : ""),
        type: next.type,
        id: next.id,
      };
    }

    // Block status for header
    let blockStatus: "azure" | "arabic" | "outside" | "winddown" = "outside";
    let blockLabel = "";
    if (inAzureBlock) {
      blockStatus = "azure";
      blockLabel = `Azure block active now (${schedule.azureBlock})`;
    } else if (inArabicBlock) {
      blockStatus = "arabic";
      blockLabel = `Arabic block active now (${schedule.arabicBlock})`;
    } else if (isWindDown) {
      blockStatus = "winddown";
      blockLabel = "Wind down mode";
    } else {
      // Calculate when next block starts
      const azureStart = azureWindow.start;
      const arabicStart = arabicWindow.start;
      const minsUntilAzure = azureStart - currentMinutes;
      const minsUntilArabic = arabicStart - currentMinutes;

      if (minsUntilAzure > 0 && minsUntilAzure < minsUntilArabic) {
        blockLabel = `Azure block at ${schedule.azureBlock.split("-")[0]}`;
      } else if (minsUntilArabic > 0) {
        blockLabel = `Arabic block at ${schedule.arabicBlock.split("-")[0]}`;
      } else {
        blockLabel = "Outside study blocks";
      }
    }

    // Next step suggestion (for post-completion loop)
    let nextStep = null;
    if (today3.length > 0) {
      const currentTask = today3[0];
      if (currentTask.type === "azure" && nextAzureSession) {
        const nextSess = azureSessions.find((s) => s.status !== "completed" && s.id !== currentTask.id);
        if (nextSess) {
          nextStep = {
            label: `Next: Azure Session ${nextSess.session_number}`,
            href: `/azure/${nextSess.id}`,
          };
        }
      }
      if (currentTask.type === "arabic" && lectures) {
        nextStep = {
          label: `Next: Lecture ${lectures.lecture_number + 1}`,
          href: `/arabic/lec_${lectures.lecture_number + 1}`,
        };
      }
    }

    // Quick-log state
    const quickLog = {
      readingToday: todayReading ? todayReading.pages : 0,
      tahajjudToday: todayTahajjud ? todayTahajjud.completed : false,
    };

    // Effort weighting: calculate honest daily score
    const EFFORT_WEIGHTS: Record<string, number> = {
      tahajjud: 3,       // High effort
      memorization: 3,   // High effort
      azure: 2,          // Medium effort
      arabic: 2,         // Medium effort (watching)
      revision: 2,       // Medium effort
      reading: 1,        // Low effort
      book: 1,           // Low effort (marking stage)
      lecture_notes: 1,  // Low effort (marking stage)
      quranic_examples: 1, // Low effort (marking stage)
    };

    let totalEffort = 0;
    let maxEffort = 0;
    const effortBreakdown: string[] = [];

    // Check what was done today
    if (todayTahajjud?.completed) {
      totalEffort += EFFORT_WEIGHTS.tahajjud;
      effortBreakdown.push("tahajjud");
    }
    if (todayMemorization) {
      totalEffort += EFFORT_WEIGHTS.memorization;
      effortBreakdown.push("memorization");
    }
    if (todayReading) {
      totalEffort += EFFORT_WEIGHTS.reading;
      effortBreakdown.push("reading");
    }

    // Check Azure/Arabic progress today
    if (nextAzureSession) {
      maxEffort += EFFORT_WEIGHTS.azure;
      // If azure was worked on today (would need to track this)
    }
    if (lectures) {
      maxEffort += EFFORT_WEIGHTS.arabic;
    }
    maxEffort += EFFORT_WEIGHTS.tahajjud + EFFORT_WEIGHTS.memorization + EFFORT_WEIGHTS.reading;

    // Normalize effort score (0-100)
    const effortScore = maxEffort > 0 ? Math.round((totalEffort / maxEffort) * 100) : 0;

    // Determine if it's a "light day" (only low-effort tasks done)
    const hasHighEffort = effortBreakdown.includes("tahajjud") || effortBreakdown.includes("memorization");
    const hasMediumEffort = effortBreakdown.includes("azure") || effortBreakdown.includes("arabic") || effortBreakdown.includes("revision");
    const isLightDay = totalEffort > 0 && !hasHighEffort && !hasMediumEffort;

    // Overall stats
    const totalLectures = await prisma.lisanLecture.count();
    const completedLectures = await prisma.lisanLecture.count({ where: { status: "completed" } });
    const totalAzureTopics = await prisma.goalTopic.count();
    const completedAzureTopics = await prisma.goalTopic.count({ where: { status: { not: "not_started" } } });

    return NextResponse.json({
      profile: { name: profile.name, mission_start: profile.mission_start, mission_end: profile.mission_end },
      dayNumber: daysElapsed + 1,
      dayOfWeek,
      sprint,
      daysRemaining,
      currentTime,
      blockStatus,
      blockLabel,
      schedule,
      nowRecommendation,
      today3,
      quickLog,
      effort: {
        score: effortScore,
        isLightDay,
        breakdown: effortBreakdown,
      },
      careerDots,
      deenDots,
      careerDaysActive,
      deenDaysActive,
      reminder: reminder ? { text: reminder.text, source_type: reminder.source_type, reference: reminder.reference } : null,
      arabicProgress: totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0,
      azureProgress: totalAzureTopics > 0 ? Math.round((completedAzureTopics / totalAzureTopics) * 100) : 0,
      allDone,
      nextStep,
    });
  } catch (error) {
    console.error("Today API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
