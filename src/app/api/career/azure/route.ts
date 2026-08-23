import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalTopics = await prisma.goalTopic.count();
    const completedTopics = await prisma.goalTopic.count({ where: { status: { not: "not_started" } } });
    const masteredTopics = await prisma.goalTopic.count({ where: { status: "mastered" } });

    const totalSessions = await prisma.azureSession.count();
    const completedSessions = await prisma.azureSession.count({ where: { status: "completed" } });

    const totalPracticals = await prisma.azurePractical.count();
    const completedPracticals = await prisma.azurePractical.count({ where: { status: "completed" } });

    const sessions = await prisma.azureSession.findMany({ orderBy: { session_number: "asc" } });
    const practicals = await prisma.azurePractical.findMany({ orderBy: { practical_number: "asc" } });

    const modules = await prisma.goalModule.findMany({
      orderBy: { order_index: "asc" },
      include: { topics: { orderBy: { name: "asc" } } },
    });

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
    const { type, id, status } = await request.json();

    if (type === "session") {
      await prisma.azureSession.update({
        where: { id },
        data: { status, completed_at: status === "completed" ? new Date() : null },
      });
    } else if (type === "topic") {
      await prisma.goalTopic.update({
        where: { id },
        data: { status, started_at: status !== "not_started" ? new Date() : undefined },
      });
    } else if (type === "practical") {
      await prisma.azurePractical.update({
        where: { id },
        data: { status, completed_at: status === "completed" ? new Date() : null },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Azure PATCH error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
