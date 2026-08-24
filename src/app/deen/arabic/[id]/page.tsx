"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, ExternalLink } from "lucide-react";

interface LectureDetail {
  id: string;
  lecture_number: number;
  title: string;
  duration_seconds: number | null;
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
  last_revision_date: string | null;
  next_revision_date: string | null;
  completion_percentage: number;
  mastery_percentage: number;
  quiz_score: number | null;
  understanding: number | null;
  confidence: number | null;
  started_at: string | null;
  completed_at: string | null;
  practices: {
    id: string;
    exercise_number: number;
    title: string;
    description: string;
    exercise_type: string;
    status: string;
    user_answer: string | null;
  }[];
  revisions: {
    id: string;
    date: string;
    understanding: number;
    confidence: number;
    struggles: string | null;
    next_revision_date: string | null;
  }[];
  notes: {
    id: string;
    topic: string | null;
    arabic_term: string | null;
    meaning: string | null;
    examples: string | null;
    my_understanding: string | null;
    category: string | null;
    created_at: string;
  }[];
  examples: {
    id: string;
    arabic_text: string;
    translation: string | null;
    my_analysis: string | null;
    term_identified: string | null;
    meaning: string | null;
  }[];
  explain_sessions: {
    id: string;
    prompt: string;
    understanding: number | null;
    confidence: number | null;
    notes: string | null;
    created_at: string;
  }[];
}

export default function LectureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lecture, setLecture] = useState<LectureDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"content" | "practice" | "revision" | "mastery" | "proof">("content");

  // Revision form
  const [revisionForm, setRevisionForm] = useState({
    understanding: "3",
    confidence: "3",
    struggles: "",
  });

  // Note form
  const [noteForm, setNoteForm] = useState({
    arabic_term: "",
    meaning: "",
    my_understanding: "",
    category: "term",
  });

  // Example form
  const [exampleForm, setExampleForm] = useState({
    arabic_text: "",
    translation: "",
    my_analysis: "",
    term_identified: "",
    meaning: "",
  });

  // Explain form
  const [explainForm, setExplainForm] = useState({
    prompt: "",
    understanding: "3",
    confidence: "3",
    notes: "",
  });

  const fetchLecture = useCallback(async () => {
    try {
      const res = await fetch(`/api/deen/arabic?lectureId=${id}`);
      const data = await res.json();
      setLecture(data.lecture);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchLecture(); }, [fetchLecture]);

  const updateLecture = async (updates: Partial<LectureDetail>) => {
    setSaving(true);
    try {
      await fetch("/api/deen/arabic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      setLecture((prev) => prev ? { ...prev, ...updates } : null);
    } catch {} finally { setSaving(false); }
  };

  const togglePipeline = async (field: string, value: boolean) => {
    await updateLecture({ [field]: value });
    // Recalculate completion
    if (lecture) {
      const fields = ["watched", "book", "lecture_notes", "quranic_examples"];
      const updated = { ...lecture, [field]: value };
      const completed = fields.filter((f) => updated[f as keyof LectureDetail] as boolean).length;
      const completion = Math.round((completed / fields.length) * 100);
      const status = completion === 100 ? "completed" : completion > 0 ? "learning" : "not_started";
      await updateLecture({ completion_percentage: completion, status });
    }
  };

  const submitRevision = async () => {
    await fetch("/api/deen/arabic/revision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lecture_id: id,
        understanding: parseInt(revisionForm.understanding),
        confidence: parseInt(revisionForm.confidence),
        struggles: revisionForm.struggles || null,
      }),
    });
    setRevisionForm({ understanding: "3", confidence: "3", struggles: "" });
    fetchLecture();
  };

  const submitNote = async () => {
    await fetch("/api/deen/arabic/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lecture_id: id,
        ...noteForm,
      }),
    });
    setNoteForm({ arabic_term: "", meaning: "", my_understanding: "", category: "term" });
    fetchLecture();
  };

  const submitExample = async () => {
    await fetch("/api/deen/arabic/examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lecture_id: id,
        ...exampleForm,
      }),
    });
    setExampleForm({ arabic_text: "", translation: "", my_analysis: "", term_identified: "", meaning: "" });
    fetchLecture();
  };

  const submitExplain = async () => {
    await fetch("/api/deen/arabic/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lecture_id: id,
        ...explainForm,
        understanding: parseInt(explainForm.understanding),
        confidence: parseInt(explainForm.confidence),
      }),
    });
    setExplainForm({ prompt: "", understanding: "3", confidence: "3", notes: "" });
    fetchLecture();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!lecture) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Lecture not found.</p></div>;
  }

  const pipelineFields = [
    { key: "watched", label: "Lecture Watched" },
    { key: "book", label: "Book Studied" },
    { key: "lecture_notes", label: "Roman Urdu Notes" },
    { key: "quranic_examples", label: "Qur'anic Examples" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <Link href="/deen/arabic" className="text-[13px] text-[#635bff] hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to Arabic
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[30px] font-bold">LECTURE {lecture.lecture_number}</h1>
            <p className="text-[#6b7280]">{lecture.title}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{lecture.mastery_percentage}%</div>
            <div className="text-[13px] text-[#6b7280]">Mastery</div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="tabs">
        {(["content", "practice", "revision", "mastery", "proof"] as const).map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} className={activeSection === s ? "active" : ""}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {activeSection === "content" && (
        <div className="space-y-6">
          {/* Open Lecture */}
          <div className="card">
            <div className="eyebrow mb-2">Content</div>
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <ExternalLink className="h-4 w-4" /> Open Lecture
            </button>
          </div>

          {/* Learning Pipeline */}
          <div className="card">
            <div className="eyebrow mb-3">Learning Pipeline</div>
            <div className="space-y-3">
              {pipelineFields.map(({ key, label }) => (
                <label key={key} className="check">
                  <input
                    type="checkbox"
                    checked={lecture[key as keyof LectureDetail] as boolean}
                    onChange={(e) => togglePipeline(key, e.target.checked)}
                  />
                  <span className="text-[13px]">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <div className="goal-head text-[13px] mb-1">
                <span>Completion</span>
                <span>{lecture.completion_percentage}%</span>
              </div>
              <div className="progress">
                <div className="bar" style={{ width: `${lecture.completion_percentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Section */}
      {activeSection === "practice" && (
        <div className="space-y-6">
          {/* Practice Status */}
          <div className="card">
            <div className="eyebrow mb-2">Practice Status</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "practice_notes_ok", label: "Notes ✓" },
                { key: "practice_examples_ok", label: "Examples ✓" },
                { key: "practice_exercises_ok", label: "Exercises ✓" },
                { key: "practice_explain_ok", label: "Self Explanation ✓" },
              ].map(({ key, label }) => (
                <label key={key} className="check">
                  <input
                    type="checkbox"
                    checked={lecture[key as keyof LectureDetail] as boolean}
                    onChange={(e) => togglePipeline(key, e.target.checked)}
                  />
                  <span className="text-[13px]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="card">
            <div className="eyebrow mb-3">Exercises</div>
            {lecture.practices.length === 0 ? (
              <p className="text-[13px] text-[#6b7280]">No exercises yet.</p>
            ) : (
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
            )}
          </div>

          {/* Qur'anic Examples */}
          <div className="card">
            <div className="eyebrow mb-3">Qur&apos;anic Examples</div>
            {lecture.examples.length === 0 ? (
              <p className="text-[13px] text-[#6b7280]">No examples added yet.</p>
            ) : (
              <div className="space-y-3">
                {lecture.examples.map((example) => (
                  <div key={example.id} className="p-3 bg-[#f6f7fb] rounded-xl">
                    <p className="font-bold text-sm mb-1">{example.arabic_text}</p>
                    {example.translation && <p className="text-[13px] text-[#6b7280]">{example.translation}</p>}
                    {example.term_identified && <p className="text-[12px] text-[#635bff] mt-1">Term: {example.term_identified}</p>}
                    {example.my_analysis && <p className="text-[12px] text-[#6b7280] mt-1 italic">{example.my_analysis}</p>}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-3">
              <input type="text" placeholder="Arabic text" value={exampleForm.arabic_text} onChange={(e) => setExampleForm({ ...exampleForm, arabic_text: e.target.value })} />
              <input type="text" placeholder="Translation" value={exampleForm.translation} onChange={(e) => setExampleForm({ ...exampleForm, translation: e.target.value })} />
              <input type="text" placeholder="Term identified (e.g. Ism, Fi'l, Harf)" value={exampleForm.term_identified} onChange={(e) => setExampleForm({ ...exampleForm, term_identified: e.target.value })} />
              <textarea placeholder="Your analysis" value={exampleForm.my_analysis} onChange={(e) => setExampleForm({ ...exampleForm, my_analysis: e.target.value })} rows={2} />
              <button onClick={submitExample} className="btn-primary text-[13px]" disabled={!exampleForm.arabic_text}>Add Example</button>
            </div>
          </div>

          {/* Explain It */}
          <div className="card">
            <div className="eyebrow mb-3">Explain It</div>
            {lecture.explain_sessions.length > 0 && (
              <div className="space-y-2 mb-4">
                {lecture.explain_sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="p-3 bg-[#f6f7fb] rounded-xl">
                    <p className="text-[13px] font-medium">{session.prompt}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[12px] text-[#6b7280]">Understanding: {session.understanding}/5</span>
                      <span className="text-[12px] text-[#6b7280]">Confidence: {session.confidence}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <textarea placeholder="Explain a concept from this lecture without looking at your notes..." value={explainForm.prompt} onChange={(e) => setExplainForm({ ...explainForm, prompt: e.target.value })} rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-[#6b7280]">Understanding</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} type="button" onClick={() => setExplainForm({ ...explainForm, understanding: String(v) })}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                          explainForm.understanding === String(v) ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#4b5563] border-[#dfe3ea]"
                        }`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#6b7280]">Confidence</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} type="button" onClick={() => setExplainForm({ ...explainForm, confidence: String(v) })}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                          explainForm.confidence === String(v) ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#4b5563] border-[#dfe3ea]"
                        }`}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea placeholder="Notes (optional)" value={explainForm.notes} onChange={(e) => setExplainForm({ ...explainForm, notes: e.target.value })} rows={2} />
              <button onClick={submitExplain} className="btn-primary text-[13px]" disabled={!explainForm.prompt}>Save Explanation</button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Section */}
      {activeSection === "revision" && (
        <div className="space-y-6">
          <div className="card">
            <div className="eyebrow mb-2">Revision Info</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
                <div className="text-2xl font-bold">{lecture.revision_count}</div>
                <div className="text-[13px] text-[#6b7280]">Revisions</div>
              </div>
              <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
                <div className="text-2xl font-bold">{lecture.next_revision_date || "—"}</div>
                <div className="text-[13px] text-[#6b7280]">Next Revision</div>
              </div>
            </div>
          </div>

          {/* New Revision */}
          <div className="card">
            <div className="eyebrow mb-3">Log Revision</div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-[#6b7280]">Understanding</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} type="button" onClick={() => setRevisionForm({ ...revisionForm, understanding: String(v) })}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                          revisionForm.understanding === String(v) ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#4b5563] border-[#dfe3ea]"
                        }`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#6b7280]">Confidence</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} type="button" onClick={() => setRevisionForm({ ...revisionForm, confidence: String(v) })}
                        className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                          revisionForm.confidence === String(v) ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#4b5563] border-[#dfe3ea]"
                        }`}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea placeholder="What did you still struggle with?" value={revisionForm.struggles} onChange={(e) => setRevisionForm({ ...revisionForm, struggles: e.target.value })} rows={2} />
              <button onClick={submitRevision} className="btn-primary text-[13px]">Save Revision</button>
            </div>
          </div>

          {/* Revision History */}
          {lecture.revisions.length > 0 && (
            <div className="card">
              <div className="eyebrow mb-3">Revision History</div>
              <div className="space-y-2">
                {lecture.revisions.map((rev) => (
                  <div key={rev.id} className="p-3 bg-[#f6f7fb] rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium">{rev.date}</span>
                      <div className="flex gap-2">
                        <span className="text-[12px] text-[#6b7280]">U: {rev.understanding}/5</span>
                        <span className="text-[12px] text-[#6b7280]">C: {rev.confidence}/5</span>
                      </div>
                    </div>
                    {rev.struggles && <p className="text-[12px] text-[#6b7280] mt-1">{rev.struggles}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mastery Section */}
      {activeSection === "mastery" && (
        <div className="space-y-6">
          <div className="card">
            <div className="eyebrow mb-3">Mastery Breakdown</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
                <div className="text-2xl font-bold">{lecture.completion_percentage}%</div>
                <div className="text-[13px] text-[#6b7280]">Completion</div>
              </div>
              <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
                <div className="text-2xl font-bold">{lecture.mastery_percentage}%</div>
                <div className="text-[13px] text-[#6b7280]">Mastery</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span>Practice</span>
                <span>{lecture.practice_status === "completed" ? "✓" : "○"}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span>Revisions</span>
                <span>{lecture.revision_count}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span>Understanding</span>
                <span>{lecture.understanding || "—"}/5</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span>Confidence</span>
                <span>{lecture.confidence || "—"}/5</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span>Quiz Score</span>
                <span>{lecture.quiz_score || "—"}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof of Learning Section */}
      {activeSection === "proof" && (
        <div className="space-y-6">
          <div className="card">
            <div className="eyebrow mb-3">Proof of Learning</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                <span className="text-[13px]">Roman Urdu Notes</span>
                <span className="text-[13px]">{lecture.lecture_notes ? "✓" : "○"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                <span className="text-[13px]">Qur&apos;anic Examples</span>
                <span className="text-[13px]">{lecture.quranic_examples ? "✓" : "○"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                <span className="text-[13px]">Practice Answers</span>
                <span className="text-[13px]">{lecture.practice_exercises_ok ? "✓" : "○"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                <span className="text-[13px]">Self Explanation</span>
                <span className="text-[13px]">{lecture.practice_explain_ok ? "✓" : "○"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                <span className="text-[13px]">Questions / Doubts</span>
                <span className="text-[13px]">—</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="eyebrow mb-3">Notes</div>
            {lecture.notes.length === 0 ? (
              <p className="text-[13px] text-[#6b7280]">No notes yet.</p>
            ) : (
              <div className="space-y-2">
                {lecture.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-[#f6f7fb] rounded-xl">
                    {note.arabic_term && <p className="font-bold text-sm">{note.arabic_term}</p>}
                    {note.meaning && <p className="text-[13px] text-[#6b7280]">{note.meaning}</p>}
                    {note.my_understanding && <p className="text-[12px] text-[#6b7280] mt-1 italic">{note.my_understanding}</p>}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-3">
              <input type="text" placeholder="Arabic term (e.g. Ism, Fi'l)" value={noteForm.arabic_term} onChange={(e) => setNoteForm({ ...noteForm, arabic_term: e.target.value })} />
              <input type="text" placeholder="Meaning" value={noteForm.meaning} onChange={(e) => setNoteForm({ ...noteForm, meaning: e.target.value })} />
              <textarea placeholder="Your understanding" value={noteForm.my_understanding} onChange={(e) => setNoteForm({ ...noteForm, my_understanding: e.target.value })} rows={2} />
              <button onClick={submitNote} className="btn-primary text-[13px]" disabled={!noteForm.arabic_term}>Add Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
