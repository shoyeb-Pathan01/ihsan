"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, MessageSquare, Mic } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Loading...</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/career" className="flex items-center gap-1 text-xs text-muted hover:text-foreground mb-3">
          <ArrowLeft className="h-3 w-3" /> Career
        </Link>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-communication" />
          <h1 className="text-2xl font-semibold tracking-tight">COMMUNICATION</h1>
        </div>
        <p className="text-sm text-muted mt-1">Track your speaking and explanation practice.</p>
      </div>

      {/* Explain It */}
      <div className="card p-5 border-l-4 border-communication/40">
        <p className="text-xs text-muted uppercase tracking-wider mb-2">Explain It Challenge</p>
        <p className="text-sm font-medium mb-3">{EXPLAIN_PROMPTS[promptIndex]}</p>
        <button onClick={() => setPromptIndex((p) => (p + 1) % EXPLAIN_PROMPTS.length)} className="text-xs text-communication hover:underline">
          Next prompt →
        </button>
      </div>

      {/* Log Form */}
      <div className="card p-5">
        <h3 className="text-sm font-medium mb-4">Log Session</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Type</label>
              <select value={form.practiceType} onChange={(e) => setForm({ ...form, practiceType: e.target.value })}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50">
                {PRACTICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Duration (min)</label>
              <input type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                placeholder="Optional" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50 placeholder:text-muted/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Topic</label>
              <input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. Azure RBAC" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50 placeholder:text-muted/50" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "confidenceScore", label: "Confidence" },
              { key: "clarityScore", label: "Clarity" },
              { key: "fluencyScore", label: "Fluency" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">{label} (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} type="button" onClick={() => setForm({ ...form, [key]: String(v) })}
                      className={cn("flex-1 py-2 rounded-lg text-xs font-medium border transition-colors",
                        form[key as keyof typeof form] === String(v)
                          ? "bg-communication/20 text-communication border-communication/40"
                          : "bg-surface-elevated text-muted border-border"
                      )}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              placeholder="How did it go?" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50 resize-none placeholder:text-muted/50" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-communication/20 hover:bg-communication/30 text-communication text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? "Saving..." : <><Mic className="h-3.5 w-3.5" /> Log Session</>}
          </button>
        </form>
      </div>

      {/* Sessions */}
      <div>
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Recent Sessions</p>
        {sessions.length === 0 ? (
          <div className="card p-8 text-center">
            <MessageSquare className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-communication/15 text-communication">{s.practice_type}</span>
                  <span className="text-[10px] text-muted">{s.date}</span>
                </div>
                {s.topic && <p className="text-sm font-medium">{s.topic}</p>}
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted">
                  {s.duration_minutes && <span>{s.duration_minutes}min</span>}
                  {s.confidence_score && <span>Confidence: {s.confidence_score}/5</span>}
                  {s.clarity_score && <span>Clarity: {s.clarity_score}/5</span>}
                  {s.fluency_score && <span>Fluency: {s.fluency_score}/5</span>}
                </div>
                {s.notes && <p className="text-xs text-muted mt-1 line-clamp-1">{s.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
