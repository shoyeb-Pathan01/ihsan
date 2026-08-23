import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.ceil((db.getTime() - da.getTime()) / 86400000);
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET() {
  try {
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      profile = await prisma.profile.create({ data: {} });
    }

    const now = today();
    const daysRemaining = Math.max(0, daysBetween(now, profile.mission_end));
    const dayNumber = Math.max(1, 60 - daysRemaining);

    const todayTasks = await prisma.dailyTask.count({
      where: { profile_id: profile.id, date: now },
    });

    const totalSessions = await prisma.azureSession.count();
    const completedSessions = await prisma.azureSession.count({
      where: { status: "completed" },
    });

    const totalPracticals = await prisma.azurePractical.count();
    const completedPracticals = await prisma.azurePractical.count({
      where: { status: "completed" },
    });

    const totalTopics = await prisma.goalTopic.count();
    const completedTopics = await prisma.goalTopic.count({
      where: { status: { not: "not_started" } },
    });

    const totalLectures = await prisma.lisanLecture.count();
    const watchedLectures = await prisma.lisanLecture.count({
      where: { watched: true },
    });

    const readingPages = await prisma.quranReading.aggregate({
      _sum: { pages: true },
      where: { profile_id: profile.id },
    });

    const memorizationAyahs = await prisma.quranMemorization.aggregate({
      _sum: { ayah_to: true },
      where: { profile_id: profile.id, is_new: true },
    });

    const tahajjudNights = await prisma.tahajjudLog.count({
      where: { profile_id: profile.id, completed: true },
    });

    const communicationSessions = await prisma.communicationSession.count({
      where: { profile_id: profile.id },
    });

    const projects = await prisma.project.count();

    const hasActivity =
      completedSessions > 0 ||
      watchedLectures > 0 ||
      (readingPages._sum.pages ?? 0) > 0 ||
      tahajjudNights > 0 ||
      communicationSessions > 0;

    const azureProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const arabicProgress = totalLectures > 0 ? Math.round((watchedLectures / totalLectures) * 100) : 0;

    const reminder = await prisma.reminder.findFirst({
      where: { enabled: true },
      orderBy: { created_at: "asc" },
    });

    return NextResponse.json({
      profile: {
        name: profile.name,
        mission_start: profile.mission_start,
        mission_end: profile.mission_end,
        baseline_azure: profile.baseline_azure,
        baseline_arabic: profile.baseline_arabic,
        baseline_comm: profile.baseline_comm,
      },
      daysRemaining,
      dayNumber,
      hasActivity,
      careerProgress: {
        azure: azureProgress,
        communication: communicationSessions,
        projects,
      },
      deenProgress: {
        arabic: arabicProgress,
        reading: readingPages._sum.pages ?? 0,
        memorization: memorizationAyahs._sum.ayah_to ?? 0,
        tahajjud: tahajjudNights,
      },
      todayFocus: null,
      reminder: reminder
        ? { text: reminder.text, source_type: reminder.source_type, reference: reminder.reference }
        : null,
    });
  } catch (error) {
    console.error("Home API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
