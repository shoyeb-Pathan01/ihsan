"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, BookOpen, Moon } from "lucide-react";

interface TodayData {
  profile: { name: string; mission_start: string; mission_end: string };
  dayNumber: number;
  dayOfWeek: string;
  sprint: number;
  daysRemaining: number;
  now: { type: string; label: string; id: string; done: boolean } | null;
  today3: { type: string; label: string; id: string; done: boolean }[];
  quickLog: { readingToday: number; tahajjudToday: boolean; memorizationToday: boolean };
  careerDots: { date: string; active: boolean }[];
  deenDots: { date: string; active: boolean }[];
  careerDaysActive: number;
  deenDaysActive: number;
  azureStreakRisk: boolean;
  reminder: { text: string; source_type: string; reference: string } | null;
  arabicProgress: number;
  azureProgress: number;
  allDone: boolean;
}

const quotes = [
  "Effort is the only mode of relating to the future that a human being actually has access to.",
  "The secret of getting ahead is getting started. — Mark Twain",
  "And that there is not for man except that [good] for which he strives. — Qur'an 53:39",
  "Indeed, Allah does not change the condition of a people until they change what is in themselves. — Qur'an 13:11",
];

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingInput, setReadingInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/today");
      const d = await res.json();
      setData(d);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const quickLog = async (type: string, value?: string | boolean) => {
    setSaving(type);
    try {
      await fetch("/api/quick-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
      await fetchData();
    } catch {} finally { setSaving(null); }
  };

  const markTaskDone = async (taskType: string, id: string) => {
    setSaving(id);
    try {
      await fetch("/api/quick-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "task_done", taskType, id }),
      });
      await fetchData();
    } catch {} finally { setSaving(null); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Failed to load.</p></div>;
  }

  const { profile, dayNumber, dayOfWeek, sprint, daysRemaining, now, today3, quickLog: ql, careerDots, deenDots, careerDaysActive, deenDaysActive, azureStreakRisk, reminder, arabicProgress, azureProgress, allDone } = data;
  const quote = quotes[new Date().getDate() % quotes.length];

  const formatShortDate = (d: string) => {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="eyebrow">Day {dayNumber} of 110 · {dayOfWeek} · Sprint {sprint}</div>
          <h1 className="text-[28px] font-bold mt-1 mb-0">Today</h1>
        </div>
        <Link href="/review" className="text-[13px] text-[#635bff] font-medium hover:underline flex items-center gap-1">
          Review <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* NOW Card */}
      {now && (
        <div className="card border-l-4 border-l-[#635bff]">
          <div className="eyebrow mb-1">▶ NOW</div>
          <div className="font-bold text-[15px] mb-1">{now.label}</div>
          <button
            onClick={() => markTaskDone(now.type, now.id)}
            disabled={saving === now.id}
            className="btn-primary text-[13px] mt-2"
          >
            {saving === now.id ? "Saving..." : "Start →"}
          </button>
        </div>
      )}

      {!now && (
        <div className="card border-l-4 border-l-[#16a34a]">
          <div className="eyebrow mb-1">ALL DONE</div>
          <div className="font-bold text-[15px] mb-1">All tasks for today are complete. Great work.</div>
          <Link href="/library" className="text-[13px] text-[#635bff] font-medium hover:underline flex items-center gap-1 mt-2">
            Browse library <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* TODAY'S 3 */}
      <div className="card">
        <div className="eyebrow mb-3">TODAY&apos;S 3</div>
        <div className="space-y-2">
          {today3.length === 0 ? (
            <p className="text-[13px] text-[#6b7280]">No tasks. Enjoy your day.</p>
          ) : (
            today3.map((task, i) => {
              const href = task.type === "arabic" ? `/arabic/${task.id}` : task.type === "azure" ? `/azure/${task.id}` : "#";
              return (
                <div key={i} className="flex items-center justify-between gap-3 p-3 bg-[#f6f7fb] rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[#6b7280] font-mono text-[12px]">{i + 1}</span>
                    <span className="text-[13px] font-medium truncate">{task.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.type !== "tahajjud" ? (
                      <Link href={href} className="text-[12px] px-2 py-1 rounded-lg bg-[#eef2ff] text-[#635bff] font-medium hover:bg-[#dde3ff]">
                        open
                      </Link>
                    ) : (
                      <button
                        onClick={() => quickLog("tahajjud")}
                        disabled={saving === "tahajjud"}
                        className={`text-[12px] px-2 py-1 rounded-lg font-medium ${ql.tahajjudToday ? "bg-[#dcfce7] text-[#166534]" : "bg-[#eef2ff] text-[#635bff] hover:bg-[#dde3ff]"}`}
                      >
                        {ql.tahajjudToday ? "✓ Done" : "✓ tap"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QUICK LOG */}
      <div className="card">
        <div className="eyebrow mb-3">QUICK LOG</div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6b7280]">Qur&apos;an:</span>
            {["5", "10", "20"].map((p) => (
              <button
                key={p}
                onClick={() => quickLog("reading", p)}
                disabled={saving === "reading"}
                className={`text-[12px] px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                  ql.readingToday >= parseInt(p)
                    ? "bg-[#dcfce7] text-[#166534] border-[#dcfce7]"
                    : "bg-white text-[#4b5563] border-[#dfe3ea] hover:border-[#635bff]"
                }`}
              >
                {p}pg
              </button>
            ))}
            <input
              type="number"
              min="1"
              value={readingInput}
              onChange={(e) => setReadingInput(e.target.value)}
              placeholder="?"
              className="w-14 text-[12px] px-2 py-1.5 rounded-lg border border-[#dfe3ea] text-center"
            />
            {readingInput && (
              <button
                onClick={() => { quickLog("reading", readingInput); setReadingInput(""); }}
                disabled={saving === "reading"}
                className="text-[12px] px-3 py-1.5 rounded-lg font-medium bg-[#635bff] text-white"
              >
                ✓
              </button>
            )}
          </div>
          <div className="h-4 w-px bg-[#e8eaf0]" />
          <button
            onClick={() => quickLog("tahajjud")}
            disabled={saving === "tahajjud"}
            className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              ql.tahajjudToday
                ? "bg-[#dcfce7] text-[#166534] border-[#dcfce7]"
                : "bg-white text-[#4b5563] border-[#dfe3ea] hover:border-[#7c3aed]"
            }`}
          >
            <Moon className="h-3 w-3" />
            Tahajjud {ql.tahajjudToday ? "✓" : ""}
          </button>
        </div>
        {ql.readingToday > 0 && (
          <div className="mt-2 text-[12px] text-[#6b7280]">Today: {ql.readingToday} pages read</div>
        )}
      </div>

      {/* 7-Day Momentum */}
      <div className="card">
        <div className="eyebrow mb-3">MOMENTUM</div>
        <div className="grid grid-cols-2 gap-4">
          {/* Career dots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium">Career</span>
              <span className="text-[12px] text-[#6b7280]">{careerDaysActive}/7 days</span>
            </div>
            <div className="flex gap-1.5">
              {careerDots.map((dot, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    dot.active ? "bg-[#635bff] text-white" : "bg-[#e8eaf0] text-[#9ca3af]"
                  }`}
                  title={formatShortDate(dot.date)}
                >
                  {dot.active ? "●" : "○"}
                </div>
              ))}
            </div>
          </div>
          {/* Deen dots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium">Deen</span>
              <span className="text-[12px] text-[#6b7280]">{deenDaysActive}/7 days</span>
            </div>
            <div className="flex gap-1.5">
              {deenDots.map((dot, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    dot.active ? "bg-[#16a34a] text-white" : "bg-[#e8eaf0] text-[#9ca3af]"
                  }`}
                  title={formatShortDate(dot.date)}
                >
                  {dot.active ? "●" : "○"}
                </div>
              ))}
            </div>
          </div>
        </div>
        {azureStreakRisk && (
          <div className="mt-3 p-2 bg-[#fef3c7] rounded-lg text-[12px] text-[#92400e]">
            ⚠ Azure — 2+ days untouched
          </div>
        )}
      </div>

      {/* Progress mini */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium">Career</span>
            <span className="text-[13px] font-bold">{azureProgress}%</span>
          </div>
          <div className="progress">
            <div className="bar" style={{ width: `${azureProgress}%` }} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium">Deen</span>
            <span className="text-[13px] font-bold">{arabicProgress}%</span>
          </div>
          <div className="progress">
            <div className="bar" style={{ width: `${arabicProgress}%`, background: "linear-gradient(90deg, #16a34a, #22c55e)" }} />
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="card text-[13px] text-[#374151]">
        {reminder ? (
          <>&ldquo;{reminder.text}&rdquo; <span className="text-[#6b7280]">— {reminder.source_type} {reminder.reference}</span></>
        ) : (
          <>&ldquo;{quote}&rdquo;</>
        )}
      </div>
    </div>
  );
}
