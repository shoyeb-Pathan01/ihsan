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
    const daysRemaining = Math.max(0, daysBetween(now, profile.mission_end));

    const totalTopics = await prisma.goalTopic.count();
    const completedTopics = await prisma.goalTopic.count({ where: { status: { not: "not_started" } } });
    const masteredTopics = await prisma.goalTopic.count({ where: { status: "mastered" } });

    const totalSessions = await prisma.azureSession.count();
    const completedSessions = await prisma.azureSession.count({ where: { status: "completed" } });

    const totalPracticals = await prisma.azurePractical.count();
    const completedPracticals = await prisma.azurePractical.count({ where: { status: "completed" } });

    const totalLectures = await prisma.lisanLecture.count();
    const watchedLectures = await prisma.lisanLecture.count({ where: { watched: true } });
    const avgMastery = await prisma.lisanLecture.aggregate({ _avg: { mastery: true } });

    const readingPages = await prisma.quranReading.aggregate({ _sum: { pages: true }, where: { profile_id: profile.id } });
    const readingDays = await prisma.quranReading.findMany({ where: { profile_id: profile.id }, select: { date: true }, distinct: ["date"] });

    const memorizationAyahs = await prisma.quranMemorization.aggregate({ _sum: { ayah_to: true }, _count: { id: true }, where: { profile_id: profile.id, is_new: true } });

    const tahajjudNights = await prisma.tahajjudLog.count({ where: { profile_id: profile.id, completed: true } });

    const communicationSessions = await prisma.communicationSession.count({ where: { profile_id: profile.id } });

    const projects = await prisma.project.count();
    const completedProjects = await prisma.project.count({ where: { status: "completed" } });

    const hasActivity = completedSessions > 0 || watchedLectures > 0 || (readingPages._sum.pages ?? 0) > 0 || tahajjudNights > 0 || communicationSessions > 0;

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
        arabic: { watched: watchedLectures, total: totalLectures, mastery: Math.round(avgMastery._avg.mastery ?? 0) },
        reading: { pages: readingPages._sum.pages ?? 0, days: readingDays.length },
        memorization: { ayahs: memorizationAyahs._sum.ayah_to ?? 0, sessions: memorizationAyahs._count },
        tahajjud: { nights: tahajjudNights },
      },
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
