"use client";

import { useEffect, useState } from "react";
import { BarChart3, Briefcase, Building2 } from "lucide-react";

interface ProgressData {
  mission_end: string;
  daysRemaining: number;
  hasActivity: boolean;
  career: {
    azure: { completion: number; mastery: number; topicsCompleted: number; totalTopics: number; sessionsCompleted: number };
    communication: { totalSessions: number };
    projects: { total: number; completed: number };
  };
  deen: {
    arabic: { watched: number; total: number; mastery: number };
    reading: { pages: number; days: number };
    memorization: { ayahs: number; sessions: number };
    tahajjud: { nights: number };
  };
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Loading...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Failed to load.</p></div>;
  }

  const formatDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted">
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">Progress</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">PROGRESS</h1>
      </div>

      {/* Target */}
      <div className="card p-5">
        <p className="text-xs text-muted uppercase tracking-wider mb-1">Target</p>
        <p className="text-lg font-medium">{formatDate(data.mission_end)}</p>
        <p className="text-xs text-muted mt-1">{data.daysRemaining} days remaining</p>
      </div>

      {!data.hasActivity && (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted">No progress recorded yet.</p>
        </div>
      )}

      {data.hasActivity && (
        <>
          {/* Career */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-azure-light" />
              <h2 className="text-sm font-medium">Career</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Azure</span>
                  <span>{data.career.azure.completion}% complete / {data.career.azure.mastery}% mastery</span>
                </div>
                <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-azure rounded-full" style={{ width: `${data.career.azure.completion}%` }} />
                </div>
                <p className="text-[10px] text-muted mt-1">{data.career.azure.topicsCompleted}/{data.career.azure.totalTopics} topics · {data.career.azure.sessionsCompleted} sessions</p>
              </div>
              <div>
                <p className="text-xs text-muted">Communication: {data.career.communication.totalSessions} sessions</p>
              </div>
              <div>
                <p className="text-xs text-muted">Projects: {data.career.projects.total} total, {data.career.projects.completed} completed</p>
              </div>
            </div>
          </div>

          {/* Deen */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-arabic-light" />
              <h2 className="text-sm font-medium">Deen</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Arabic</span>
                  <span>{data.deen.arabic.watched}/{data.deen.arabic.total} lectures</span>
                </div>
                <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-arabic rounded-full" style={{ width: `${data.deen.arabic.total > 0 ? (data.deen.arabic.watched / data.deen.arabic.total) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted">Reading: {data.deen.reading.pages} pages · {data.deen.reading.days} active days</p>
              </div>
              <div>
                <p className="text-xs text-muted">Memorization: {data.deen.memorization.ayahs} ayahs · {data.deen.memorization.sessions} sessions</p>
              </div>
              <div>
                <p className="text-xs text-muted">Tahajjud: {data.deen.tahajjud.nights} nights</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
