"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Moon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TheLine } from "@/components/ui/TheLine";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AyahCard } from "@/components/ui/AyahCard";
import { Toast } from "@/components/ui/Toast";
import { SkeletonPage } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

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
  azureStreakRisk: boolean;
  reminder: { text: string; source_type: string; reference: string } | null;
  arabicProgress: number;
  azureProgress: number;
  allDone: boolean;
}

const quotes = [
  "Effort is the only mode of relating to the future that a human being actually has access to.",
  "And that there is not for man except that [good] for which he strives. — Qur'an 53:39",
  "Indeed, Allah does not change the condition of a people until they change what is in themselves. — Qur'an 13:11",
];

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingInput, setReadingInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
  };

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
      showToast("Logged ✓");
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
      showToast("Done ✓");
    } catch {} finally { setSaving(null); }
  };

  if (loading) return <SkeletonPage />;
  if (!data) return <EmptyState title="Kuch masla hua" message="Data safe hai, try again." />;

  const { dayNumber, dayOfWeek, sprint, daysRemaining, now, today3, quickLog: ql, careerDots, deenDots, careerDaysActive, deenDaysActive, azureStreakRisk, reminder, arabicProgress, azureProgress, allDone } = data;
  const quote = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="animate-fade-in space-y-5">
      {/* The Line */}
      <TheLine careerPct={azureProgress} deenPct={arabicProgress} />

      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-[12px] text-[var(--color-muted)] font-medium tabular-nums">
            Day {dayNumber} of 110 · {dayOfWeek} · Sprint {sprint}
          </p>
          <h1 className="text-[24px] sm:text-[26px] font-bold mt-1 tracking-tight">Today</h1>
        </div>
        <Link href="/review" className="text-[13px] text-[var(--color-career)] font-medium hover:underline flex items-center gap-1 shrink-0 min-h-[44px]">
          Review <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* NOW Card */}
      {now && (
        <Card elevated className="card-career animate-slide-in">
          <div className="eyebrow mb-2">NOW</div>
          <p className="font-bold text-[14px] sm:text-[15px] mb-3">{now.label}</p>
          <button
            onClick={() => markTaskDone(now.type, now.id)}
            disabled={saving === now.id}
            className="btn-primary text-[13px]"
          >
            {saving === now.id ? "Saving..." : "Start →"}
          </button>
        </Card>
      )}

      {/* All done state */}
      {!now && (
        <Card className="card-deen animate-slide-in">
          <EmptyState
            title="✦ Sab mukammal."
            message="Bonus: extra reading if you wish."
          />
        </Card>
      )}

      {/* TODAY'S 3 */}
      <Card>
        <div className="eyebrow mb-3">TODAY&apos;S 3</div>
        <div className="space-y-1">
          {today3.length === 0 ? (
            <p className="text-[13px] text-[var(--color-muted)]">No tasks. Enjoy your day.</p>
          ) : (
            today3.map((task, i) => {
              const href = task.type === "arabic" ? `/arabic/${task.id}` : task.type === "azure" ? `/azure/${task.id}` : "#";
              const goal = task.type === "azure" ? "career" as const : task.type === "arabic" ? "deen" as const : undefined;
              return (
                <div
                  key={i}
                  className={`task-row ${task.type === "tahajjud" ? "card-deen" : ""}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[var(--color-muted)] font-mono text-[12px] tabular-nums w-5 text-right shrink-0">{i + 1}</span>
                    <span className="text-[13px] sm:text-[14px] font-medium truncate">{task.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.type !== "tahajjud" ? (
                      <Link
                        href={href}
                        className={`text-[12px] px-3 py-2 rounded-lg font-medium min-h-[40px] flex items-center ${
                          goal === "career"
                            ? "bg-[var(--color-career-soft)] text-[var(--color-career)]"
                            : "bg-[var(--color-deen-soft)] text-[var(--color-deen)]"
                        }`}
                      >
                        open
                      </Link>
                    ) : (
                      <button
                        onClick={() => quickLog("tahajjud")}
                        disabled={saving === "tahajjud"}
                        className="text-[12px] px-3 py-2 rounded-lg font-medium min-h-[40px] bg-[var(--color-deen-soft)] text-[var(--color-deen)]"
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
      </Card>

      {/* QUICK LOG */}
      <Card>
        <div className="eyebrow mb-3">QUICK LOG</div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] text-[var(--color-muted)] shrink-0">Qur&apos;an:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["5", "10", "20"].map((p) => (
                <button
                  key={p}
                  onClick={() => quickLog("reading", p)}
                  disabled={saving === "reading"}
                  className={`text-[12px] px-3 py-2 rounded-lg font-medium border transition-colors min-h-[40px] ${
                    ql.readingToday >= parseInt(p)
                      ? "bg-[var(--color-deen-soft)] text-[var(--color-deen)] border-[var(--color-deen-soft)]"
                      : "bg-transparent text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-deen)]"
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
                className="w-14 text-[12px] px-2 py-2 rounded-lg border border-[var(--color-border)] text-center bg-transparent min-h-[40px]"
              />
              {readingInput && (
                <button
                  onClick={() => { quickLog("reading", readingInput); setReadingInput(""); }}
                  disabled={saving === "reading"}
                  className="text-[12px] px-3 py-2 rounded-lg font-medium bg-[var(--color-deen)] text-white min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  ✓
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <button
              onClick={() => quickLog("tahajjud")}
              disabled={saving === "tahajjud"}
              className={`flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg font-medium border transition-colors min-h-[40px] ${
                ql.tahajjudToday
                  ? "bg-[var(--color-deen-soft)] text-[var(--color-deen)] border-[var(--color-deen-soft)]"
                  : "bg-transparent text-[var(--color-muted)] border-[var(--color-border)] hover:border-[var(--color-deen)]"
              }`}
            >
              <Moon className="h-3 w-3" />
              Tahajjud {ql.tahajjudToday ? "✓" : ""}
            </button>
          </div>
        </div>
        {ql.readingToday > 0 && (
          <p className="mt-2 text-[12px] text-[var(--color-muted)]">Today: {ql.readingToday} pages read</p>
        )}
      </Card>

      {/* 7-Day Momentum */}
      <Card>
        <div className="eyebrow mb-3">MOMENTUM</div>
        <div className="grid grid-cols-2 gap-4">
          {/* Career dots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-[var(--color-career)]">Career</span>
              <span className="text-[12px] text-[var(--color-muted)] tabular-nums">{careerDaysActive}/7</span>
            </div>
            <div className="flex gap-1 sm:gap-1.5">
              {careerDots.map((dot, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-colors ${
                    dot.active ? "bg-[var(--color-career)] text-white" : "bg-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                  title={dot.date}
                />
              ))}
            </div>
          </div>
          {/* Deen dots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-[var(--color-deen)]">Deen</span>
              <span className="text-[12px] text-[var(--color-muted)] tabular-nums">{deenDaysActive}/7</span>
            </div>
            <div className="flex gap-1 sm:gap-1.5">
              {deenDots.map((dot, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-colors ${
                    dot.active ? "bg-[var(--color-deen)] text-white" : "bg-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                  title={dot.date}
                />
              ))}
            </div>
          </div>
        </div>
        {azureStreakRisk && (
          <div className="mt-3 p-2.5 rounded-lg text-[12px] badge-warning">
            ⚠ Azure — 2+ days untouched
          </div>
        )}
      </Card>

      {/* Progress mini */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card goal="career">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium text-[var(--color-career)]">Career</span>
            <span className="text-[12px] sm:text-[13px] font-bold tabular-nums">{azureProgress}%</span>
          </div>
          <ProgressBar value={azureProgress} goal="career" />
        </Card>
        <Card goal="deen">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium text-[var(--color-deen)]">Deen</span>
            <span className="text-[12px] sm:text-[13px] font-bold tabular-nums">{arabicProgress}%</span>
          </div>
          <ProgressBar value={arabicProgress} goal="deen" />
        </Card>
      </div>

      {/* Reminder / Ayah */}
      {reminder ? (
        <AyahCard
          text={reminder.text}
          citation={`${reminder.source_type} ${reminder.reference}`}
        />
      ) : (
        <Card>
          <p className="text-[13px] text-[var(--color-muted)] text-center italic">&ldquo;{quote}&rdquo;</p>
        </Card>
      )}

      <Toast message={toast.message} visible={toast.visible} onDone={() => setToast({ visible: false, message: "" })} />
    </div>
  );
}
