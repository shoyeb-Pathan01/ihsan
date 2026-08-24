import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/deen/arabic - Get all lectures with summary stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "overview";
    const lectureId = searchParams.get("lectureId");

    if (lectureId) {
      // Get specific lecture with all relations
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

    // Get all lectures
    const lectures = await prisma.lisanLecture.findMany({
      orderBy: { lecture_number: "asc" },
      include: {
        practices: true,
        revisions: true,
      },
    });

    // Calculate summary stats
    const totalLectures = lectures.length;
    const completedLectures = lectures.filter((l) => l.status === "completed").length;
    const learningLectures = lectures.filter((l) => l.status === "learning").length;
    const totalMastery = lectures.reduce((sum, l) => sum + l.mastery_percentage, 0);
    const avgMastery = totalLectures > 0 ? Math.round(totalMastery / totalLectures) : 0;
    const totalPractice = lectures.filter((l) => l.practice_status === "completed").length;
    const totalRevisions = lectures.reduce((sum, l) => sum + l.revision_count, 0);

    // Find current learning (first lecture with status "learning" or "not_started")
    const currentLearning = lectures.find((l) => l.status === "learning") || lectures.find((l) => l.status === "not_started");

    // Find weak areas (mastery < 50% and status is not "not_started")
    const weakAreas = lectures
      .filter((l) => l.mastery_percentage < 50 && l.status !== "not_started")
      .sort((a, b) => a.mastery_percentage - b.mastery_percentage)
      .slice(0, 5);

    // Find revision due (next_revision_date is today or past)
    const today = new Date().toISOString().split("T")[0];
    const revisionDue = lectures.filter(
      (l) => l.next_revision_date && l.next_revision_date <= today
    );

    // Tab-specific data
    let tabData = {};

    if (tab === "lectures") {
      tabData = {
        lectures: lectures.map((l) => ({
          id: l.id,
          lecture_number: l.lecture_number,
          title: l.title,
          duration_seconds: l.duration_seconds,
          status: l.status,
          completion_percentage: l.completion_percentage,
          mastery_percentage: l.mastery_percentage,
          watched: l.watched,
          book: l.book,
          lecture_notes: l.lecture_notes,
          quranic_examples: l.quranic_examples,
          practice_status: l.practice_status,
          revision_count: l.revision_count,
          next_revision_date: l.next_revision_date,
        })),
      };
    } else if (tab === "practice") {
      const lecturesWithPractice = lectures.filter((l) => l.practices.length > 0);
      tabData = {
        practice_lectures: lecturesWithPractice.map((l) => ({
          id: l.id,
          lecture_number: l.lecture_number,
          title: l.title,
          practice_status: l.practice_status,
          practices: l.practices.map((p) => ({
            id: p.id,
            exercise_number: p.exercise_number,
            title: p.title,
            description: p.description,
            exercise_type: p.exercise_type,
            status: p.status,
          })),
        })),
      };
    } else if (tab === "revision") {
      const overdue = lectures.filter(
        (l) => l.next_revision_date && l.next_revision_date < today
      );
      const dueToday = lectures.filter(
        (l) => l.next_revision_date && l.next_revision_date === today
      );
      const upcoming = lectures.filter(
        (l) => l.next_revision_date && l.next_revision_date > today
      );

      tabData = {
        overdue: overdue.map((l) => ({
          id: l.id,
          lecture_number: l.lecture_number,
          title: l.title,
          next_revision_date: l.next_revision_date,
        })),
        dueToday: dueToday.map((l) => ({
          id: l.id,
          lecture_number: l.lecture_number,
          title: l.title,
          next_revision_date: l.next_revision_date,
        })),
        upcoming: upcoming.map((l) => ({
          id: l.id,
          lecture_number: l.lecture_number,
          title: l.title,
          next_revision_date: l.next_revision_date,
        })),
      };
    } else if (tab === "mastery") {
      tabData = {
        lectures: lectures.map((l) => ({
          id: l.id,
          lecture_number: l.lecture_number,
          title: l.title,
          status: l.status,
          completion_percentage: l.completion_percentage,
          mastery_percentage: l.mastery_percentage,
          quiz_score: l.quiz_score,
          understanding: l.understanding,
          confidence: l.confidence,
          practice_status: l.practice_status,
          revision_count: l.revision_count,
        })),
      };
    } else if (tab === "notes") {
      const notes = await prisma.arabicNote.findMany({
        orderBy: { created_at: "desc" },
        include: { lecture: true },
      });
      tabData = {
        notes: notes.map((n) => ({
          id: n.id,
          lecture_id: n.lecture_id,
          lecture_number: n.lecture?.lecture_number,
          topic: n.topic,
          arabic_term: n.arabic_term,
          meaning: n.meaning,
          examples: n.examples,
          my_understanding: n.my_understanding,
          category: n.category,
          created_at: n.created_at,
        })),
      };
    }

    return NextResponse.json({
      summary: {
        total_lectures: totalLectures,
        completed_lectures: completedLectures,
        learning_lectures: learningLectures,
        avg_mastery: avgMastery,
        total_practice: totalPractice,
        total_revisions: totalRevisions,
        revision_due: revisionDue.length,
      },
      current_learning: currentLearning
        ? {
            id: currentLearning.id,
            lecture_number: currentLearning.lecture_number,
            title: currentLearning.title,
            status: currentLearning.status,
          }
        : null,
      weak_areas: weakAreas.map((l) => ({
        id: l.id,
        lecture_number: l.lecture_number,
        title: l.title,
        mastery_percentage: l.mastery_percentage,
      })),
      ...tabData,
    });
  } catch (error) {
    console.error("Error fetching Arabic data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST /api/deen/arabic - Create or update lecture
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (id) {
      // Update existing lecture
      const lecture = await prisma.lisanLecture.update({
        where: { id },
        data,
        include: { practices: true },
      });
      return NextResponse.json({ lecture });
    }

    // Create new lecture
    const lecture = await prisma.lisanLecture.create({
      data,
      include: { practices: true },
    });
    return NextResponse.json({ lecture });
  } catch (error) {
    console.error("Error saving lecture:", error);
    return NextResponse.json({ error: "Failed to save lecture" }, { status: 500 });
  }
}

// PATCH /api/deen/arabic - Update lecture fields
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 });
    }

    const lecture = await prisma.lisanLecture.update({
      where: { id },
      data,
      include: { practices: true },
    });

    return NextResponse.json({ lecture });
  } catch (error) {
    console.error("Error updating lecture:", error);
    return NextResponse.json({ error: "Failed to update lecture" }, { status: 500 });
  }
}
