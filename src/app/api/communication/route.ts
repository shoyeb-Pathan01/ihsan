import { prisma } from "@/lib/db";
import { getToday, getWeekStart, getWeekEnd } from "@/lib/utils";

export async function GET() {
  try {
    const today = getToday();
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();

    const [recentSessions, totalSessions, thisWeekSessions, allSessions] =
      await Promise.all([
        prisma.communicationLog.findMany({
          where: { profile_id: "default" },
          orderBy: { created_at: "desc" },
          take: 10,
        }),
        prisma.communicationLog.count({
          where: { profile_id: "default" },
        }),
        prisma.communicationLog.count({
          where: {
            profile_id: "default",
            date: { gte: weekStart, lte: weekEnd },
          },
        }),
        prisma.communicationLog.findMany({
          where: { profile_id: "default" },
          select: { confidence_score: true },
        }),
      ]);

    const averageConfidence =
      allSessions.length > 0
        ? Math.round(
            (allSessions.reduce((s, c) => s + (c.confidence_score || 0), 0) /
              allSessions.length) *
              10,
          ) / 10
        : 0;

    return Response.json({
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        date: s.date,
        practiceType: s.practice_type,
        durationMinutes: s.duration_minutes,
        topic: s.topic,
        confidenceScore: s.confidence_score,
        clarityScore: s.clarity_score,
        fluencyScore: s.fluency_score,
        notes: s.notes,
      })),
      stats: {
        totalSessions,
        thisWeekSessions,
        averageConfidence,
      },
    });
  } catch (error) {
    console.error("Communication API error:", error);
    return Response.json(
      { error: "Failed to fetch communication data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      date,
      practiceType,
      durationMinutes,
      topic,
      confidenceScore,
      clarityScore,
      fluencyScore,
      notes,
    } = body as {
      date: string;
      practiceType: string;
      durationMinutes: number;
      topic: string;
      confidenceScore: number;
      clarityScore: number;
      fluencyScore: number;
      notes: string;
    };

    if (!practiceType) {
      return Response.json(
        { error: "practiceType is required" },
        { status: 400 },
      );
    }

    const log = await prisma.communicationLog.create({
      data: {
        profile_id: "default",
        date: date || getToday(),
        practice_type: practiceType,
        duration_minutes: durationMinutes || null,
        topic: topic || null,
        confidence_score: confidenceScore || null,
        clarity_score: clarityScore || null,
        fluency_score: fluencyScore || null,
        notes: notes || null,
      },
    });

    return Response.json({
      success: true,
      session: {
        id: log.id,
        date: log.date,
        practiceType: log.practice_type,
        durationMinutes: log.duration_minutes,
        topic: log.topic,
        confidenceScore: log.confidence_score,
        clarityScore: log.clarity_score,
        fluencyScore: log.fluency_score,
        notes: log.notes,
      },
    });
  } catch (error) {
    console.error("Communication POST error:", error);
    return Response.json(
      { error: "Failed to create communication log" },
      { status: 500 },
    );
  }
}
