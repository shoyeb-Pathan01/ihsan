import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return Response.json({ results: [] });
    }

    const query = q;
    const queryLower = q.toLowerCase();
    const queryUpper = q.toUpperCase();
    const results: { type: string; title: string; subtitle: string; href: string }[] = [];

    // Search Azure topics
    const azureTopics = await prisma.goalTopic.findMany({
      where: {
        goal: { category: "azure" },
        OR: [
          { name: { contains: query } },
          { name: { contains: queryLower } },
          { name: { contains: queryUpper } },
        ],
      },
      take: 5,
      include: { module: true },
    });

    for (const topic of azureTopics) {
      results.push({
        type: "azure",
        title: topic.name,
        subtitle: topic.module?.name || "Azure",
        href: "/azure",
      });
    }

    // Search Arabic lectures
    const arabicLectures = await prisma.lisanLecture.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { title: { contains: queryLower } },
          { title: { contains: queryUpper } },
        ],
      },
      take: 5,
    });

    for (const lecture of arabicLectures) {
      results.push({
        type: "arabic",
        title: `Lecture ${lecture.lecture_number}: ${lecture.title}`,
        subtitle: "Lisan-ul-Quran",
        href: "/quran-journey",
      });
    }

    // Search projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { name: { contains: queryLower } },
          { name: { contains: queryUpper } },
        ],
      },
      take: 3,
    });

    for (const project of projects) {
      results.push({
        type: "project",
        title: project.name,
        subtitle: "Project",
        href: "/projects",
      });
    }

    // Search reminders
    const reminders = await prisma.reminder.findMany({
      where: {
        OR: [
          { text_paraphrase: { contains: query } },
          { text_paraphrase: { contains: queryLower } },
          { text_paraphrase: { contains: queryUpper } },
        ],
      },
      take: 3,
    });

    for (const reminder of reminders) {
      results.push({
        type: "reminder",
        title: reminder.text_paraphrase.slice(0, 80) + "...",
        subtitle: `${reminder.source_type} — ${reminder.reference}`,
        href: "/reminders",
      });
    }

    return Response.json({ results: results.slice(0, 10) });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json({ results: [] }, { status: 500 });
  }
}
