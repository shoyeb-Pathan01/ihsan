"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, BookOpen, Check, X } from "lucide-react";
import Link from "next/link";

type Tab = "lectures" | "revision" | "notes";

interface Lecture {
  id: string; lecture_number: number; title: string; duration_seconds: number | null;
  watched: boolean; book: boolean; notes: boolean; examples: boolean;
  practice: boolean; mastery: number;
}

function formatDuration(s: number | null): string {
  if (!s) return "--:--";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function ArabicPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("lectures");
  const [showAll, setShowAll] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/deen/arabic");
      const data = await res.json();
      setLectures(data.lectures || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleWatched = async (id: string) => {
    const lecture = lectures.find((l) => l.id === id);
    if (!lecture) return;
    const newWatched = !lecture.watched;
    setLectures(lectures.map((l) => l.id === id ? { ...l, watched: newWatched } : l));
    await fetch("/api/deen/arabic", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, watched: newWatched }),
    });
  };

  const displayed = showAll ? lectures : lectures.slice(0, 15);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Loading...</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/deen" className="flex items-center gap-1 text-xs text-muted hover:text-foreground mb-3">
          <ArrowLeft className="h-3 w-3" /> Deen
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-arabic-light" />
          <h1 className="text-2xl font-semibold tracking-tight">ARABIC</h1>
        </div>
        <p className="text-sm text-muted mt-1">Lisān-ul-Qur&apos;ān — Level 1</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["lectures", "revision", "notes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              tab === t ? "border-arabic-light text-arabic-light" : "border-transparent text-muted hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Lectures Tab */}
      {tab === "lectures" && (
        <div className="space-y-1.5">
          {displayed.map((lecture) => (
            <div key={lecture.id} className="card p-3 flex items-center gap-3">
              <span className="text-xs text-muted font-mono w-6 shrink-0">{lecture.lecture_number}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{lecture.title}</p>
                <p className="text-[10px] text-muted">{formatDuration(lecture.duration_seconds)}</p>
              </div>
              <button onClick={() => toggleWatched(lecture.id)} className="shrink-0">
                {lecture.watched ? (
                  <Check className="h-4 w-4 text-arabic-light" />
                ) : (
                  <X className="h-4 w-4 text-muted/40 hover:text-muted" />
                )}
              </button>
            </div>
          ))}
          {lectures.length > 15 && (
            <button onClick={() => setShowAll(!showAll)} className="text-xs text-arabic-light hover:underline mt-2">
              {showAll ? "Show less" : `Show all ${lectures.length} lectures`}
            </button>
          )}
        </div>
      )}

      {/* Revision Tab */}
      {tab === "revision" && (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted">No revision records yet.</p>
        </div>
      )}

      {/* Notes Tab */}
      {tab === "notes" && (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted">No notes yet.</p>
        </div>
      )}
    </div>
  );
}
