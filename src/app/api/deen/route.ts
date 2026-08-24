import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    const profileId = profile?.id;

    const [totalLectures, watchedLectures, avgMastery, readingPages, readingDays, memorizationSessions, tahajjudNights] = await Promise.all([
      prisma.lisanLecture.count(),
      prisma.lisanLecture.count({ where: { watched: true } }),
      prisma.lisanLecture.aggregate({ _avg: { mastery_percentage: true } }),
      profileId ? prisma.quranReading.aggregate({ _sum: { pages: true }, _count: { id: true }, where: { profile_id: profileId } }) : Promise.resolve({ _sum: { pages: 0 }, _count: { id: 0 } }),
      profileId ? prisma.quranReading.findMany({ where: { profile_id: profileId }, select: { date: true }, distinct: ["date"] }) : Promise.resolve([]),
      profileId ? prisma.quranMemorization.count({ where: { profile_id: profileId, is_new: true } }) : Promise.resolve(0),
      profileId ? prisma.tahajjudLog.count({ where: { profile_id: profileId, completed: true } }) : Promise.resolve(0),
    ]);

    return NextResponse.json({
      arabic: { watched: watchedLectures, total: totalLectures, mastery: Math.round(avgMastery._avg?.mastery_percentage ?? 0) },
      reading: { pages: readingPages._sum.pages ?? 0, days: readingDays.length },
      memorization: { ayahs: memorizationSessions, sessions: memorizationSessions },
      tahajjud: { nights: tahajjudNights },
    });
  } catch (error) {
    console.error("Deen API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
