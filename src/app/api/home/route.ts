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

    const [totalTopics, completedTopics, communicationSessions, projects, totalLectures, completedLectures, learningLectures, readingPages, memorizationSessions, tahajjudNights, azureCurrent, arabicCurrent, reminder] = await Promise.all([
      prisma.goalTopic.count(),
      prisma.goalTopic.count({ where: { status: { not: "not_started" } } }),
      prisma.communicationSession.count({ where: { profile_id: profile.id } }),
      prisma.project.count(),
      prisma.lisanLecture.count(),
      prisma.lisanLecture.count({ where: { status: "completed" } }),
      prisma.lisanLecture.count({ where: { status: "learning" } }),
      prisma.quranReading.aggregate({ _sum: { pages: true }, where: { profile_id: profile.id } }),
      prisma.quranMemorization.count({ where: { profile_id: profile.id, is_new: true } }),
      prisma.tahajjudLog.count({ where: { profile_id: profile.id, completed: true } }),
      prisma.goalTopic.findFirst({ where: { status: "learning" }, include: { module: true } }),
      prisma.lisanLecture.findFirst({ where: { status: "learning" } }),
      prisma.reminder.findFirst({ where: { enabled: true }, orderBy: { created_at: "asc" } }),
    ]);

    const hasActivity =
      completedTopics > 0 || completedLectures > 0 || learningLectures > 0 ||
      (readingPages._sum.pages ?? 0) > 0 || tahajjudNights > 0 || communicationSessions > 0;

    const azureProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const arabicProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    return NextResponse.json({
      profile: {
        name: profile.name, mission_start: profile.mission_start, mission_end: profile.mission_end,
        baseline_azure: profile.baseline_azure, baseline_arabic: profile.baseline_arabic, baseline_comm: profile.baseline_comm,
      },
      daysRemaining,
      hasActivity,
      careerProgress: { azure: azureProgress, communication: communicationSessions, projects },
      deenProgress: {
        arabic: arabicProgress, reading: readingPages._sum.pages ?? 0,
        memorization: memorizationSessions, tahajjud: tahajjudNights,
      },
      azureCurrent: azureCurrent ? { title: azureCurrent.name, module: azureCurrent.module?.name || "" } : null,
      arabicCurrent: arabicCurrent ? { title: arabicCurrent.title, lecture_number: arabicCurrent.lecture_number } : null,
      reminder: reminder ? { text: reminder.text, source_type: reminder.source_type, reference: reminder.reference } : null,
    });
  } catch (error) {
    console.error("Home API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
