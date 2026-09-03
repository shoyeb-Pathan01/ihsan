"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Workspace, Note } from "@/components/Workspace";
import { Card } from "@/components/ui/Card";

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
  notes: Note[];
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
  const [notes, setNotes] = useState<Note[]>([]);

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

  const addNote = async (text: string) => {
    setSaving(true);
    try {
      await fetch("/api/deen/arabic/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lecture_id: id, arabic_term: text, meaning: "", my_understanding: "", category: "note" }),
      });
      fetchLecture();
    } catch {} finally { setSaving(false); }
  };

  const handleSelfTestResult = async (result: "pass" | "fail") => {
    setSaving(true);
    try {
      await fetch("/api/deen/arabic/revision", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lecture_id: id, result }),
      });
      fetchLecture();
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[var(--color-muted)] text-sm">Loading...</p></div>;
  }

  if (!lecture) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[var(--color-muted)] text-sm">Lecture not found.</p></div>;
  }

  const stages = [
    { key: "watched", label: "Watched", done: lecture.watched },
    { key: "book", label: "Book", done: lecture.book },
    { key: "lecture_notes", label: "Notes", done: lecture.lecture_notes },
    { key: "quranic_examples", label: "Examples", done: lecture.quranic_examples },
  ];

  const youtubeId = lecture.youtube_url ? extractYouTubeId(lecture.youtube_url) : null;

  return (
    <Workspace
      title={`Lecture ${lecture.lecture_number} · ${lecture.title}`}
      backHref="/"
      completionPct={lecture.completion_percentage}
      masteryPct={lecture.mastery_percentage}
      stages={stages}
      goal="deen"
      onStageToggle={toggleStage}
      saving={saving}
      notes={notes}
      onNoteAdd={addNote}
      revisionInfo={{ count: lecture.revision_count, nextDate: lecture.next_revision_date, lectureId: lecture.id }}
      onSelfTestResult={handleSelfTestResult}
      nav={{
        prev: lecture.lecture_number > 1
          ? { href: `/arabic/lec_${lecture.lecture_number - 1}`, label: `Lecture ${lecture.lecture_number - 1}` }
          : undefined,
        next: { href: `/arabic/lec_${lecture.lecture_number + 1}`, label: `Lecture ${lecture.lecture_number + 1}` },
      }}
    >
      {/* Embedded YouTube */}
      <Card className="p-0 overflow-hidden">
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
          <div className="flex items-center justify-center h-48 bg-[var(--color-surface-elevated)] text-[var(--color-muted)] text-[13px]">
            No video link available
          </div>
        )}
      </Card>
    </Workspace>
  );
}
