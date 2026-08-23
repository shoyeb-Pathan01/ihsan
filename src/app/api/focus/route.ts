import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sessions = await prisma.focusSession.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
    });

    const totalMinutes = sessions.reduce((s, f) => s + f.duration_minutes, 0);
    const completedSessions = sessions.length;
    const averageDuration =
      completedSessions > 0 ? Math.round(totalMinutes / completedSessions) : 0;

    return Response.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        topicName: s.topic_name,
        durationMinutes: s.duration_minutes,
        accomplished: s.accomplished,
        confidenceAfter: s.confidence_after,
        notes: s.notes,
        createdAt: s.created_at,
      })),
      stats: {
        totalMinutes,
        completedSessions,
        averageDuration,
      },
    });
  } catch (error) {
    console.error("Focus API GET error:", error);
    return Response.json(
      { error: "Failed to fetch focus sessions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topicName, duration, accomplished, confidence, notes } = body as {
      topicName: string;
      duration: number;
      accomplished: string;
      confidence: number;
      notes: string;
    };

    if (!topicName) {
      return Response.json(
        { error: "topicName is required" },
        { status: 400 },
      );
    }

    const session = await prisma.focusSession.create({
      data: {
        profile_id: "default",
        topic_name: topicName,
        duration_minutes: duration || 0,
        ended_at: new Date(),
        accomplished: accomplished || null,
        confidence_after: confidence || null,
        notes: notes || null,
      },
    });

    return Response.json({
      success: true,
      session: {
        id: session.id,
        topicName: session.topic_name,
        durationMinutes: session.duration_minutes,
        accomplished: session.accomplished,
        confidenceAfter: session.confidence_after,
        notes: session.notes,
        createdAt: session.created_at,
      },
    });
  } catch (error) {
    console.error("Focus API POST error:", error);
    return Response.json(
      { error: "Failed to create focus session" },
      { status: 500 },
    );
  }
}
