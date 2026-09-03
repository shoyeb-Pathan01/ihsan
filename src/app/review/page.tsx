"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, Calendar, AlertTriangle } from "lucide-react";

interface TodayData {
  profile: { name: string; mission_start: string; mission_end: string };
  dayNumber: number;
  dayOfWeek: string;
  sprint: number;
  daysRemaining: number;
  now: { type: string; label: string; id: string; done: boolean } | null;
  today3: { type: string; label: string; id: string; done: boolean }[];
  quickLog: { readingToday: number; tahajjudToday: boolean };
  careerDots: { date: string; active: boolean }[];
  deenDots: { date: string; active: boolean }[];
  careerDaysActive: number;
  deenDaysActive: number;
  reminder: { text: string; source_type: string; reference: string } | null;
  arabicProgress: number;
  azureProgress: number;
  allDone: boolean;
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNextWeekDays(): Date[] {
  const { end } = getWeekRange(new Date());
  const days: Date[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() + i);
    days.push(d);
  }
  return days;
}

function getCompletionPct(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export default function ReviewPage() {
  const [todayData, setTodayData] = useState<TodayData | null>(null);

  const [reflection, setReflection] = useState({
    wentWell: "",
    slipped: "",
    differently: "",
  });

  const [intentions, setIntentions] = useState<{ trigger: string; action: string; time?: string }[]>([]);
  const [newIntention, setNewIntention] = useState("");

  const [planAdjustment, setPlanAdjustment] = useState<"reduce" | "adjust" | "same" | null>(null);

  const now = new Date();
  const weekNum = getWeekNumber(now);
  const { start, end } = getWeekRange(now);
  const isSunday = now.getDay() === 0;

  useEffect(() => {
    const savedKey = `iqra-review-${weekNum}`;
    try {
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setReflection(parsed.reflection ?? { wentWell: "", slipped: "", differently: "" });
        setIntentions(parsed.intentions ?? []);
        setPlanAdjustment(parsed.planAdjustment ?? null);
      }
    } catch {}
  }, [weekNum]);

  useEffect(() => {
    const savedKey = `iqra-review-${weekNum}`;
    try {
      localStorage.setItem(savedKey, JSON.stringify({ reflection, intentions, planAdjustment }));
    } catch {}
  }, [reflection, intentions, planAdjustment, weekNum]);

  useEffect(() => {
    fetch("/api/today")
      .then((r) => r.json())
      .then((data) => setTodayData(data))
      .catch(() => {});
  }, []);

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const nextWeekDays = getNextWeekDays();

  const careerDots = todayData?.careerDots?.map((d) => d.active) ?? [false, false, false, false, false, false, false];
  const deenDots = todayData?.deenDots?.map((d) => d.active) ?? [false, false, false, false, false, false, false];

  const weeklyStats = {
    azureSessions: todayData?.careerDaysActive ?? 0,
    arabicLectures: todayData?.deenDaysActive ?? 0,
    pagesRead: todayData?.quickLog?.readingToday ?? 0,
    tahajjudNights: todayData?.quickLog?.tahajjudToday ? 1 : 0,
  };

  const totalPlanned = weeklyStats.azureSessions + weeklyStats.arabicLectures + weeklyStats.tahajjudNights;
  const completedPct = getCompletionPct(totalPlanned, 7);

  const passiveTasks = weeklyStats.pagesRead > 0 ? 1 : 0;
  const activeTasks = weeklyStats.tahajjudNights + weeklyStats.azureSessions;
  const easyPct = totalPlanned > 0 ? Math.round((passiveTasks / (passiveTasks + activeTasks || 1)) * 100) : 0;
  const isComfortable = easyPct > 70 && totalPlanned > 0;

  const prevWeekKey = `iqra-review-${weekNum - 1}`;
  let prevWeekStats = { azureSessions: 0, arabicLectures: 0, tahajjudNights: 0 };
  try {
    const prev = localStorage.getItem(prevWeekKey);
    if (prev) {
      const parsed = JSON.parse(prev);
      prevWeekStats = parsed.weeklyStats ?? prevWeekStats;
    }
  } catch {}

  const deltas = {
    azure: weeklyStats.azureSessions - prevWeekStats.azureSessions,
    arabic: weeklyStats.arabicLectures - prevWeekStats.arabicLectures,
    tahajjud: weeklyStats.tahajjudNights - prevWeekStats.tahajjudNights,
  };

  const prevWeekPct = prevWeekStats.azureSessions + prevWeekStats.arabicLectures + prevWeekStats.tahajjudNights;
  const prevWeekCompleted = getCompletionPct(prevWeekPct, 7);
  const needsPlanAdjustment = completedPct < 60 && prevWeekCompleted < 60;

  const daysElapsed = todayData?.dayNumber ?? 1;
  const totalDays = 131;
  const projectedFinish = todayData?.arabicProgress ? Math.round((todayData.arabicProgress / 100) * totalDays) : daysElapsed;
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + (totalDays - projectedFinish));

  const daysRemaining = todayData?.daysRemaining ?? 0;
  const utilizationPct = totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : 0;

  function addIntention() {
    if (!newIntention.trim()) return;
    const match = newIntention.match(/(?:next week|agle week)\s+main\s+(.+?)\s+ko\s+(.+?)\s+pe\s+(?:karunga|karoongi)/i);
    if (match) {
      setIntentions((prev) => [...prev, { trigger: match[1], action: match[2], time: match[2] }]);
    } else {
      setIntentions((prev) => [...prev, { trigger: newIntention.trim(), action: "do this" }]);
    }
    setNewIntention("");
  }

  function removeIntention(index: number) {
    setIntentions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="review-page animate-fade-in space-y-5">
      {/* Header */}
      <header className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight">Muhāsabah (محاس)</h1>
          {isSunday && (
            <p className="text-[11px] sm:text-[12px] text-[var(--color-warning)] mt-1 font-medium">
              Aaj review ka din hai
            </p>
          )}
        </div>
        <Link href="/" className="btn-primary text-[13px] shrink-0">
          Back <ArrowRight size={16} />
        </Link>
      </header>

      {/* Countdown framing */}
      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[24px] sm:text-[28px] font-extrabold tabular-nums">{daysRemaining}</span>
            <span className="text-[12px] sm:text-[13px] text-[var(--color-muted)] ml-2">days left</span>
          </div>
          <div className="text-right">
            <span className="text-[13px] font-semibold tabular-nums">{utilizationPct}%</span>
            <span className="text-[11px] sm:text-[12px] text-[var(--color-muted)] ml-1">used well</span>
          </div>
        </div>
        <div className="progress mt-3">
          <div className="progress-career h-full rounded-full" style={{ width: `${utilizationPct}%` }} />
        </div>
      </section>

      {/* Week overview */}
      <section className="card">
        <div className="eyebrow mb-3">
          <Calendar size={14} className="inline mr-1" /> Week {weekNum} · {formatDate(start)} – {formatDate(end)}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[13px] font-semibold mb-2 text-[var(--color-career)]">Career</p>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((label, i) => (
                <div key={`career-${i}`} className="text-center">
                  <span className="text-[9px] sm:text-[10px] text-[var(--color-muted)] block mb-1">{label}</span>
                  <span
                    className="inline-block w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                    style={{ backgroundColor: careerDots[i] ? "var(--color-career)" : "var(--color-border)" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold mb-2 text-[var(--color-deen)]">Deen</p>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((label, i) => (
                <div key={`deen-${i}`} className="text-center">
                  <span className="text-[9px] sm:text-[10px] text-[var(--color-muted)] block mb-1">{label}</span>
                  <span
                    className="inline-block w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                    style={{ backgroundColor: deenDots[i] ? "var(--color-deen)" : "var(--color-border)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Honest Mirror */}
      <section className="card">
        <div className="eyebrow mb-3">Honest Mirror</div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div className="text-center">
            <span className="text-[20px] sm:text-[24px] font-extrabold tabular-nums" style={{ color: completedPct >= 60 ? "var(--color-success)" : "var(--color-warning)" }}>
              {completedPct}%
            </span>
            <p className="text-[10px] sm:text-[11px] text-[var(--color-muted)]">Tasks done</p>
          </div>
          <div className="text-center">
            <span className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{weeklyStats.azureSessions}</span>
            <p className="text-[10px] sm:text-[11px] text-[var(--color-muted)]">Azure</p>
          </div>
          <div className="text-center">
            <span className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{weeklyStats.arabicLectures}</span>
            <p className="text-[10px] sm:text-[11px] text-[var(--color-muted)]">Arabic</p>
          </div>
        </div>

        {/* Easy vs Hard split */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-[var(--color-muted)]">Easy vs Hard</span>
            <span className="text-[11px] font-semibold tabular-nums">{easyPct}% easy</span>
          </div>
          <div className="progress">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${easyPct}%`, backgroundColor: isComfortable ? "var(--color-warning)" : "var(--color-career)" }}
            />
          </div>
        </div>

        {isComfortable && (
          <div className="flex items-center gap-2 p-3 rounded-lg badge-warning text-[13px]">
            <AlertTriangle size={14} className="shrink-0" />
            You&apos;re comfortable, not growing.
          </div>
        )}

        {/* Week-over-week deltas */}
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <p className="text-[11px] text-[var(--color-muted)] mb-2">Week-over-week</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Azure", delta: deltas.azure },
              { label: "Arabic", delta: deltas.arabic },
              { label: "Tahajjud", delta: deltas.tahajjud },
            ].map((item) => (
              <span
                key={item.label}
                className="text-[11px] font-semibold tabular-nums"
                style={{ color: item.delta > 0 ? "var(--color-success)" : item.delta < 0 ? "var(--color-danger)" : "var(--color-muted)" }}
              >
                {item.label}: {item.delta > 0 ? `+${item.delta}` : item.delta}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Plan adjustment prompt */}
      {needsPlanAdjustment && !planAdjustment && (
        <section className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg badge-warning">
            <AlertTriangle size={16} className="shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold">2 weeks below 60%</p>
              <p className="text-[11px] text-[var(--color-muted)]">Plan reduce / adjust / same?</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => setPlanAdjustment("reduce")} className="flex-1 sm:flex-none btn-secondary text-[11px] px-3 py-2 min-h-[40px]">Reduce</button>
              <button onClick={() => setPlanAdjustment("adjust")} className="flex-1 sm:flex-none btn-secondary text-[11px] px-3 py-2 min-h-[40px]">Adjust</button>
              <button onClick={() => setPlanAdjustment("same")} className="flex-1 sm:flex-none btn-secondary text-[11px] px-3 py-2 min-h-[40px]">Same</button>
            </div>
          </div>
        </section>
      )}

      {planAdjustment && (
        <section className="card">
          <p className="text-[13px] text-[var(--color-muted)]">
            {planAdjustment === "reduce" && "Plan reduced. InshAllah, consistency aayegi."}
            {planAdjustment === "adjust" && "Target adjusted. Realistic goals, honest effort."}
            {planAdjustment === "same" && "Challenges accept kiye. Allah madad karega."}
          </p>
        </section>
      )}

      {/* Muhāsabah reflection */}
      <section className="card">
        <div className="eyebrow mb-3">Self-Accounting</div>

        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-semibold mb-2 block">What went well?</label>
            <textarea
              className="w-full min-h-[80px] resize-y rounded-lg border border-[var(--color-border)] p-3 text-[13px] bg-transparent focus:border-[var(--color-career)] focus:ring-2 focus:ring-[var(--color-career)]/10 outline-none"
              value={reflection.wentWell}
              onChange={(e) => setReflection((p) => ({ ...p, wentWell: e.target.value }))}
              placeholder="Celebrate your wins..."
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold mb-2 block">What slipped?</label>
            <textarea
              className="w-full min-h-[80px] resize-y rounded-lg border border-[var(--color-border)] p-3 text-[13px] bg-transparent focus:border-[var(--color-career)] focus:ring-2 focus:ring-[var(--color-career)]/10 outline-none"
              value={reflection.slipped}
              onChange={(e) => setReflection((p) => ({ ...p, slipped: e.target.value }))}
              placeholder="Be honest..."
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold mb-2 block">What differently?</label>
            <textarea
              className="w-full min-h-[80px] resize-y rounded-lg border border-[var(--color-border)] p-3 text-[13px] bg-transparent focus:border-[var(--color-career)] focus:ring-2 focus:ring-[var(--color-career)]/10 outline-none"
              value={reflection.differently}
              onChange={(e) => setReflection((p) => ({ ...p, differently: e.target.value }))}
              placeholder="Commit to change..."
            />
          </div>
        </div>
      </section>

      {/* Implementation intentions */}
      <section className="card">
        <div className="eyebrow mb-1">Implementation Intentions</div>
        <p className="text-[11px] text-[var(--color-muted)] mb-3">
          &quot;Next week main [X] ko [TIME] pe karunga&quot;
        </p>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]"
            value={newIntention}
            onChange={(e) => setNewIntention(e.target.value)}
            placeholder="Next week main Quran ko 6 AM pe karunga"
            onKeyDown={(e) => e.key === "Enter" && addIntention()}
          />
          <button className="btn-primary px-4 min-h-[48px] min-w-[48px]" onClick={addIntention}>Add</button>
        </div>

        {intentions.length === 0 ? (
          <p className="text-[13px] text-[var(--color-muted)] text-center py-6">No intentions yet.</p>
        ) : (
          <div className="space-y-2">
            {intentions.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-elevated)] gap-3">
                <span className="text-[13px] min-w-0 flex-1">
                  Main <strong>{item.trigger}</strong> ko <strong>{item.action || item.time}</strong> pe karunga
                </span>
                <button onClick={() => removeIntention(i)} className="text-[11px] text-[var(--color-danger)] font-medium shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Projected finish */}
      <section className="card">
        <div className="eyebrow mb-3">Projection</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-[var(--color-muted)]">Lisan Book finishes by</p>
            <p className="text-[13px] sm:text-[15px] font-bold">
              {projectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--color-muted)]">Arabic mastery</p>
            <p className="text-[13px] sm:text-[15px] font-bold tabular-nums">{todayData?.arabicProgress ?? 0}%</p>
          </div>
        </div>
      </section>

      {/* Next week plan */}
      <section className="card">
        <div className="eyebrow mb-3">Next Week</div>
        <div className="grid grid-cols-7 gap-1">
          {nextWeekDays.map((day, i) => (
            <div key={i} className="text-center p-1.5 sm:p-2 rounded-lg bg-[var(--color-surface-elevated)]">
              <span className="text-[8px] sm:text-[10px] text-[var(--color-muted)] block">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-[11px] sm:text-[12px] font-semibold">{day.getDate()}</span>
              <span className="text-[8px] sm:text-[9px] block mt-0.5" style={{ color: i < 4 ? "var(--color-deen)" : "var(--color-warning)" }}>
                {i < 4 ? "Study" : "Review"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
