"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";

interface AzureSession {
  id: string;
  session_number: number;
  title: string;
  drive_link: string;
  status: string;
}

interface AzureData {
  session: AzureSession | null;
  topics: { id: string; name: string; priority: string; status: string }[];
  nextSession: AzureSession | null;
  prevSession: AzureSession | null;
}

export default function AzureWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<AzureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/career/azure?sessionId=${id}`);
      const d = await res.json();
      setData(d);
    } catch {} finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markStageStatus = async (status: string) => {
    if (!data?.session) return;
    setSaving(true);
    try {
      await fetch("/api/career/azure", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "session", id: data.session.id, status }),
      });
      setData((prev) => prev ? { ...prev, session: prev.session ? { ...prev.session, status } : null } : null);
    } catch {} finally { setSaving(false); }
  };

  const markComplete = async () => {
    if (!data?.session) return;
    setSaving(true);
    try {
      await fetch("/api/career/azure", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "session", id: data.session.id, status: "completed" }),
      });
      setData((prev) => prev ? { ...prev, session: prev.session ? { ...prev.session, status: "completed" } : null } : null);
    } catch {} finally { setSaving(false); }
  };

  const markTopicStatus = async (topicId: string, status: string) => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch("/api/career/azure", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topic", id: topicId, status }),
      });
      setData({
        ...data,
        topics: data.topics.map((t) => t.id === topicId ? { ...t, status } : t),
      });
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!data?.session) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Session not found.</p></div>;
  }

  const { session, topics, nextSession, prevSession } = data;
  const completedTopics = topics.filter((t) => t.status !== "not_started").length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[#6b7280] hover:text-[#635bff]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-[22px] font-bold">Session {session.session_number} · {session.title}</h1>
          </div>
        </div>
        <div className="text-right shrink-0">
          {session.status === "completed" ? (
            <span className="inline-flex items-center gap-1 text-[13px] text-[#16a34a] font-medium">
              <Check className="h-4 w-4" /> Completed
            </span>
          ) : (
            <button onClick={markComplete} disabled={saving} className="btn-primary text-[13px]">
              {saving ? "Saving..." : "Mark Complete"}
            </button>
          )}
        </div>
      </div>

      {/* Stages bar */}
      <div className="flex items-center gap-1 mb-5">
        {[
          { key: "not_started", label: "Start" },
          { key: "learning", label: "Watching" },
          { key: "practiced", label: "Practiced" },
          { key: "revised", label: "Revised" },
          { key: "mastered", label: "Mastered" },
        ].map((s, i) => {
          const isActive = session.status === s.key;
          const isPast = ["mastered", "revised", "practiced", "learning", "not_started"].indexOf(session.status) > i;
          return (
            <div key={s.key} className="flex items-center gap-1">
              <button
                onClick={() => markStageStatus(s.key)}
                disabled={saving}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  isActive ? "bg-[#635bff] text-white" : isPast ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f6f7fb] text-[#6b7280] hover:border-[#635bff]"
                }`}
              >
                {isPast && !isActive ? "✓ " : ""}{s.label}
              </button>
              {i < 4 && <span className="text-[#dfe3ea]">→</span>}
            </div>
          );
        })}
      </div>

      {/* Main workspace: content + notes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Content (left 3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Open Session */}
          <div className="card">
            <div className="eyebrow mb-2">SESSION</div>
            <a
              href={session.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" /> Open Session Recording
            </a>
          </div>

          {/* Topics */}
          <div className="card">
            <div className="eyebrow mb-3">TOPICS ({completedTopics}/{topics.length})</div>
            <div className="space-y-2">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between gap-3 py-2 border-b border-[#e8eaf0] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{topic.name}</p>
                    <span className="text-[11px] text-[#6b7280] capitalize">{topic.priority}</span>
                  </div>
                  <div className="shrink-0">
                    {topic.status === "not_started" && (
                      <button onClick={() => markTopicStatus(topic.id, "learning")} className="text-[11px] px-2 py-1 rounded-lg bg-[#eef2ff] text-[#635bff] font-medium">
                        Start
                      </button>
                    )}
                    {topic.status === "learning" && (
                      <button onClick={() => markTopicStatus(topic.id, "practiced")} className="text-[11px] px-2 py-1 rounded-lg bg-[#eef2ff] text-[#635bff] font-medium">
                        Practiced
                      </button>
                    )}
                    {topic.status === "practiced" && (
                      <button onClick={() => markTopicStatus(topic.id, "revised")} className="text-[11px] px-2 py-1 rounded-lg bg-[#eef2ff] text-[#635bff] font-medium">
                        Revised
                      </button>
                    )}
                    {topic.status === "revised" && (
                      <button onClick={() => markTopicStatus(topic.id, "mastered")} className="text-[11px] px-2 py-1 rounded-lg bg-[#dcfce7] text-[#166534] font-medium">
                        Mastered
                      </button>
                    )}
                    {topic.status === "mastered" && (
                      <span className="text-[11px] text-[#16a34a] font-medium">✓ Mastered</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {prevSession ? (
              <Link href={`/azure/${prevSession.id}`} className="text-[13px] text-[#635bff] hover:underline">
                ← Session {prevSession.session_number}
              </Link>
            ) : <div />}
            {nextSession ? (
              <Link href={`/azure/${nextSession.id}`} className="text-[13px] text-[#635bff] hover:underline">
                Session {nextSession.session_number} →
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* Notes (right 2/5) */}
        <div className="lg:col-span-2">
          <div className="card sticky top-4">
            <div className="eyebrow mb-3">MY NOTES</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write notes for this session..."
              className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#dfe3ea] focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/10 outline-none min-h-[300px] resize-y"
            />
            <button className="btn-primary text-[13px] mt-3 w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
