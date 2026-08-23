"use client";

import { useEffect, useState } from "react";
import { Cloud, ArrowLeft, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

type Tab = "overview" | "sessions" | "practical" | "topics";

interface AzureData {
  overview: {
    totalTopics: number; completedTopics: number; masteredTopics: number;
    totalSessions: number; completedSessions: number;
    totalPracticals: number; completedPracticals: number;
  };
  sessions: { id: string; session_number: number; title: string; drive_link: string; status: string }[];
  practicals: { id: string; practical_number: number; title: string; description: string; tasks: string; status: string }[];
  modules: { id: string; name: string; topics: { id: string; name: string; priority: string; status: string; completion_percentage: number; mastery_percentage: number }[] }[];
}

export default function AzurePage() {
  const [data, setData] = useState<AzureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    fetch("/api/career/azure")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markSessionComplete = async (sessionId: string) => {
    if (!data) return;
    await fetch("/api/career/azure", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "session", id: sessionId, status: "completed" }),
    });
    setData({
      ...data,
      sessions: data.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: "completed" } : s
      ),
      overview: { ...data.overview, completedSessions: data.overview.completedSessions + 1 },
    });
  };

  const markTopicStatus = async (topicId: string, status: string) => {
    if (!data) return;
    await fetch("/api/career/azure", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "topic", id: topicId, status }),
    });
    setData({
      ...data,
      modules: data.modules.map((m) => ({
        ...m,
        topics: m.topics.map((t) => (t.id === topicId ? { ...t, status } : t)),
      })),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted text-sm">Failed to load.</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "sessions", label: "Sessions" },
    { key: "practical", label: "Practical" },
    { key: "topics", label: "Topics" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link href="/career" className="flex items-center gap-1 text-xs text-muted hover:text-foreground mb-3">
          <ArrowLeft className="h-3 w-3" /> Career
        </Link>
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-azure-light" />
          <h1 className="text-2xl font-semibold tracking-tight">AZURE</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-azure-light text-azure-light"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-semibold">{data.overview.completedTopics}/{data.overview.totalTopics}</p>
            <p className="text-xs text-muted mt-1">Course Topics</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-semibold">{data.overview.completedSessions}/{data.overview.totalSessions}</p>
            <p className="text-xs text-muted mt-1">Sessions</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-semibold">{data.overview.completedPracticals}/{data.overview.totalPracticals}</p>
            <p className="text-xs text-muted mt-1">Practical</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-semibold">{data.overview.masteredTopics}</p>
            <p className="text-xs text-muted mt-1">Mastered</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-semibold">{data.overview.totalTopics - data.overview.completedTopics}</p>
            <p className="text-xs text-muted mt-1">Remaining</p>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {tab === "sessions" && (
        <div className="space-y-2">
          {data.sessions.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-muted">No sessions found.</p>
            </div>
          ) : (
            data.sessions.map((session) => (
              <div key={session.id} className="card p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted font-mono w-6">{session.session_number}</span>
                  <span className="text-sm">{session.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {session.status === "completed" ? (
                    <span className="flex items-center gap-1 text-xs text-arabic-light">
                      <Check className="h-3 w-3" /> Done
                    </span>
                  ) : (
                    <button
                      onClick={() => markSessionComplete(session.id)}
                      className="text-xs px-2 py-1 rounded bg-azure-soft text-azure-light hover:bg-azure/20 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  <a href={session.drive_link} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Practical Tab */}
      {tab === "practical" && (
        <div className="space-y-2">
          {data.practicals.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-muted">No practicals found.</p>
            </div>
          ) : (
            data.practicals.map((p) => {
              const tasks: string[] = JSON.parse(p.tasks || "[]");
              return (
                <div key={p.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted font-mono w-6">{p.practical_number}</span>
                      <span className="text-sm font-medium">{p.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${p.status === "completed" ? "bg-arabic-soft text-arabic-light" : "bg-surface-elevated text-muted"}`}>
                      {p.status}
                    </span>
                  </div>
                  {tasks.length > 0 && (
                    <div className="ml-9 mt-2 space-y-1">
                      {tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted">
                          <div className="w-3 h-3 rounded border border-border shrink-0" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Topics Tab */}
      {tab === "topics" && (
        <div className="space-y-4">
          {data.modules.map((mod) => (
            <div key={mod.id}>
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">{mod.name}</h3>
              <div className="space-y-1">
                {mod.topics.map((topic) => (
                  <div key={topic.id} className="card p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{topic.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted">
                        <span className="capitalize">{topic.priority}</span>
                        <span className="capitalize">{topic.status.replace("_", " ")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {topic.status === "not_started" && (
                        <button onClick={() => markTopicStatus(topic.id, "learning")} className="text-[10px] px-2 py-1 rounded bg-azure-soft text-azure-light">
                          Start
                        </button>
                      )}
                      {topic.status === "learning" && (
                        <button onClick={() => markTopicStatus(topic.id, "practiced")} className="text-[10px] px-2 py-1 rounded bg-azure-soft text-azure-light">
                          Practiced
                        </button>
                      )}
                      {topic.status === "practiced" && (
                        <button onClick={() => markTopicStatus(topic.id, "revised")} className="text-[10px] px-2 py-1 rounded bg-azure-soft text-azure-light">
                          Revised
                        </button>
                      )}
                      {topic.status === "revised" && (
                        <button onClick={() => markTopicStatus(topic.id, "mastered")} className="text-[10px] px-2 py-1 rounded bg-arabic-soft text-arabic-light">
                          Mastered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
