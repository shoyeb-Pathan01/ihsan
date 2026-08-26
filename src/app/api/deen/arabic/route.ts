import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const LECTURE_ALLOWED_FIELDS = {
  status: true, watched: true, book: true, lecture_notes: true,
  quranic_examples: true, practice_status: true, practice_notes_ok: true,
  mastery_percentage: true, completion_percentage: true, quiz_score: true,
  understanding: true, confidence: true, duration_seconds: true,
};

const VALID_STATUSES = ["not_started", "learning", "completed"];
const VALID_PRACTICE_STATUSES = ["not_started", "in_progress", "completed"];

function pickAllowed(data: Record<string, unknown>, allowed: Record<string, boolean>) {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (allowed[key] && val !== undefined) result[key] = val;
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "overview";
    const lectureId = searchParams.get("lectureId");

    if (lectureId) {
      const lecture = await prisma.lisanLecture.findUnique({
        where: { id: lectureId },
        include: {
          practices: true,
          revisions: { orderBy: { date: "desc" } },
          notes: { orderBy: { created_at: "desc" } },
          examples: true,
          explain_sessions: { orderBy: { created_at: "desc" } },
        },
      });
      if (!lecture) {
        return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
      }
      return NextResponse.json({ lecture });
    }

    const today = new Date().toISOString().split("T")[0];

    const [allLectures, summaryAgg] = await Promise.all([
      prisma.lisanLecture.findMany({
        orderBy: { lecture_number: "asc" },
        include: { practices: true, revisions: true },
      }),
      prisma.lisanLecture.aggregate({
        _count: { id: true },
        _avg: { mastery_percentage: true },
        where: { status: "completed" },
      }),
    ]);

    const totalLectures = allLectures.length;
    const completedLectures = allLectures.filter((l) => l.status === "completed").length;
    const learningLectures = allLectures.filter((l) => l.status === "learning").length;
    const avgMastery = Math.round(summaryAgg._avg.mastery_percentage ?? 0);
    const totalPractice = allLectures.filter((l) => l.practice_status === "completed").length;
    const totalRevisions = allLectures.reduce((sum, l) => sum + l.revision_count, 0);

    const currentLearning = allLectures.find((l) => l.status === "learning") || allLectures.find((l) => l.status === "not_started");

    const weakAreas = allLectures
      .filter((l) => l.mastery_percentage < 50 && l.status !== "not_started")
      .sort((a, b) => a.mastery_percentage - b.mastery_percentage)
      .slice(0, 5);

    const revisionDue = allLectures.filter(
      (l) => l.next_revision_date && l.next_revision_date <= today
    );

    let tabData: Record<string, unknown> = {};

    if (tab === "lectures") {
      let lectures = allLectures.map((l) => ({
        id: l.id, lecture_number: l.lecture_number, title: l.title,
        youtube_url: l.youtube_url, status: l.status,
        completion_percentage: l.completion_percentage, mastery_percentage: l.mastery_percentage,
        watched: l.watched, book: l.book, lecture_notes: l.lecture_notes,
        quranic_examples: l.quranic_examples, practice_status: l.practice_status,
        revision_count: l.revision_count, next_revision_date: l.next_revision_date,
      }));

      const search = searchParams.get("search");
      const filter = searchParams.get("filter");

      if (search) {
        const q = search.toLowerCase();
        lectures = lectures.filter((l) =>
          l.title.toLowerCase().includes(q) || String(l.lecture_number).includes(q)
        );
      }

      if (filter === "not_started") lectures = lectures.filter((l) => l.status === "not_started");
      else if (filter === "learning") lectures = lectures.filter((l) => l.status === "learning");
      else if (filter === "completed") lectures = lectures.filter((l) => l.status === "completed");
      else if (filter === "needs_revision") lectures = lectures.filter((l) => l.next_revision_date && l.next_revision_date <= today);
      else if (filter === "mastered") lectures = lectures.filter((l) => l.mastery_percentage >= 80);

      tabData = { lectures };
    } else if (tab === "practice") {
      tabData = {
        practice_lectures: allLectures.filter((l) => l.practices.length > 0).map((l) => ({
          id: l.id, lecture_number: l.lecture_number, title: l.title,
          practice_status: l.practice_status,
          practices: l.practices.map((p) => ({
            id: p.id, exercise_number: p.exercise_number, title: p.title,
            description: p.description, exercise_type: p.exercise_type, status: p.status,
          })),
        })),
      };
    } else if (tab === "revision") {
      const overdue = allLectures.filter((l) => l.next_revision_date && l.next_revision_date < today);
      const dueToday = allLectures.filter((l) => l.next_revision_date && l.next_revision_date === today);
      const upcoming = allLectures.filter((l) => l.next_revision_date && l.next_revision_date > today);
      tabData = {
        overdue: overdue.map((l) => ({ id: l.id, lecture_number: l.lecture_number, title: l.title, next_revision_date: l.next_revision_date })),
        dueToday: dueToday.map((l) => ({ id: l.id, lecture_number: l.lecture_number, title: l.title, next_revision_date: l.next_revision_date })),
        upcoming: upcoming.map((l) => ({ id: l.id, lecture_number: l.lecture_number, title: l.title, next_revision_date: l.next_revision_date })),
      };
    } else if (tab === "mastery") {
      tabData = {
        lectures: allLectures.map((l) => ({
          id: l.id, lecture_number: l.lecture_number, title: l.title,
          status: l.status, completion_percentage: l.completion_percentage,
          mastery_percentage: l.mastery_percentage, quiz_score: l.quiz_score,
          understanding: l.understanding, confidence: l.confidence,
          practice_status: l.practice_status, revision_count: l.revision_count,
        })),
      };
    } else if (tab === "notes") {
      const notes = await prisma.arabicNote.findMany({
        orderBy: { created_at: "desc" },
        include: { lecture: true },
      });
      tabData = {
        notes: notes.map((n) => ({
          id: n.id, lecture_id: n.lecture_id, lecture_number: n.lecture?.lecture_number,
          topic: n.topic, arabic_term: n.arabic_term, meaning: n.meaning,
          examples: n.examples, my_understanding: n.my_understanding,
          category: n.category, created_at: n.created_at,
        })),
      };
    }

    return NextResponse.json({
      summary: {
        total_lectures: totalLectures, completed_lectures: completedLectures,
        learning_lectures: learningLectures, avg_mastery: avgMastery,
        total_practice: totalPractice, total_revisions: totalRevisions,
        revision_due: revisionDue.length,
      },
      current_learning: currentLearning
        ? { id: currentLearning.id, lecture_number: currentLearning.lecture_number, title: currentLearning.title, status: currentLearning.status }
        : null,
      weak_areas: weakAreas.map((l) => ({ id: l.id, lecture_number: l.lecture_number, title: l.title, mastery_percentage: l.mastery_percentage })),
      ...tabData,
    });
  } catch (error) {
    console.error("Error fetching Arabic data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;

    if (id) {
      const safeData = pickAllowed(rawData, LECTURE_ALLOWED_FIELDS);
      if (safeData.status && !VALID_STATUSES.includes(safeData.status as string)) {
        return NextResponse.json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
      }
      if (safeData.practice_status && !VALID_PRACTICE_STATUSES.includes(safeData.practice_status as string)) {
        return NextResponse.json({ error: `Practice status must be one of: ${VALID_PRACTICE_STATUSES.join(", ")}` }, { status: 400 });
      }
      try {
        const lecture = await prisma.lisanLecture.update({ where: { id }, data: safeData, include: { practices: true } });
        return NextResponse.json({ lecture });
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("Record to update does not exist")) {
          return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
        }
        throw e;
      }
    }

    const lecture = await prisma.lisanLecture.create({ data: rawData, include: { practices: true } });
    return NextResponse.json({ lecture });
  } catch (error) {
    console.error("Error saving lecture:", error);
    return NextResponse.json({ error: "Failed to save lecture" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;

    if (!id) return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });

    const safeData = pickAllowed(rawData, LECTURE_ALLOWED_FIELDS);
    if (safeData.status && !VALID_STATUSES.includes(safeData.status as string)) {
      return NextResponse.json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }
    if (safeData.practice_status && !VALID_PRACTICE_STATUSES.includes(safeData.practice_status as string)) {
      return NextResponse.json({ error: `Practice status must be one of: ${VALID_PRACTICE_STATUSES.join(", ")}` }, { status: 400 });
    }

    try {
      const lecture = await prisma.lisanLecture.update({ where: { id }, data: safeData, include: { practices: true } });
      return NextResponse.json({ lecture });
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Record to ")) {
        return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Error updating lecture:", error);
    return NextResponse.json({ error: "Failed to update lecture" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
      await prisma.lisanLecture.delete({ where: { id } });
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Record to ")) {
        return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    return NextResponse.json({ error: "Failed to delete lecture" }, { status: 500 });
  }
}
