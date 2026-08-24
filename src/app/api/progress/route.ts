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
    const profile = await prisma.profile.findFirst();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });

    const now = today();
    const daysRemaining = profile.mission_end ? Math.max(0, daysBetween(now, profile.mission_end)) : 0;

    const [totalTopics, completedTopics, masteredTopics, totalSessions, completedSessions, totalPracticals, completedPracticals, totalLectures, completedLectures, avgMastery, readingPages, readingDays, memorizationSessions, tahajjudNights, communicationSessions, projects, completedProjects] = await Promise.all([
      prisma.goalTopic.count(),
      prisma.goalTopic.count({ where: { status: { not: "not_started" } } }),
      prisma.goalTopic.count({ where: { status: "mastered" } }),
      prisma.azureSession.count(),
      prisma.azureSession.count({ where: { status: "completed" } }),
      prisma.azurePractical.count(),
      prisma.azurePractical.count({ where: { status: "completed" } }),
      prisma.lisanLecture.count(),
      prisma.lisanLecture.count({ where: { status: "completed" } }),
      prisma.lisanLecture.aggregate({ _avg: { mastery_percentage: true } }),
      prisma.quranReading.aggregate({ _sum: { pages: true }, where: { profile_id: profile.id } }),
      prisma.quranReading.findMany({ where: { profile_id: profile.id }, select: { date: true }, distinct: ["date"] }),
      prisma.quranMemorization.count({ where: { profile_id: profile.id, is_new: true } }),
      prisma.tahajjudLog.count({ where: { profile_id: profile.id, completed: true } }),
      prisma.communicationSession.count({ where: { profile_id: profile.id } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: "completed" } }),
    ]);

    const hasActivity = completedSessions > 0 || completedLectures > 0 || (readingPages._sum.pages ?? 0) > 0 || tahajjudNights > 0 || communicationSessions > 0;

    const azureCompletion = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const azureMastery = totalTopics > 0 ? Math.round(masteredTopics / totalTopics * 100) : 0;

    return NextResponse.json({
      mission_end: profile.mission_end,
      daysRemaining,
      hasActivity,
      career: {
        azure: { completion: azureCompletion, mastery: azureMastery, topicsCompleted: completedTopics, totalTopics, sessionsCompleted: completedSessions },
        communication: { totalSessions: communicationSessions },
        projects: { total: projects, completed: completedProjects },
      },
      deen: {
        arabic: { watched: completedLectures, total: totalLectures, mastery: Math.round(avgMastery._avg?.mastery_percentage ?? 0) },
        reading: { pages: readingPages._sum.pages ?? 0, days: readingDays.length },
        memorization: { ayahs: memorizationSessions, sessions: memorizationSessions },
        tahajjud: { nights: tahajjudNights },
      },
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
