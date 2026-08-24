"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Session {
  id: string; date: string; practice_type: string; duration_minutes: number | null;
  topic: string | null; confidence_score: number | null; clarity_score: number | null;
  fluency_score: number | null; notes: string | null;
}

const PRACTICE_TYPES = [
  "Speaking", "Reading Aloud", "Technical Explanation",
  "Interview Answer", "Presentation", "Conversation", "Teaching", "English Communication",
];

const EXPLAIN_PROMPTS = [
  "Explain Azure RBAC in 90 seconds without your notes",
  "Explain Hub-Spoke architecture as if explaining to a client",
  "Explain VNet vs Subnet",
  "Explain Conditional Access",
  "Explain the difference between NSG and ASG",
];

export default function CommunicationPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    practiceType: "Technical Explanation",
    durationMinutes: "",
    topic: "",
    confidenceScore: "3",
    clarityScore: "3",
    fluencyScore: "3",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/career/communication");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/career/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date, practice_type: form.practiceType,
          duration_minutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
          topic: form.topic || null,
          confidence_score: parseInt(form.confidenceScore),
          clarity_score: parseInt(form.clarityScore),
          fluency_score: parseInt(form.fluencyScore),
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessions((prev) => [data.session, ...prev]);
        setForm({ date: new Date().toISOString().split("T")[0], practiceType: "Technical Explanation", durationMinutes: "", topic: "", confidenceScore: "3", clarityScore: "3", fluencyScore: "3", notes: "" });
      }
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-start gap-5">
        <div>
          <div className="eyebrow">Communication</div>
          <h1 className="text-[30px] font-bold mt-1 mb-1">Communication Practice</h1>
          <p className="text-[#6b7280] m-0">Small daily reps. Better clarity. Better confidence.</p>
        </div>
        <button onClick={() => document.getElementById("log-form")?.scrollIntoView({ behavior: "smooth" })} className="btn-primary">
          + Log practice
        </button>
      </div>

      {/* Explain It */}
      <div className="card">
        <div className="eyebrow mb-2">Explain It Challenge</div>
        <p className="text-[15px] font-bold mb-3">{EXPLAIN_PROMPTS[promptIndex]}</p>
        <button onClick={() => setPromptIndex((p) => (p + 1) % EXPLAIN_PROMPTS.length)} className="text-[13px] text-[#635bff] font-medium hover:underline">
          Next prompt →
        </button>
      </div>

      {/* Log Form */}
      <div id="log-form" className="card">
        <h3 className="font-extrabold text-base mb-4">Log Practice</h3>
        <form onSubmit={handleSubmit} className="form-group">
          <div className="grid-2">
            <div>
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label>Type</label>
              <select value={form.practiceType} onChange={(e) => setForm({ ...form, practiceType: e.target.value })}>
                {PRACTICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label>Duration (min)</label>
              <input type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} placeholder="Optional" />
            </div>
            <div>
              <label>Topic</label>
              <input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Azure RBAC" />
            </div>
          </div>
          <div className="grid-2">
            {[
              { key: "confidenceScore", label: "Confidence" },
              { key: "clarityScore", label: "Clarity" },
              { key: "fluencyScore", label: "Fluency" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label>{label} (1-5)</label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} type="button" onClick={() => setForm({ ...form, [key]: String(v) })}
                      className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                        form[key as keyof typeof form] === String(v)
                          ? "bg-[#111827] text-white border-[#111827]"
                          : "bg-white text-[#4b5563] border-[#dfe3ea] hover:border-[#635bff]"
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="How did it go?" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>

      {/* Sessions Table */}
      <div className="card">
        <h2 className="font-extrabold text-base mb-4">Recent Sessions</h2>
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Skill</th><th>Practice</th><th>Self-score</th></tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr><td colSpan={4} className="empty">No practice logged yet.</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.date}</td>
                  <td className="font-medium">{s.practice_type}</td>
                  <td>{s.topic || "—"}</td>
                  <td>{s.confidence_score}/5</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
