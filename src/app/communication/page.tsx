"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Mic,
  Star,
  Zap,
  ArrowRight,
} from "lucide-react";

interface CommunicationSession {
  id: string;
  date: string;
  practiceType: string;
  durationMinutes: number | null;
  topic: string | null;
  confidenceScore: number | null;
  clarityScore: number | null;
  fluencyScore: number | null;
  notes: string | null;
}

interface CommunicationStats {
  totalSessions: number;
  thisWeekSessions: number;
  averageConfidence: number;
}

const PRACTICE_TYPES = [
  "Speaking",
  "Reading Aloud",
  "Technical Explanation",
  "Interview Answer",
  "Presentation",
  "Conversation",
  "Teaching",
  "English Communication",
];

const EXPLAIN_PROMPTS = [
  "Explain Azure RBAC in 90 seconds without your notes",
  "Explain Hub-Spoke architecture as if explaining to a client",
  "Explain VNet vs Subnet",
  "Explain Conditional Access",
  "Explain the difference between NSG and ASG",
];

const practiceTypeColors: Record<string, string> = {
  Speaking: "bg-communication/15 text-communication",
  "Reading Aloud": "bg-communication/15 text-communication",
  "Technical Explanation": "bg-azure/15 text-azure-light",
  "Interview Answer": "bg-arabic/15 text-arabic-light",
  Presentation: "bg-tahajjud/15 text-tahajjud",
  Conversation: "bg-communication/15 text-communication",
  Teaching: "bg-warning/15 text-warning",
  "English Communication": "bg-communication/15 text-communication",
};

export default function CommunicationPage() {
  const [sessions, setSessions] = useState<CommunicationSession[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
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
      const res = await fetch("/api/communication");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSessions(data.recentSessions);
      setStats(data.stats);
    } catch {
      console.error("Failed to load communication data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cyclePrompt = () => {
    setPromptIndex((prev) => (prev + 1) % EXPLAIN_PROMPTS.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          practiceType: form.practiceType,
          durationMinutes: form.durationMinutes
            ? parseInt(form.durationMinutes)
            : null,
          topic: form.topic || null,
          confidenceScore: parseInt(form.confidenceScore),
          clarityScore: parseInt(form.clarityScore),
          fluencyScore: parseInt(form.fluencyScore),
          notes: form.notes || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessions((prev) => [data.session, ...prev].slice(0, 10));
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalSessions: prev.totalSessions + 1,
                thisWeekSessions: prev.thisWeekSessions + 1,
              }
            : null,
        );
        setForm({
          date: new Date().toISOString().split("T")[0],
          practiceType: "Technical Explanation",
          durationMinutes: "",
          topic: "",
          confidenceScore: "3",
          clarityScore: "3",
          fluencyScore: "3",
          notes: "",
        });
      }
    } catch {
      console.error("Failed to save session");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">
          Loading communication data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-communication" />
          <h1 className="text-xs font-bold tracking-[0.3em] text-communication uppercase">
            Communication
          </h1>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          COMMUNICATION PRACTICE
        </h2>
      </div>

      {/* Why This Matters */}
      <div className="glass-card rounded-xl p-5 border-communication/20">
        <div className="flex items-start gap-3">
          <Star className="h-4 w-4 text-communication mt-0.5 shrink-0" />
          <p className="text-sm text-muted leading-relaxed">
            Communication supports both Azure career development and general
            personal development. Every technical explanation strengthens
            interview readiness.
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-communication">
              {stats.totalSessions}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Sessions
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-communication">
              {stats.thisWeekSessions}
            </p>
            <p className="text-xs text-muted-foreground mt-1">This Week</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-communication">
              {stats.averageConfidence}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg Confidence
            </p>
          </div>
        </div>
      )}

      {/* Explain It Challenge */}
      <div className="glass-card rounded-xl p-5 border-communication/20">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-communication" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-communication">
            Explain It Challenge
          </h3>
        </div>
        <div className="bg-surface-elevated/50 rounded-lg p-4 mb-3">
          <p className="text-sm font-medium leading-relaxed">
            {EXPLAIN_PROMPTS[promptIndex]}
          </p>
        </div>
        <button
          onClick={cyclePrompt}
          className="flex items-center gap-2 text-xs text-communication hover:text-communication/80 transition-colors font-medium"
        >
          <ArrowRight className="h-3 w-3" />
          Next Prompt
        </button>
      </div>

      {/* Log New Session */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-communication mb-4">
          Log New Session
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">
                Practice Type
              </label>
              <select
                value={form.practiceType}
                onChange={(e) =>
                  setForm({ ...form, practiceType: e.target.value })
                }
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50"
              >
                {PRACTICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: e.target.value })
                }
                placeholder="e.g. 15"
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50 placeholder:text-muted/50"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Topic</label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. Azure RBAC"
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50 placeholder:text-muted/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "confidenceScore", label: "Confidence" },
              { key: "clarityScore", label: "Clarity" },
              { key: "fluencyScore", label: "Fluency" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-muted mb-1">
                  {label} (1-5)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, [key]: String(val) })}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-medium transition-colors border",
                        form[key as keyof typeof form] === String(val)
                          ? "bg-communication/20 text-communication border-communication/40"
                          : "bg-surface-elevated text-muted border-border hover:border-communication/20"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="How did it go?"
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-communication/50 resize-none placeholder:text-muted/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-communication/20 hover:bg-communication/30 text-communication text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-communication"></div>
                Saving...
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                Log Session
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Sessions */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
          Recent Sessions
        </p>
        {sessions.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <MessageSquare className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">
              No sessions yet. Start your first communication practice!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="glass-card rounded-xl p-4 animate-fade-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          practiceTypeColors[session.practiceType] ||
                            "bg-muted/15 text-muted"
                        )}
                      >
                        {session.practiceType}
                      </span>
                      <span className="text-[10px] text-muted">
                        {session.date}
                      </span>
                    </div>
                    {session.topic && (
                      <p className="text-sm font-medium">{session.topic}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted">
                      {session.durationMinutes && (
                        <span>{session.durationMinutes}min</span>
                      )}
                      {session.confidenceScore && (
                        <span>Confidence: {session.confidenceScore}/5</span>
                      )}
                      {session.clarityScore && (
                        <span>Clarity: {session.clarityScore}/5</span>
                      )}
                      {session.fluencyScore && (
                        <span>Fluency: {session.fluencyScore}/5</span>
                      )}
                    </div>
                    {session.notes && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
