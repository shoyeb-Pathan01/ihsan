"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, AlertCircle } from "lucide-react";

type Tab = "overview" | "lectures" | "practice" | "revision" | "mastery" | "notes";

interface LectureSummary {
  id: string;
  lecture_number: number;
  title: string;
  status: string;
  completion_percentage: number;
  mastery_percentage: number;
  watched: boolean;
  book: boolean;
  lecture_notes: boolean;
  quranic_examples: boolean;
  practice_status: string;
  revision_count: number;
  next_revision_date: string | null;
}

interface PracticeExercise {
  id: string;
  exercise_number: number;
  title: string;
  description: string;
  exercise_type: string;
  status: string;
}

interface NoteData {
  id: string;
  lecture_id: string;
  lecture_number: number | null;
  topic: string | null;
  arabic_term: string | null;
  meaning: string | null;
  examples: string | null;
  my_understanding: string | null;
  category: string | null;
  created_at: string;
}

interface OverviewData {
  summary: {
    total_lectures: number;
    completed_lectures: number;
    learning_lectures: number;
    avg_mastery: number;
    total_practice: number;
    total_revisions: number;
    revision_due: number;
  };
  current_learning: {
    id: string;
    lecture_number: number;
    title: string;
    status: string;
  } | null;
  weak_areas: {
    id: string;
    lecture_number: number;
    title: string;
    mastery_percentage: number;
  }[];
  lectures?: LectureSummary[];
  practice_lectures?: {
    id: string;
    lecture_number: number;
    title: string;
    practice_status: string;
    practices: PracticeExercise[];
  }[];
  overdue?: { id: string; lecture_number: number; title: string; next_revision_date: string | null }[];
  dueToday?: { id: string; lecture_number: number; title: string; next_revision_date: string | null }[];
  upcoming?: { id: string; lecture_number: number; title: string; next_revision_date: string | null }[];
  notes?: NoteData[];
}

export default function ArabicPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLecture, setExpandedLecture] = useState<string | null>(null);

  const fetchData = useCallback(async (currentTab: Tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/deen/arabic?tab=${currentTab}`);
      const d = await res.json();
      setData(d);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(tab); }, [tab, fetchData]);

  const toggleLectureExpand = (id: string) => {
    setExpandedLecture(expandedLecture === id ? null : id);
  };

  if (loading && !data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Failed to load.</p></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <div className="eyebrow">Qur&apos;an Journey</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">LISĀN-UL-QUR&apos;ĀN</h1>
        <p className="text-[#6b7280] m-0">Level 1 — Direct Qur&apos;anic comprehension</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(["overview", "lectures", "practice", "revision", "mastery", "notes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-3xl font-bold">{data.summary.completed_lectures}/{data.summary.total_lectures}</div>
              <div className="text-[13px] text-[#6b7280]">Lectures</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold">{data.summary.avg_mastery}%</div>
              <div className="text-[13px] text-[#6b7280]">Mastery</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold">{data.summary.total_practice}</div>
              <div className="text-[13px] text-[#6b7280]">Practice</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold">{data.summary.revision_due}</div>
              <div className="text-[13px] text-[#6b7280]">Revision Due</div>
            </div>
          </div>

          {/* Current Learning */}
          {data.current_learning && (
            <div className="card">
              <div className="eyebrow mb-2">Current Learning</div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Lecture {data.current_learning.lecture_number}</h3>
                  <p className="text-[13px] text-[#6b7280]">{data.current_learning.title}</p>
                </div>
                <Link href={`/deen/arabic/${data.current_learning.id}`} className="btn-primary">
                  {data.current_learning.status === "not_started" ? "Start" : "Continue"}
                </Link>
              </div>
            </div>
          )}

          {/* Weak Areas */}
          <div className="card">
            <div className="eyebrow mb-2">Weak Areas</div>
            {data.weak_areas.length === 0 ? (
              <p className="text-[13px] text-[#6b7280]">None yet</p>
            ) : (
              <div className="space-y-2">
                {data.weak_areas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                    <span className="text-[13px] font-medium">
                      Lecture {area.lecture_number} — {area.title}
                    </span>
                    <span className="text-[13px] text-[#ef4444]">{area.mastery_percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lectures Tab */}
      {tab === "lectures" && (
        <div className="space-y-4">
          {data.lectures?.map((lecture) => (
            <div key={lecture.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f6f7fb] flex items-center justify-center font-bold text-sm">
                    {lecture.lecture_number}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{lecture.title}</h3>
                    <p className="text-[12px] text-[#6b7280]">
                      {lecture.status === "completed" ? "✓ Completed" : lecture.status === "learning" ? "◐ Learning" : "○ Not Started"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[12px] text-[#6b7280]">Mastery</div>
                    <div className="font-bold">{lecture.mastery_percentage}%</div>
                  </div>
                  <Link href={`/deen/arabic/${lecture.id}`} className="btn-primary text-[13px]">
                    {lecture.status === "not_started" ? "Open" : "Continue"}
                  </Link>
                </div>
              </div>
              {lecture.status === "learning" && (
                <div className="mt-3">
                  <div className="progress">
                    <div className="bar" style={{ width: `${lecture.completion_percentage}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Practice Tab */}
      {tab === "practice" && (
        <div className="space-y-4">
          {(!data.practice_lectures || data.practice_lectures.length === 0) ? (
            <div className="card empty">No practice exercises yet. Complete lecture content first.</div>
          ) : (
            data.practice_lectures.map((lecture) => (
              <div key={lecture.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold">Lecture {lecture.lecture_number}</h3>
                    <p className="text-[13px] text-[#6b7280]">{lecture.title}</p>
                  </div>
                  <span className={`badge ${lecture.practice_status === "completed" ? "bg-[#dcfce7] text-[#166534]" : lecture.practice_status === "in_progress" ? "bg-[#eef2ff] text-[#4f46e5]" : ""}`}>
                    {lecture.practice_status.replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-2">
                  {lecture.practices.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                      <div>
                        <span className="text-[13px] font-medium">{exercise.title}</span>
                        <span className="text-[12px] text-[#6b7280] ml-2">({exercise.exercise_type})</span>
                      </div>
                      <button className={`w-6 h-6 rounded-full border flex items-center justify-center ${exercise.status === "completed" ? "bg-[#16a34a] border-[#16a34a] text-white" : "border-[#dfe3ea]"}`}>
                        {exercise.status === "completed" && <Check className="h-3 w-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Revision Tab */}
      {tab === "revision" && (
        <div className="space-y-6">
          {/* Overdue */}
          {data.overdue && data.overdue.length > 0 && (
            <div className="card">
              <div className="eyebrow mb-2">Overdue</div>
              <div className="space-y-2">
                {data.overdue.map((lecture) => (
                  <div key={lecture.id} className="flex items-center justify-between p-3 bg-[#fef2f2] rounded-xl border border-[#fecaca]">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-[#ef4444]" />
                      <span className="text-[13px] font-medium">Lecture {lecture.lecture_number} — {lecture.title}</span>
                    </div>
                    <Link href={`/deen/arabic/${lecture.id}`} className="text-[13px] text-[#635bff] font-medium hover:underline">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Due Today */}
          {data.dueToday && data.dueToday.length > 0 && (
            <div className="card">
              <div className="eyebrow mb-2">Due Today</div>
              <div className="space-y-2">
                {data.dueToday.map((lecture) => (
                  <div key={lecture.id} className="flex items-center justify-between p-3 bg-[#fefce8] rounded-xl border border-[#fef08a]">
                    <span className="text-[13px] font-medium">Lecture {lecture.lecture_number} — {lecture.title}</span>
                    <Link href={`/deen/arabic/${lecture.id}`} className="text-[13px] text-[#635bff] font-medium hover:underline">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {data.upcoming && data.upcoming.length > 0 && (
            <div className="card">
              <div className="eyebrow mb-2">Upcoming</div>
              <div className="space-y-2">
                {data.upcoming.map((lecture) => (
                  <div key={lecture.id} className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                    <span className="text-[13px] font-medium">Lecture {lecture.lecture_number} — {lecture.title}</span>
                    <span className="text-[12px] text-[#6b7280]">{lecture.next_revision_date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!data.overdue || data.overdue.length === 0) && (!data.dueToday || data.dueToday.length === 0) && (!data.upcoming || data.upcoming.length === 0) && (
            <div className="card empty">No revisions scheduled yet. Complete lectures to start revision tracking.</div>
          )}
        </div>
      )}

      {/* Mastery Tab */}
      {tab === "mastery" && (
        <div className="space-y-4">
          {data.lectures?.map((lecture) => {
            const masteryColor = lecture.mastery_percentage < 50 ? "text-[#ef4444]" : lecture.mastery_percentage < 80 ? "text-[#f59e0b]" : "text-[#16a34a]";
            return (
              <div key={lecture.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">Lecture {lecture.lecture_number} — {lecture.title}</h3>
                    <p className="text-[12px] text-[#6b7280]">
                      {lecture.status === "completed" ? "✓ Completed" : lecture.status === "learning" ? "◐ Learning" : "○ Not Started"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${masteryColor}`}>{lecture.mastery_percentage}%</div>
                    <div className="text-[12px] text-[#6b7280]">Mastery</div>
                  </div>
                </div>
                {lecture.status !== "not_started" && (
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-[#f6f7fb] rounded-lg">
                      <div className="text-[12px] text-[#6b7280]">Completion</div>
                      <div className="font-bold text-[13px]">{lecture.completion_percentage}%</div>
                    </div>
                    <div className="p-2 bg-[#f6f7fb] rounded-lg">
                      <div className="text-[12px] text-[#6b7280]">Practice</div>
                      <div className="font-bold text-[13px]">{lecture.practice_status === "completed" ? "✓" : "○"}</div>
                    </div>
                    <div className="p-2 bg-[#f6f7fb] rounded-lg">
                      <div className="text-[12px] text-[#6b7280]">Revisions</div>
                      <div className="font-bold text-[13px]">{lecture.revision_count}</div>
                    </div>
                    <div className="p-2 bg-[#f6f7fb] rounded-lg">
                      <div className="text-[12px] text-[#6b7280]">Confidence</div>
                      <div className="font-bold text-[13px]">—</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Notes Tab */}
      {tab === "notes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-extrabold text-base">Notes</h2>
            <button className="btn-primary text-[13px]">+ New Note</button>
          </div>
          {(!data.notes || data.notes.length === 0) ? (
            <div className="card empty">No notes yet.</div>
          ) : (
            data.notes.map((note) => (
              <div key={note.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    {note.arabic_term && <h3 className="font-bold text-sm">{note.arabic_term}</h3>}
                    {note.topic && <p className="text-[13px] text-[#6b7280]">{note.topic}</p>}
                    {note.meaning && <p className="text-[13px] mt-2">{note.meaning}</p>}
                    {note.my_understanding && <p className="text-[12px] text-[#6b7280] mt-2 italic">{note.my_understanding}</p>}
                  </div>
                  {note.lecture_number && (
                    <span className="badge">Lecture {note.lecture_number}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
