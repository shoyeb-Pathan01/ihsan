"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

interface LectureDetail {
  id: string;
  lecture_number: number;
  title: string;
  youtube_url: string | null;
  status: string;
  watched: boolean;
  book: boolean;
  lecture_notes: boolean;
  quranic_examples: boolean;
  practice_status: string;
  practice_notes_ok: boolean;
  practice_examples_ok: boolean;
  practice_exercises_ok: boolean;
  practice_explain_ok: boolean;
  revision_count: number;
  next_revision_date: string | null;
  completion_percentage: number;
  mastery_percentage: number;
  notes: { id: string; arabic_term: string | null; meaning: string | null; my_understanding: string | null; created_at: string }[];
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/);
  return match ? match[1] : null;
}

export default function ArabicWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lecture, setLecture] = useState<LectureDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<LectureDetail["notes"]>([]);

  const fetchLecture = useCallback(async () => {
    try {
      const res = await fetch(`/api/deen/arabic?lectureId=${id}`);
      const data = await res.json();
      setLecture(data.lecture);
      setNotes(data.lecture?.notes || []);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchLecture(); }, [fetchLecture]);

  const toggleStage = async (field: string, value: boolean) => {
    if (!lecture) return;
    const fields = ["watched", "book", "lecture_notes", "quranic_examples"];
    const updated = { ...lecture, [field]: value };
    const completed = fields.filter((f) => updated[f as keyof LectureDetail] as boolean).length;
    const completion = Math.round((completed / fields.length) * 100);
    const status = completion === 100 ? "completed" : completion > 0 ? "learning" : "not_started";

    setSaving(true);
    try {
      await fetch("/api/deen/arabic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value, completion_percentage: completion, status }),
      });
      setLecture((prev) => prev ? { ...prev, [field]: value, completion_percentage: completion, status } : null);
    } catch {} finally { setSaving(false); }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/deen/arabic/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lecture_id: id, arabic_term: noteText.trim(), meaning: "", my_understanding: "", category: "note" }),
      });
      setNoteText("");
      fetchLecture();
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!lecture) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Lecture not found.</p></div>;
  }

  const stages = [
    { key: "watched", label: "Watched", done: lecture.watched },
    { key: "book", label: "Book", done: lecture.book },
    { key: "lecture_notes", label: "Notes", done: lecture.lecture_notes },
    { key: "quranic_examples", label: "Examples", done: lecture.quranic_examples },
  ];

  const completedStages = stages.filter((s) => s.done).length;
  const youtubeId = lecture.youtube_url ? extractYouTubeId(lecture.youtube_url) : null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[#6b7280] hover:text-[#635bff]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-[22px] font-bold">Lecture {lecture.lecture_number} · {lecture.title}</h1>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[20px] font-bold">{lecture.completion_percentage}%</div>
          <div className="text-[12px] text-[#6b7280]">Completion</div>
        </div>
      </div>

      {/* Stages bar */}
      <div className="flex items-center gap-1 mb-5">
        {stages.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            <button
              onClick={() => toggleStage(s.key, !s.done)}
              disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                s.done
                  ? "bg-[#16a34a] text-white border-[#16a34a]"
                  : "bg-white text-[#4b5563] border-[#dfe3ea] hover:border-[#635bff]"
              }`}
            >
              {s.done && <Check className="h-3 w-3" />}
              {s.label}
            </button>
            {i < stages.length - 1 && <span className="text-[#dfe3ea]">→</span>}
          </div>
        ))}
      </div>

      {/* Main workspace: video + notes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Video + Revision (left 3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Embedded YouTube */}
          <div className="card p-0 overflow-hidden">
            {youtubeId ? (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Lecture ${lecture.lecture_number}`}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-[#f6f7fb] text-[#6b7280] text-[13px]">
                No video link available
              </div>
            )}
          </div>

          {/* Revision quick-log */}
          <div className="card">
            <div className="eyebrow mb-2">REVISION</div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px]">Revisions done: <strong>{lecture.revision_count}</strong></span>
              {lecture.next_revision_date && (
                <span className="text-[12px] text-[#6b7280]">Next: {lecture.next_revision_date}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px]">Mastery:</span>
              <span className={`text-[13px] font-bold ${lecture.mastery_percentage >= 70 ? "text-[#16a34a]" : lecture.mastery_percentage >= 40 ? "text-[#c99522]" : "text-[#ef4444]"}`}>
                {lecture.mastery_percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Notes (right 2/5) */}
        <div className="lg:col-span-2">
          <div className="card sticky top-4">
            <div className="eyebrow mb-3">MY NOTES</div>

            {/* Add note */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add a note..."
                className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-[#dfe3ea] focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/10 outline-none"
              />
              <button
                onClick={addNote}
                disabled={saving || !noteText.trim()}
                className="btn-primary text-[13px] px-3"
              >
                +
              </button>
            </div>

            {/* Notes list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-[13px] text-[#6b7280] text-center py-8">No notes yet. Start typing above.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-3 bg-[#f6f7fb] rounded-xl">
                    <p className="text-[13px] font-medium">{note.arabic_term}</p>
                    {note.meaning && <p className="text-[12px] text-[#6b7280] mt-1">{note.meaning}</p>}
                    {note.my_understanding && <p className="text-[12px] text-[#6b7280] mt-1 italic">{note.my_understanding}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
