"use client";

import { useEffect, useState, useCallback, use } from "react";
import { ExternalLink } from "lucide-react";
import { Workspace } from "@/components/Workspace";
import { Card } from "@/components/ui/Card";

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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[var(--color-muted)] text-sm">Loading...</p></div>;
  }

  if (!data?.session) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[var(--color-muted)] text-sm">Session not found.</p></div>;
  }

  const { session, topics, nextSession, prevSession } = data;
  const completedTopics = topics.filter((t) => t.status !== "not_started").length;
  const masteredTopics = topics.filter((t) => t.status === "mastered").length;

  const stages = [
    { key: "not_started", label: "Start", done: session.status !== "not_started" },
    { key: "learning", label: "Watching", done: ["learning", "practiced", "revised", "mastered"].includes(session.status) },
    { key: "practiced", label: "Practiced", done: ["practiced", "revised", "mastered"].includes(session.status) },
    { key: "revised", label: "Revised", done: ["revised", "mastered"].includes(session.status) },
    { key: "mastered", label: "Mastered", done: session.status === "mastered" },
  ];

  const completionPct = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;
  const masteryPct = topics.length > 0 ? Math.round((masteredTopics / topics.length) * 100) : 0;

  return (
    <Workspace
      title={`Session ${session.session_number} · ${session.title}`}
      backHref="/"
      completionPct={completionPct}
      masteryPct={masteryPct}
      stages={stages}
      goal="career"
      onStageToggle={(key) => markStageStatus(key)}
      saving={saving}
      notesMode="textarea"
      notes={[]}
      notesPlaceholder="Write notes for this session..."
      onNoteSave={(text) => setNotes(text)}
      nav={{
        prev: prevSession ? { href: `/azure/${prevSession.id}`, label: `Session ${prevSession.session_number}` } : undefined,
        next: nextSession ? { href: `/azure/${nextSession.id}`, label: `Session ${nextSession.session_number}` } : undefined,
      }}
    >
      {/* Open Session */}
      <Card goal="career">
        <div className="eyebrow mb-2">SESSION</div>
        <a
          href={session.drive_link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full"
        >
          <ExternalLink className="h-4 w-4" /> Open Recording
        </a>
      </Card>

      {/* Topics */}
      <Card>
        <div className="eyebrow mb-3">TOPICS ({completedTopics}/{topics.length})</div>
        <div className="space-y-1">
          {topics.map((topic) => (
            <div key={topic.id} className="task-row">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{topic.name}</p>
                <span className="text-[11px] text-[var(--color-muted)] capitalize">{topic.priority}</span>
              </div>
              <div className="shrink-0">
                {topic.status === "not_started" && (
                  <button onClick={() => markTopicStatus(topic.id, "learning")} className="text-[11px] px-2 py-1 rounded-lg bg-[var(--color-career-soft)] text-[var(--color-career)] font-medium">
                    Start
                  </button>
                )}
                {topic.status === "learning" && (
                  <button onClick={() => markTopicStatus(topic.id, "practiced")} className="text-[11px] px-2 py-1 rounded-lg bg-[var(--color-career-soft)] text-[var(--color-career)] font-medium">
                    Practiced
                  </button>
                )}
                {topic.status === "practiced" && (
                  <button onClick={() => markTopicStatus(topic.id, "revised")} className="text-[11px] px-2 py-1 rounded-lg bg-[var(--color-career-soft)] text-[var(--color-career)] font-medium">
                    Revised
                  </button>
                )}
                {topic.status === "revised" && (
                  <button onClick={() => markTopicStatus(topic.id, "mastered")} className="text-[11px] px-2 py-1 rounded-lg bg-[var(--color-deen-soft)] text-[var(--color-deen)] font-medium">
                    Mastered
                  </button>
                )}
                {topic.status === "mastered" && (
                  <span className="text-[11px] text-[var(--color-deen)] font-medium">✓ Mastered</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Workspace>
  );
}
