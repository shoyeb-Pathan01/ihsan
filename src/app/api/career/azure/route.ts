import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const VALID_SESSION_STATUSES = ["not_started", "learning", "completed"];
const VALID_TOPIC_STATUSES = ["not_started", "learning", "mastered"];
const VALID_PRACTICAL_STATUSES = ["not_started", "completed"];

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    // Single session mode (for workspace page)
    if (sessionId) {
      const session = await prisma.azureSession.findUnique({ where: { id: sessionId } });
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

      // Get related topics (all topics, since they're shared)
      const topics = await prisma.goalTopic.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, priority: true, status: true },
      });

      // Get adjacent sessions for navigation
      const [prevSession, nextSession] = await Promise.all([
        prisma.azureSession.findFirst({
          where: { session_number: { lt: session.session_number } },
          orderBy: { session_number: "desc" },
          select: { id: true, session_number: true, title: true },
        }),
        prisma.azureSession.findFirst({
          where: { session_number: { gt: session.session_number } },
          orderBy: { session_number: "asc" },
          select: { id: true, session_number: true, title: true },
        }),
      ]);

      return NextResponse.json({
        session: { id: session.id, session_number: session.session_number, title: session.title, drive_link: session.drive_link, status: session.status },
        topics,
        nextSession,
        prevSession,
      });
    }

    // List mode (for library page)
    const [totalTopics, completedTopics, masteredTopics, totalSessions, completedSessions, totalPracticals, completedPracticals, sessions, practicals, modules] = await Promise.all([
      prisma.goalTopic.count(),
      prisma.goalTopic.count({ where: { status: { not: "not_started" } } }),
      prisma.goalTopic.count({ where: { status: "mastered" } }),
      prisma.azureSession.count(),
      prisma.azureSession.count({ where: { status: "completed" } }),
      prisma.azurePractical.count(),
      prisma.azurePractical.count({ where: { status: "completed" } }),
      prisma.azureSession.findMany({ orderBy: { session_number: "asc" } }),
      prisma.azurePractical.findMany({ orderBy: { practical_number: "asc" } }),
      prisma.goalModule.findMany({
        orderBy: { order_index: "asc" },
        include: { topics: { orderBy: { name: "asc" } } },
      }),
    ]);

    return NextResponse.json({
      overview: { totalTopics, completedTopics, masteredTopics, totalSessions, completedSessions, totalPracticals, completedPracticals },
      sessions: sessions.map((s) => ({ id: s.id, session_number: s.session_number, title: s.title, drive_link: s.drive_link, status: s.status })),
      practicals: practicals.map((p) => ({ id: p.id, practical_number: p.practical_number, title: p.title, description: p.description, tasks: p.tasks, status: p.status })),
      modules: modules.map((m) => ({
        id: m.id, name: m.name,
        topics: m.topics.map((t) => ({ id: t.id, name: t.name, priority: t.priority, status: t.status, completion_percentage: t.completion_percentage, mastery_percentage: t.mastery_percentage })),
      })),
    });
  } catch (error) {
    console.error("Azure API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { type, id, status } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    if (!type || !["session", "topic", "practical"].includes(type)) {
      return NextResponse.json({ error: "Type must be session, topic, or practical" }, { status: 400 });
    }

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    try {
      if (type === "session") {
        if (!VALID_SESSION_STATUSES.includes(status)) {
          return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_SESSION_STATUSES.join(", ")}` }, { status: 400 });
        }
        await prisma.azureSession.update({
          where: { id },
          data: { status, completed_at: status === "completed" ? new Date() : null },
        });
      } else if (type === "topic") {
        if (!VALID_TOPIC_STATUSES.includes(status)) {
          return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_TOPIC_STATUSES.join(", ")}` }, { status: 400 });
        }
        await prisma.goalTopic.update({
          where: { id },
          data: {
            status,
            started_at: status !== "not_started" ? new Date() : null,
          },
        });
      } else if (type === "practical") {
        if (!VALID_PRACTICAL_STATUSES.includes(status)) {
          return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_PRACTICAL_STATUSES.join(", ")}` }, { status: 400 });
        }
        await prisma.azurePractical.update({
          where: { id },
          data: { status, completed_at: status === "completed" ? new Date() : null },
        });
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Record to update does not exist")) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Azure PATCH error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
