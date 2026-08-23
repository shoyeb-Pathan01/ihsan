import { prisma } from "@/lib/db";
import { getToday, getDaysBetween } from "@/lib/utils";

export async function GET() {
  try {
    const today = getToday();

    const [topicRevisions, lectureRevisions] = await Promise.all([
      prisma.goalTopic.findMany({
        where: { next_revision: { not: null, lte: today } },
        include: { goal: true },
        orderBy: { next_revision: "asc" },
      }),
      prisma.lisanLecture.findMany({
        where: { next_revision: { not: null, lte: today } },
        orderBy: { next_revision: "asc" },
      }),
    ]);

    const items = [
      ...topicRevisions.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.goal.category as string,
        mastery: t.mastery_percentage,
        revisionCount: t.revision_count,
        lastRevised: t.last_revised?.toISOString() || null,
        nextRevision: t.next_revision?.toISOString() || null,
        daysSinceLastRevised: t.last_revised
          ? getDaysBetween(t.last_revised.toISOString().split("T")[0], today)
          : null,
        type: "topic" as const,
      })),
      ...lectureRevisions.map((l) => ({
        id: l.id,
        name: `Lecture ${l.lecture_number}: ${l.title}`,
        category: "arabic" as const,
        mastery: l.mastery,
        revisionCount: l.revision_count,
        lastRevised: l.last_revised?.toISOString() || null,
        nextRevision: l.next_revision?.toISOString() || null,
        daysSinceLastRevised: l.last_revised
          ? getDaysBetween(l.last_revised.toISOString().split("T")[0], today)
          : null,
        type: "lecture" as const,
      })),
    ];

    const overdue3 = items.filter(
      (i) => i.daysSinceLastRevised !== null && i.daysSinceLastRevised > 3,
    ).length;
    const overdue7 = items.filter(
      (i) => i.daysSinceLastRevised !== null && i.daysSinceLastRevised > 7,
    ).length;

    return Response.json({
      items,
      stats: {
        totalDue: items.length,
        overdueBy3Days: overdue3,
        overdueBy7Days: overdue7,
      },
    });
  } catch (error) {
    console.error("Revision API error:", error);
    return Response.json(
      { error: "Failed to fetch revision data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, type } = body as { id: string; type: "topic" | "lecture" };

    if (!id || !type) {
      return Response.json(
        { error: "id and type are required" },
        { status: 400 },
      );
    }

    const today = getToday();
    const todayDate = new Date(today);

    if (type === "topic") {
      const topic = await prisma.goalTopic.findUnique({ where: { id } });
      if (!topic) {
        return Response.json({ error: "Topic not found" }, { status: 404 });
      }

      const newCount = topic.revision_count + 1;
      const intervals = [3, 7, 14, 30];
      const interval = intervals[Math.min(newCount - 1, intervals.length - 1)];
      const nextDate = new Date(todayDate);
      nextDate.setDate(nextDate.getDate() + interval);

      const masteryBoost = Math.min(15, 5 + newCount * 2);
      const newMastery = Math.min(100, topic.mastery_percentage + masteryBoost);

      const updated = await prisma.goalTopic.update({
        where: { id },
        data: {
          last_revised: todayDate,
          next_revision: nextDate,
          revision_count: newCount,
          mastery_percentage: newMastery,
        },
      });

      return Response.json({ success: true, item: updated });
    } else {
      const lecture = await prisma.lisanLecture.findUnique({ where: { id } });
      if (!lecture) {
        return Response.json(
          { error: "Lecture not found" },
          { status: 404 },
        );
      }

      const newCount = lecture.revision_count + 1;
      const intervals = [3, 7, 14, 30];
      const interval = intervals[Math.min(newCount - 1, intervals.length - 1)];
      const nextDate = new Date(todayDate);
      nextDate.setDate(nextDate.getDate() + interval);

      const masteryBoost = Math.min(15, 5 + newCount * 2);
      const newMastery = Math.min(100, lecture.mastery + masteryBoost);

      const updated = await prisma.lisanLecture.update({
        where: { id },
        data: {
          last_revised: todayDate,
          next_revision: nextDate,
          revision_count: newCount,
          mastery: newMastery,
        },
      });

      return Response.json({ success: true, item: updated });
    }
  } catch (error) {
    console.error("Revision POST error:", error);
    return Response.json(
      { error: "Failed to mark as revised" },
      { status: 500 },
    );
  }
}
