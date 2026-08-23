"use client";

import { useEffect, useState } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { ProgressBar } from "@/components/ProgressBar";
import { ConsistencyChart } from "@/components/ConsistencyChart";
import { XPCard } from "@/components/XPCard";
import { StreakCard } from "@/components/StreakCard";
import {
  BarChart3,
  Trophy,
  Target,
  Flame,
  BookOpen,
  Cloud,
  Star,
  TrendingUp,
} from "lucide-react";

interface ProgressData {
  dayNumber: number;
  overallProgress: number;
  azureCompletion: number;
  azureMastery: number;
  arabicCompletion: number;
  arabicMastery: number;
  totalXP: number;
  level: { level: number; name: string; current: number; next: number };
  streaks: {
    category: string;
    current_streak: number;
    best_streak: number;
  }[];
  badges: { badge_key: string; unlocked_at: string }[];
  consistencyThisWeek: number;
  consistencyLastWeek: number;
  consistencyTrend: number;
  weeklyReview: {
    week_start: string;
    week_end: string;
    azure_progress: number;
    arabic_progress: number;
    tasks_completed: number;
    tasks_missed: number;
    xp_earned: number;
    strongest_area: string;
    weakest_area: string;
    focus_1: string;
    focus_2: string;
    focus_3: string;
  } | null;
  missionCompleted: boolean;
}

const badgeLabels: Record<string, string> = {
  first_step: "First Step",
  seven_day_streak: "7-Day Streak",
  thirty_day_streak: "30-Day Streak",
  first_topic_mastered: "First Mastery",
  consistent_learner: "Consistent Learner",
  night_owl: "Night Owl",
  quran_reader: "Quran Reader",
  communicator: "Communicator",
  azure_foundation: "Azure Foundation",
  arabic_scholar: "Arabic Scholar",
  full_mission: "Full Mission",
  perfect_week: "Perfect Week",
  early_bird: "Early Bird",
  lab_complete: "Lab Complete",
  revision_master: "Revision Master",
};

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">Loading progress...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Failed to load progress data.</div>
      </div>
    );
  }

  const overallStreak = data.streaks.find((s) => s.category === "overall");
  const showTransformation = data.dayNumber > 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-azure-light" />
          <h1 className="text-xs font-bold tracking-[0.3em] text-azure-light uppercase">
            Progress
          </h1>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          MISSION OVERVIEW
        </h2>
      </div>

      {/* Overall Mission Progress */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Overall Mission
          </p>
          <span className="text-2xl font-bold text-azure-light">
            {Math.round(data.overallProgress)}%
          </span>
        </div>
        <div className="flex items-center gap-6">
          <ProgressRing value={data.overallProgress} size={80} color="#3b82f6" />
          <div className="flex-1">
            <ProgressBar value={data.overallProgress} color="#3b82f6" />
            <p className="text-xs text-muted mt-2">
              Day {data.dayNumber} of 60
            </p>
          </div>
        </div>
      </div>

      {/* Azure & Arabic Dual Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Azure */}
        <div className="glass-card rounded-xl p-5 border-azure/20">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="h-4 w-4 text-azure-light" />
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
              Azure
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing
              value={data.azureCompletion}
              size={64}
              color="#3b82f6"
              sublabel="complete"
            />
            <ProgressRing
              value={data.azureMastery}
              size={64}
              color="#22c55e"
              sublabel="mastery"
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Completion</span>
              <span className="font-medium">{Math.round(data.azureCompletion)}%</span>
            </div>
            <ProgressBar value={data.azureCompletion} color="#3b82f6" height={6} showLabel={false} />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Mastery</span>
              <span className="font-medium">{Math.round(data.azureMastery)}%</span>
            </div>
            <ProgressBar value={data.azureMastery} color="#22c55e" height={6} showLabel={false} />
          </div>
        </div>

        {/* Arabic */}
        <div className="glass-card rounded-xl p-5 border-arabic/20">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-arabic-light" />
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
              Arabic
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing
              value={data.arabicCompletion}
              size={64}
              color="#10b981"
              sublabel="complete"
            />
            <ProgressRing
              value={data.arabicMastery}
              size={64}
              color="#22c55e"
              sublabel="mastery"
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Completion</span>
              <span className="font-medium">{Math.round(data.arabicCompletion)}%</span>
            </div>
            <ProgressBar value={data.arabicCompletion} color="#10b981" height={6} showLabel={false} />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Mastery</span>
              <span className="font-medium">{Math.round(data.arabicMastery)}%</span>
            </div>
            <ProgressBar value={data.arabicMastery} color="#22c55e" height={6} showLabel={false} />
          </div>
        </div>
      </div>

      {/* Consistency Chart */}
      <ConsistencyChart
        thisWeek={data.consistencyThisWeek}
        lastWeek={data.consistencyLastWeek}
        trend={data.consistencyTrend}
      />

      {/* XP & Level */}
      <XPCard
        xp={data.totalXP}
        level={data.level.level}
        levelName={data.level.name}
        currentXP={data.level.current}
        nextLevelXP={data.level.next}
      />

      {/* Streak Overview */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
          Streak Overview
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {data.streaks.map((s) => {
            const icons: Record<string, typeof Flame> = {
              overall: Flame,
              azure: Cloud,
              arabic: BookOpen,
              reading: BookOpen,
              memorization: Target,
              tahajjud: Star,
              communication: TrendingUp,
            };
            const colors: Record<string, string> = {
              overall: "#f97316",
              azure: "#3b82f6",
              arabic: "#10b981",
              reading: "#22c55e",
              memorization: "#eab308",
              tahajjud: "#7c3aed",
              communication: "#f97316",
            };
            const Icon = icons[s.category] || Flame;
            return (
              <StreakCard
                key={s.category}
                streak={s.current_streak}
                category={s.category.charAt(0).toUpperCase() + s.category.slice(1)}
                bestStreak={s.best_streak}
                color={colors[s.category] || "#f97316"}
              />
            );
          })}
          {data.streaks.length === 0 && (
            <div className="col-span-full glass-card rounded-xl p-4 text-center text-sm text-muted">
              No streaks yet. Complete daily tasks to build your streak.
            </div>
          )}
        </div>
      </div>

      {/* Badge Collection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-memorization" />
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Badges Earned ({data.badges.length})
          </p>
        </div>
        {data.badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.badges.map((b) => (
              <div key={b.badge_key} className="glass-card rounded-xl p-4 text-center">
                <Trophy className="h-6 w-6 text-memorization mx-auto mb-2" />
                <p className="text-sm font-medium">
                  {badgeLabels[b.badge_key] || b.badge_key}
                </p>
                <p className="text-[10px] text-muted mt-1">
                  {new Date(b.unlocked_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-4 text-center text-sm text-muted">
            No badges earned yet. Keep pushing, the rewards will come.
          </div>
        )}
      </div>

      {/* 60-Day Transformation */}
      {showTransformation && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-success" />
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
              60-Day Transformation
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-azure-light">{data.dayNumber}</p>
              <p className="text-[10px] text-muted">Days Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-arabic-light">
                {Math.round(data.overallProgress)}%
              </p>
              <p className="text-[10px] text-muted">Overall</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-memorization">{data.totalXP}</p>
              <p className="text-[10px] text-muted">Total XP</p>
            </div>
          </div>
          <ProgressBar value={(data.dayNumber / 60) * 100} color="#7c3aed" height={6} showLabel={false} />
          <p className="text-xs text-muted mt-2 text-center">
            {60 - data.dayNumber} days remaining in your mission
          </p>
        </div>
      )}

      {/* Weekly Review */}
      {data.weeklyReview && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-azure-light" />
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
              Weekly Review
            </p>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted">
              {data.weeklyReview.week_start} — {data.weeklyReview.week_end}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-lg font-bold">{data.weeklyReview.tasks_completed}</p>
              <p className="text-[10px] text-muted">Tasks Done</p>
            </div>
            <div>
              <p className="text-lg font-bold text-danger">{data.weeklyReview.tasks_missed}</p>
              <p className="text-[10px] text-muted">Missed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-memorization">+{data.weeklyReview.xp_earned}</p>
              <p className="text-[10px] text-muted">XP Earned</p>
            </div>
            <div>
              <p className="text-lg font-bold text-azure-light">
                {Math.round(data.weeklyReview.azure_progress)}%
              </p>
              <p className="text-[10px] text-muted">Azure</p>
            </div>
          </div>
          {data.weeklyReview.strongest_area && (
            <div className="text-xs space-y-1 mt-3">
              <p className="text-success">
                Strongest: {data.weeklyReview.strongest_area}
              </p>
              {data.weeklyReview.weakest_area && (
                <p className="text-warning">
                  Focus Area: {data.weeklyReview.weakest_area}
                </p>
              )}
            </div>
          )}
          {(data.weeklyReview.focus_1 || data.weeklyReview.focus_2 || data.weeklyReview.focus_3) && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
                Focus Points
              </p>
              <ul className="text-xs space-y-1">
                {data.weeklyReview.focus_1 && <li>&#8226; {data.weeklyReview.focus_1}</li>}
                {data.weeklyReview.focus_2 && <li>&#8226; {data.weeklyReview.focus_2}</li>}
                {data.weeklyReview.focus_3 && <li>&#8226; {data.weeklyReview.focus_3}</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mission Complete Banner */}
      {data.missionCompleted && (
        <div className="rounded-xl border border-arabic/30 bg-arabic-surface p-6 text-center">
          <p className="text-lg font-semibold text-arabic-light">MISSION COMPLETE</p>
          <p className="text-sm text-muted mt-1">
            60 days of disciplined growth. Review your transformation above.
          </p>
        </div>
      )}
    </div>
  );
}
