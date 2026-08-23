"use client";

import { useEffect, useState } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";
import { StreakCard } from "@/components/StreakCard";
import { XPCard } from "@/components/XPCard";
import { DailyTask } from "@/components/DailyTask";
import { MissionIntelligence } from "@/components/MissionIntelligence";
import { ReminderCard } from "@/components/ReminderCard";
import { JourneyTimeline } from "@/components/JourneyTimeline";
import { ConsistencyChart } from "@/components/ConsistencyChart";
import { getGreeting } from "@/lib/utils";
import {
  Flame,
  Target,
  BookOpen,
  Clock,
  Trophy,
  ChevronRight,
  RefreshCw,
  Cloud,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  dayNumber: number;
  daysRemaining: number;
  missionCompleted: boolean;
  profile: { name: string; mission_start: string; mission_end: string };
  azureProgress: number;
  arabicProgress: number;
  overallProgress: number;
  streaks: { category: string; current_streak: number; best_streak: number }[];
  totalXP: number;
  level: { level: number; name: string; current: number; next: number };
  todayTasks: {
    id: string;
    title: string;
    category: string;
    xp_value: number;
    completed: boolean;
    is_must_do: boolean;
  }[];
  revisionDue: number;
  reminder: {
    text_paraphrase: string;
    source_type: string;
    reference: string;
    category: string;
  } | null;
  readingStreak: number;
  tahajjudStreak: number;
  communicationSessions: number;
  memorizationCount: number;
  consistencyThisWeek: number;
  consistencyLastWeek: number;
  consistencyTrend: number;
  strongest: { name: string; value: string };
  needsAttention: { name: string; value: string };
  nextMilestone: { name: string; remaining: number };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTaskToggle = async (taskId: string) => {
    if (!data) return;
    const newTasks = data.todayTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setData({ ...data, todayTasks: newTasks });

    try {
      await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
    } catch {
      // Revert on error
      setData({ ...data, todayTasks: data.todayTasks });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">Loading mission data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Failed to load dashboard data.</div>
      </div>
    );
  }

  const overallStreak = data.streaks.find((s) => s.category === "overall");
  const mustDoTasks = data.todayTasks.filter((t) => t.is_must_do);
  const optionalTasks = data.todayTasks.filter((t) => !t.is_must_do);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xs font-bold tracking-[0.3em] text-azure-light uppercase">
          IHSAN
        </h1>
        <p className="text-[10px] text-muted tracking-widest">60-DAY MISSION</p>
      </div>

      {/* Day Counter */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold tracking-tight">
            DAY <span className="text-azure-light">{data.dayNumber}</span>
            <span className="text-muted text-lg"> / 60</span>
          </div>
          <p className="text-sm text-muted mt-1">
            {getGreeting()}, Mr. Khan
          </p>
        </div>
        <StreakCard
          streak={overallStreak?.current_streak || 0}
          category="Day Streak"
          bestStreak={overallStreak?.best_streak || 0}
        />
      </div>

      {/* Mission Completed Banner */}
      {data.missionCompleted && (
        <div className="rounded-xl border border-arabic/30 bg-arabic-surface p-6 text-center">
          <p className="text-lg font-semibold text-arabic-light">MISSION COMPLETED</p>
          <p className="text-sm text-muted mt-1">
            Your 60-day sprint is complete. View your transformation report.
          </p>
        </div>
      )}

      {/* Overall Progress */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Overall Mission
          </p>
          <span className="text-2xl font-bold text-azure-light">
            {Math.round(data.overallProgress)}%
          </span>
        </div>
        <ProgressBar value={data.overallProgress} color="#3b82f6" />
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/azure" className="glass-card rounded-xl p-4 hover:border-azure/40 transition-colors group">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="h-4 w-4 text-azure-light" />
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Azure</p>
          </div>
          <ProgressRing
            value={data.azureProgress}
            size={64}
            color="#3b82f6"
          />
          <p className="text-xs text-muted mt-2 group-hover:text-azure-light transition-colors">
            View Modules <ChevronRight className="inline h-3 w-3" />
          </p>
        </Link>

        <Link href="/quran-journey" className="glass-card rounded-xl p-4 hover:border-arabic/40 transition-colors group">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-arabic-light" />
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Arabic</p>
          </div>
          <ProgressRing
            value={data.arabicProgress}
            size={64}
            color="#10b981"
          />
          <p className="text-xs text-muted mt-2 group-hover:text-arabic-light transition-colors">
            View Lectures <ChevronRight className="inline h-3 w-3" />
          </p>
        </Link>
      </div>

      {/* Supporting Consistency */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <BookOpen className="h-4 w-4 text-reading mx-auto mb-1" />
          <p className="text-lg font-bold">{data.readingStreak}</p>
          <p className="text-[10px] text-muted">Reading Streak</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <Target className="h-4 w-4 text-memorization mx-auto mb-1" />
          <p className="text-lg font-bold">{data.memorizationCount}</p>
          <p className="text-[10px] text-muted">Memorization</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <Clock className="h-4 w-4 text-tahajjud mx-auto mb-1" />
          <p className="text-lg font-bold">{data.tahajjudStreak}</p>
          <p className="text-[10px] text-muted">Tahajjud Streak</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <Trophy className="h-4 w-4 text-communication mx-auto mb-1" />
          <p className="text-lg font-bold">{data.communicationSessions}</p>
          <p className="text-[10px] text-muted">Communication</p>
        </div>
      </div>

      {/* Today's Mission */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Today&apos;s Mission
          </h2>
          <Link
            href="/daily-mission"
            className="text-xs text-azure-light hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {mustDoTasks.length > 0 && (
          <div className="space-y-2 mb-3">
            <p className="text-[10px] font-medium text-muted uppercase tracking-wider">
              Must Do
            </p>
            {mustDoTasks.map((task) => (
              <DailyTask
                key={task.id}
                id={task.id}
                title={task.title}
                category={task.category}
                xpValue={task.xp_value}
                completed={task.completed}
                isMustDo={task.is_must_do}
                onToggle={handleTaskToggle}
              />
            ))}
          </div>
        )}

        {optionalTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted uppercase tracking-wider">
              Optional
            </p>
            {optionalTasks.map((task) => (
              <DailyTask
                key={task.id}
                id={task.id}
                title={task.title}
                category={task.category}
                xpValue={task.xp_value}
                completed={task.completed}
                isMustDo={task.is_must_do}
                onToggle={handleTaskToggle}
              />
            ))}
          </div>
        )}

        {data.todayTasks.length === 0 && (
          <p className="text-sm text-muted text-center py-4">
            No tasks generated yet. Check back tomorrow.
          </p>
        )}
      </div>

      {/* Revision Queue */}
      {data.revisionDue > 0 && (
        <Link
          href="/revision"
          className="glass-card rounded-xl p-4 flex items-center justify-between hover:border-warning/40 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium">
                {data.revisionDue} topics due for revision
              </p>
              <p className="text-xs text-muted">
                Keep your knowledge fresh
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted group-hover:text-warning transition-colors" />
        </Link>
      )}

      {/* Mission Intelligence */}
      <MissionIntelligence
        strongest={data.strongest}
        needsAttention={data.needsAttention}
        nextMilestone={data.nextMilestone}
      />

      {/* Journey Timeline */}
      <JourneyTimeline
        currentDay={data.dayNumber}
        totalDays={60}
        totalXP={data.totalXP}
      />

      {/* Consistency */}
      <ConsistencyChart
        thisWeek={data.consistencyThisWeek}
        lastWeek={data.consistencyLastWeek}
        trend={data.consistencyTrend}
      />

      {/* Reminder */}
      {data.reminder && (
        <ReminderCard
          text={data.reminder.text_paraphrase}
          source={data.reminder.source_type}
          reference={data.reminder.reference}
          category={data.reminder.category}
        />
      )}

      {/* XP Card */}
      <XPCard
        xp={data.totalXP}
        level={data.level.level}
        levelName={data.level.name}
        currentXP={data.level.current}
        nextLevelXP={data.level.next}
      />
    </div>
  );
}
