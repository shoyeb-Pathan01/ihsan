"use client";

import { useEffect, useState } from "react";

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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Failed to load.</p></div>;
  }

  const formatDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="eyebrow">Progress</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Progress</h1>
        <p className="text-[#6b7280] m-0">Track your growth across all domains.</p>
      </div>

      {/* Target */}
      <div className="card">
        <div className="eyebrow mb-2">Target</div>
        <p className="font-bold text-base">{formatDate(data.mission_end)}</p>
        <p className="text-[13px] text-[#6b7280] mt-1">{data.daysRemaining} days remaining</p>
      </div>

      {!data.hasActivity && (
        <div className="card empty">No progress recorded yet.</div>
      )}

      {data.hasActivity && (
        <>
          {/* Career */}
          <div className="card">
            <div className="eyebrow mb-4">Career</div>
            <div className="grid gap-4">
              <div>
                <div className="goal-head text-[13px] mb-1">
                  <span>Azure</span>
                  <span>{data.career.azure.completion}% complete / {data.career.azure.mastery}% mastery</span>
                </div>
                <div className="progress">
                  <div className="bar" style={{ width: `${data.career.azure.completion}%` }} />
                </div>
                <p className="text-[12px] text-[#6b7280] mt-1">{data.career.azure.topicsCompleted}/{data.career.azure.totalTopics} topics · {data.career.azure.sessionsCompleted} sessions</p>
              </div>
              <div>
                <p className="text-[13px]">Communication: {data.career.communication.totalSessions} sessions</p>
              </div>
              <div>
                <p className="text-[13px]">Projects: {data.career.projects.total} total, {data.career.projects.completed} completed</p>
              </div>
            </div>
          </div>

          {/* Deen */}
          <div className="card">
            <div className="eyebrow mb-4">Deen</div>
            <div className="grid gap-4">
              <div>
                <div className="goal-head text-[13px] mb-1">
                  <span>Arabic</span>
                  <span>{data.deen.arabic.watched}/{data.deen.arabic.total} lectures</span>
                </div>
                <div className="progress">
                  <div className="bar" style={{ width: `${data.deen.arabic.total > 0 ? (data.deen.arabic.watched / data.deen.arabic.total) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <p className="text-[13px]">Reading: {data.deen.reading.pages} pages · {data.deen.reading.days} active days</p>
              </div>
              <div>
                <p className="text-[13px]">Memorization: {data.deen.memorization.ayahs} ayahs · {data.deen.memorization.sessions} sessions</p>
              </div>
              <div>
                <p className="text-[13px]">Tahajjud: {data.deen.tahajjud.nights} nights</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
