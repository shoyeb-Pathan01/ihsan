"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Check, Search } from "lucide-react";

type Tab = "overview" | "lectures" | "practice" | "revision" | "mastery" | "notes";
type FilterValue = "" | "not_started" | "learning" | "completed" | "needs_revision" | "mastered";

interface LectureSummary {
  id: string;
  lecture_number: number;
  title: string;
  youtube_url: string;
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

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "" },
  { label: "Not Started", value: "not_started" },
  { label: "In Progress", value: "learning" },
  { label: "Completed", value: "completed" },
  { label: "Needs Revision", value: "needs_revision" },
  { label: "Mastered", value: "mastered" },
];

export default function ArabicPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState<FilterValue>("");

  const fetchData = useCallback(async (currentTab: Tab, search?: string, filter?: string) => {
    setLoading(true);
    try {
      let url = `/api/deen/arabic?tab=${currentTab}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filter) url += `&filter=${encodeURIComponent(filter)}`;
      const res = await fetch(url);
      const d = await res.json();
      setData(d);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(tab, searchQuery, filterValue);
  }, [tab, searchQuery, filterValue, fetchData]);

  const allZero = data
    ? data.summary.completed_lectures === 0 && data.summary.learning_lectures === 0
    : false;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] text-sm">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#6b7280] text-sm">Failed to load.</p>
      </div>
    );
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
        {(["overview", "lectures", "practice", "revision", "mastery", "notes"] as const).map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={tab === t ? "active" : ""}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          )
        )}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {tab === "overview" && (
        <div className="space-y-6">
          {allZero ? (
            <div className="card empty">
              <p className="text-[14px] mb-4">
                60 lectures ready to begin. Your journey starts with Lecture 01.
              </p>
              {data.current_learning && (
                <Link
                  href={`/deen/arabic/${data.current_learning.id}`}
                  className="btn-primary inline-block"
                >
                  START LECTURE 01
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid-stats">
                <div className="card">
                  <div className="stat-label">Lectures</div>
                  <div className="stat">
                    {data.summary.completed_lectures}/{data.summary.total_lectures}
                  </div>
                  <div className="small">completed</div>
                </div>
                <div className="card">
                  <div className="stat-label">Completion</div>
                  <div className="stat">
                    {data.summary.total_lectures > 0
                      ? Math.round(
                          (data.summary.completed_lectures / data.summary.total_lectures) * 100
                        )
                      : 0}
                    %
                  </div>
                  <div className="small">completed</div>
                </div>
                <div className="card">
                  <div className="stat-label">Mastery</div>
                  <div className="stat">{data.summary.avg_mastery}%</div>
                  <div className="small">average</div>
                </div>
                <div className="card">
                  <div className="stat-label">Revision Due</div>
                  <div className="stat">{data.summary.revision_due}</div>
                  <div className="small">lectures</div>
                </div>
              </div>

              {data.current_learning && (
                <div className="card">
                  <div className="eyebrow mb-2">Current Learning</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">
                        Lecture {data.current_learning.lecture_number}
                      </h3>
                      <p className="text-[13px] text-[#6b7280]">
                        {data.current_learning.title}
                      </p>
                    </div>
                    <Link
                      href={`/deen/arabic/${data.current_learning.id}`}
                      className="btn-primary"
                    >
                      {data.current_learning.status === "not_started"
                        ? "Start"
                        : "Continue"}
                    </Link>
                  </div>
                </div>
              )}

              {data.weak_areas.length > 0 && (
                <div className="card">
                  <div className="eyebrow mb-2">Weak Areas</div>
                  <div className="space-y-2">
                    {data.weak_areas.map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl"
                      >
                        <span className="text-[13px] font-medium">
                          Lecture {area.lecture_number} — {area.title}
                        </span>
                        <span className="text-[13px] text-[#ef4444]">
                          {area.mastery_percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== LECTURES TAB ===== */}
      {tab === "lectures" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#dfe3ea] rounded-xl text-[13px] outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/10 bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterValue(f.value)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                  filterValue === f.value
                    ? "bg-[#111827] text-white border-[#111827]"
                    : "bg-white text-[#4b5563] border-[#dfe3ea] hover:bg-[#f9fafb]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="card">
            {!data.lectures || data.lectures.length === 0 ? (
              <div className="empty">No lectures found.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Lecture</th>
                    <th>Status</th>
                    <th>YouTube</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.lectures.map((lecture) => (
                    <tr key={lecture.id}>
                      <td className="font-mono text-[#6b7280]">
                        {String(lecture.lecture_number).padStart(2, "0")}
                      </td>
                      <td className="font-medium">{lecture.title}</td>
                      <td>
                        {lecture.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 text-[12px] text-[#16a34a] font-medium">
                            <Check className="h-3 w-3" /> Completed
                          </span>
                        ) : lecture.status === "learning" ? (
                          <span className="text-[12px] text-[#635bff] font-medium">
                            ◐ In Progress
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#6b7280] font-medium">
                            ○ Not Started
                          </span>
                        )}
                      </td>
                      <td>
                        {lecture.youtube_url ? (
                          <a
                            href={lecture.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6b7280] hover:text-[#635bff]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-[#dfe3ea]">—</span>
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/deen/arabic/${lecture.id}`}
                          className="text-[12px] px-3 py-1.5 rounded-lg bg-[#eef2ff] text-[#635bff] hover:bg-[#dde3ff] font-medium inline-block"
                        >
                          {lecture.status === "not_started" ? "Open" : "Continue"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ===== PRACTICE TAB ===== */}
      {tab === "practice" && (
        <div className="space-y-4">
          {!data.practice_lectures || data.practice_lectures.length === 0 ? (
            <div className="card empty">
              No practice exercises yet. Complete lecture content first.
            </div>
          ) : (
            data.practice_lectures.map((lecture) => (
              <div key={lecture.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold">
                      Lecture {lecture.lecture_number}
                    </h3>
                    <p className="text-[13px] text-[#6b7280]">{lecture.title}</p>
                  </div>
                  <span
                    className={`badge ${
                      lecture.practice_status === "completed"
                        ? "bg-[#dcfce7] text-[#166534]"
                        : lecture.practice_status === "in_progress"
                          ? "bg-[#eef2ff] text-[#4f46e5]"
                          : ""
                    }`}
                  >
                    {lecture.practice_status.replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-2">
                  {lecture.practices.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl"
                    >
                      <div>
                        <span className="text-[13px] font-medium">
                          {exercise.title}
                        </span>
                        <span className="text-[12px] text-[#6b7280] ml-2">
                          ({exercise.exercise_type})
                        </span>
                      </div>
                      <button
                        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          exercise.status === "completed"
                            ? "bg-[#16a34a] border-[#16a34a] text-white"
                            : "border-[#dfe3ea]"
                        }`}
                      >
                        {exercise.status === "completed" && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== REVISION TAB ===== */}
      {tab === "revision" && (
        <div className="space-y-6">
          {/* Overdue */}
          {data.overdue && data.overdue.length > 0 && (
            <div className="card">
              <div className="eyebrow mb-2">Overdue</div>
              <div className="space-y-2">
                {data.overdue.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="flex items-center justify-between p-3 bg-[#fef2f2] rounded-xl border border-[#fecaca]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#ef4444] font-bold">⚠</span>
                      <span className="text-[13px] font-medium">
                        Lecture {lecture.lecture_number} — {lecture.title}
                      </span>
                    </div>
                    <Link
                      href={`/deen/arabic/${lecture.id}`}
                      className="text-[13px] text-[#635bff] font-medium hover:underline"
                    >
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
                  <div
                    key={lecture.id}
                    className="flex items-center justify-between p-3 bg-[#fefce8] rounded-xl border border-[#fef08a]"
                  >
                    <span className="text-[13px] font-medium">
                      Lecture {lecture.lecture_number} — {lecture.title}
                    </span>
                    <Link
                      href={`/deen/arabic/${lecture.id}`}
                      className="text-[13px] text-[#635bff] font-medium hover:underline"
                    >
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
                  <div
                    key={lecture.id}
                    className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl"
                  >
                    <span className="text-[13px] font-medium">
                      Lecture {lecture.lecture_number} — {lecture.title}
                    </span>
                    <span className="text-[12px] text-[#6b7280]">
                      {lecture.next_revision_date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!data.overdue || data.overdue.length === 0) &&
            (!data.dueToday || data.dueToday.length === 0) &&
            (!data.upcoming || data.upcoming.length === 0) && (
              <div className="card empty">
                No revisions scheduled yet. Complete lectures to start revision tracking.
              </div>
            )}
        </div>
      )}

      {/* ===== MASTERY TAB ===== */}
      {tab === "mastery" && (
        <div className="space-y-4">
          {data.lectures?.map((lecture) => {
            const masteryColor =
              lecture.mastery_percentage < 50
                ? "text-[#ef4444]"
                : lecture.mastery_percentage < 80
                  ? "text-[#f59e0b]"
                  : "text-[#16a34a]";
            return (
              <div key={lecture.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">
                      Lecture {lecture.lecture_number} — {lecture.title}
                    </h3>
                    <p className="text-[12px] text-[#6b7280]">
                      {lecture.status === "completed"
                        ? "✓ Completed"
                        : lecture.status === "learning"
                          ? "◐ In Progress"
                          : "○ Not Started"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${masteryColor}`}>
                      {lecture.mastery_percentage}%
                    </div>
                    <div className="text-[12px] text-[#6b7280]">Mastery</div>
                  </div>
                </div>
                {lecture.status !== "not_started" && (
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-[#f6f7fb] rounded-lg">
                      <div className="text-[12px] text-[#6b7280]">Completion</div>
                      <div className="font-bold text-[13px]">
                        {lecture.completion_percentage}%
                      </div>
                    </div>
                    <div className="p-2 bg-[#f6f7fb] rounded-lg">
                      <div className="text-[12px] text-[#6b7280]">Practice</div>
                      <div className="font-bold text-[13px]">
                        {lecture.practice_status === "completed" ? "✓" : "○"}
                      </div>
                    </div>
                    <div className="p-2 bg-[#f6f7fb] rounded-lg">
                      <div className="text-[12px] text-[#6b7280]">Revisions</div>
                      <div className="font-bold text-[13px]">
                        {lecture.revision_count}
                      </div>
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

      {/* ===== NOTES TAB ===== */}
      {tab === "notes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-extrabold text-base">Notes</h2>
            <button className="btn-primary text-[13px]">+ New Note</button>
          </div>
          {!data.notes || data.notes.length === 0 ? (
            <div className="card empty">No notes yet.</div>
          ) : (
            data.notes.map((note) => (
              <div key={note.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    {note.arabic_term && (
                      <h3 className="font-bold text-sm">{note.arabic_term}</h3>
                    )}
                    {note.topic && (
                      <p className="text-[13px] text-[#6b7280]">{note.topic}</p>
                    )}
                    {note.meaning && (
                      <p className="text-[13px] mt-2">{note.meaning}</p>
                    )}
                    {note.my_understanding && (
                      <p className="text-[12px] text-[#6b7280] mt-2 italic">
                        {note.my_understanding}
                      </p>
                    )}
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
