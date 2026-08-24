"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Check } from "lucide-react";

type Tab = "overview" | "sessions" | "practical" | "topics";

interface AzureData {
  overview: { totalTopics: number; completedTopics: number; masteredTopics: number; totalSessions: number; completedSessions: number; totalPracticals: number; completedPracticals: number };
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
      sessions: data.sessions.map((s) => s.id === sessionId ? { ...s, status: "completed" } : s),
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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Failed to load.</p></div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "sessions", label: "Sessions" },
    { key: "practical", label: "Practical" },
    { key: "topics", label: "Topics" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="eyebrow">Career</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Azure</h1>
        <p className="text-[#6b7280] m-0">Azure Administration → Microsoft Cloud → Cloud Security.</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "active" : ""}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid-stats">
          <div className="card">
            <div className="stat-label">Course Topics</div>
            <div className="stat">{data.overview.completedTopics}/{data.overview.totalTopics}</div>
            <div className="small">completed</div>
          </div>
          <div className="card">
            <div className="stat-label">Sessions</div>
            <div className="stat">{data.overview.completedSessions}/{data.overview.totalSessions}</div>
            <div className="small">completed</div>
          </div>
          <div className="card">
            <div className="stat-label">Practical</div>
            <div className="stat">{data.overview.completedPracticals}/{data.overview.totalPracticals}</div>
            <div className="small">completed</div>
          </div>
          <div className="card">
            <div className="stat-label">Mastered</div>
            <div className="stat">{data.overview.masteredTopics}</div>
            <div className="small">topics</div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {tab === "sessions" && (
        <div className="card">
          {data.sessions.length === 0 ? (
            <div className="empty">No sessions found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>#</th><th>Session</th><th>Status</th><th>Link</th></tr>
              </thead>
              <tbody>
                {data.sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono text-[#6b7280]">{s.session_number}</td>
                    <td className="font-medium">{s.title}</td>
                    <td>
                      {s.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-[12px] text-[#16a34a] font-medium">
                          <Check className="h-3 w-3" /> Done
                        </span>
                      ) : (
                        <button onClick={() => markSessionComplete(s.id)} className="text-[12px] px-2 py-1 rounded-lg bg-[#eef2ff] text-[#635bff] hover:bg-[#dde3ff] font-medium">
                          Mark Complete
                        </button>
                      )}
                    </td>
                    <td>
                      <a href={s.drive_link} target="_blank" rel="noopener noreferrer" className="text-[#6b7280] hover:text-[#635bff]">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Practical Tab */}
      {tab === "practical" && (
        <div className="grid gap-4">
          {data.practicals.length === 0 ? (
            <div className="card empty">No practicals found.</div>
          ) : (
            data.practicals.map((p) => {
              const tasks: string[] = JSON.parse(p.tasks || "[]");
              return (
                <div key={p.id} className="card">
                  <div className="goal-head mb-2">
                    <div>
                      <span className="text-[#6b7280] font-mono text-[12px] mr-2">{p.practical_number}</span>
                      <span className="font-bold">{p.title}</span>
                    </div>
                    <span className={`badge ${p.status === "completed" ? "bg-[#dcfce7] text-[#166534]" : ""}`}>
                      {p.status}
                    </span>
                  </div>
                  {p.description && <p className="small mb-3">{p.description}</p>}
                  {tasks.length > 0 && (
                    <div className="grid gap-2">
                      {tasks.map((task, i) => (
                        <label key={i} className="check">
                          <input type="checkbox" />
                          <span className="text-[13px]">{task}</span>
                        </label>
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
        <div className="grid gap-4">
          {data.modules.map((mod) => (
            <div key={mod.id} className="card">
              <h3 className="font-extrabold text-base mb-3">{mod.name}</h3>
              <div className="grid gap-2">
                {mod.topics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between gap-3 py-2 border-b border-[#e8eaf0] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{topic.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-[#6b7280] capitalize">{topic.priority}</span>
                        <span className="text-[11px] text-[#6b7280] capitalize">{topic.status.replace("_", " ")}</span>
                      </div>
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
