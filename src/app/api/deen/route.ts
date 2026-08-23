import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    const profileId = profile?.id;

    const totalLectures = await prisma.lisanLecture.count();
    const watchedLectures = await prisma.lisanLecture.count({ where: { watched: true } });
    const avgMastery = await prisma.lisanLecture.aggregate({ _avg: { mastery: true } });

    const readingPages = profileId
      ? await prisma.quranReading.aggregate({ _sum: { pages: true }, _count: { id: true }, where: { profile_id: profileId } })
      : { _sum: { pages: 0 }, _count: { id: 0 } };

    const readingDays = profileId
      ? await prisma.quranReading.findMany({ where: { profile_id: profileId }, select: { date: true }, distinct: ["date"] })
      : [];

    const memorizationAyahs = profileId
      ? await prisma.quranMemorization.aggregate({ _sum: { ayah_to: true }, _count: { id: true }, where: { profile_id: profileId, is_new: true } })
      : { _sum: { ayah_to: 0 }, _count: { id: 0 } };

    const tahajjudNights = profileId
      ? await prisma.tahajjudLog.count({ where: { profile_id: profileId, completed: true } })
      : 0;

    return NextResponse.json({
      arabic: {
        watched: watchedLectures,
        total: totalLectures,
        mastery: Math.round(avgMastery._avg.mastery ?? 0),
      },
      reading: {
        pages: readingPages._sum.pages ?? 0,
        days: readingDays.length,
      },
      memorization: {
        ayahs: memorizationAyahs._sum.ayah_to ?? 0,
        sessions: memorizationAyahs._count,
      },
      tahajjud: {
        nights: tahajjudNights,
      },
    });
  } catch (error) {
    console.error("Deen API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
