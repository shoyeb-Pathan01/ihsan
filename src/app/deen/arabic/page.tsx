"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, X } from "lucide-react";

type Tab = "lectures" | "revision" | "notes";

interface Lecture {
  id: string; lecture_number: number; title: string; duration_seconds: number | null;
  watched: boolean; book: boolean; notes: boolean; examples: boolean;
  practice: boolean; mastery: number;
}

function formatDuration(s: number | null): string {
  if (!s) return "—";
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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="eyebrow">Qur&apos;an Journey</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Arabic</h1>
        <p className="text-[#6b7280] m-0">Lisān-ul-Qur&apos;ān — Level 1</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(["lectures", "revision", "notes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Lectures Tab */}
      {tab === "lectures" && (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Lecture</th><th>Duration</th><th>Status</th></tr>
            </thead>
            <tbody>
              {displayed.map((lecture) => (
                <tr key={lecture.id}>
                  <td className="font-mono text-[#6b7280]">{lecture.lecture_number}</td>
                  <td className="font-medium">{lecture.title}</td>
                  <td className="text-[#6b7280]">{formatDuration(lecture.duration_seconds)}</td>
                  <td>
                    <button onClick={() => toggleWatched(lecture.id)}>
                      {lecture.watched ? (
                        <Check className="h-4 w-4 text-[#16a34a]" />
                      ) : (
                        <X className="h-4 w-4 text-[#d1d5db] hover:text-[#6b7280]" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lectures.length > 15 && (
            <button onClick={() => setShowAll(!showAll)} className="text-[13px] text-[#635bff] font-medium hover:underline mt-3">
              {showAll ? "Show less" : `Show all ${lectures.length} lectures`}
            </button>
          )}
        </div>
      )}

      {/* Revision Tab */}
      {tab === "revision" && (
        <div className="card empty">No revision records yet.</div>
      )}

      {/* Notes Tab */}
      {tab === "notes" && (
        <div className="card empty">No notes yet.</div>
      )}
    </div>
  );
}
