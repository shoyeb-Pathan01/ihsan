"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Target, Star, ChevronRight, Moon, Check, X } from "lucide-react";

interface LectureData {
  id: number;
  name: string;
  mastery: number;
  watched: boolean;
  duration_seconds: number | null;
}

interface QuranJourneyData {
  arabic: {
    watchedCount: number;
    totalLectures: number;
    avgMastery: number;
    highMasteryCount: number;
    lectureData: LectureData[];
  };
  reading: {
    currentStreak: number;
    weekPages: number;
    totalPages: number;
    monthlyConsistency: number;
  };
  memorization: {
    surahsCount: number;
    revisionSessions: number;
    weakAreas: { id: string; surah: string; ayah_from: number; ayah_to: number; confidence: number }[];
  };
  tahajjud: {
    currentStreak: number;
    monthlyConsistency: number;
  };
  pacing: {
    lecturesStarted: number;
    lecturesStartedPerWeek: number;
    lecturesRemaining: number;
    daysRemaining: number;
    estimatedCompletionDay: number | null;
    revisionDaysLeft: number | null;
  };
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QuranJourneyPage() {
  const [data, setData] = useState<QuranJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllLectures, setShowAllLectures] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/quran-journey");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">Loading your journey...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-danger">{error || "No data available"}</div>
      </div>
    );
  }

  const lecturesToShow = showAllLectures
    ? data.arabic.lectureData
    : data.arabic.lectureData.slice(0, 15);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-2xl">﷽</p>
        <h1 className="text-lg font-bold tracking-wider text-arabic-light">
          QUR&apos;AN JOURNEY
        </h1>
      </div>

      {/* Why This Matters */}
      <div className="glass-card rounded-xl p-4 border-l-4 border-arabic">
        <p className="text-xs font-medium text-arabic-light uppercase tracking-wider mb-1">
          Why This Matters
        </p>
        <p className="text-sm text-muted-foreground">
          Translation padhne wale se Qur&apos;an ko Arabic mein samajhne wale learner tak. The long-term destination is direct Qur&apos;anic comprehension through Arabic grammar, Qur&apos;anic vocabulary, and continuous practice.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <BookOpen className="h-5 w-5 text-arabic-light mx-auto mb-2" />
          <p className="text-lg font-bold text-arabic-light">
            {data.arabic.watchedCount}/{data.arabic.totalLectures}
          </p>
          <p className="text-[10px] text-muted">Lectures Watched</p>
          <div className="mt-2 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-arabic rounded-full transition-all"
              style={{ width: `${(data.arabic.watchedCount / data.arabic.totalLectures) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <Target className="h-5 w-5 text-reading mx-auto mb-2" />
          <p className="text-lg font-bold">{data.reading.currentStreak}</p>
          <p className="text-[10px] text-muted">Reading Streak</p>
          <p className="text-[10px] text-muted mt-1">{data.reading.totalPages} pages total</p>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <Star className="h-5 w-5 text-memorization mx-auto mb-2" />
          <p className="text-lg font-bold">{data.memorization.surahsCount}</p>
          <p className="text-[10px] text-muted">Surahs Memorized</p>
          <p className="text-[10px] text-muted mt-1">{data.memorization.revisionSessions} revisions</p>
        </div>

        <div className="glass-card rounded-xl p-4 text-center">
          <Moon className="h-5 w-5 text-tahajjud mx-auto mb-2" />
          <p className="text-lg font-bold">{data.tahajjud.currentStreak}</p>
          <p className="text-[10px] text-muted">Tahajjud Streak</p>
          <p className="text-[10px] text-muted mt-1">
            {Math.round(data.tahajjud.monthlyConsistency * 100)}% this month
          </p>
        </div>
      </div>

      {/* Pacing Indicator */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
          Pacing
        </p>
        <p className="text-sm text-muted-foreground">
          At your current pace ({data.pacing.lecturesStartedPerWeek} lectures/week), you&apos;ll finish new lectures around{" "}
          <span className="text-arabic-light font-medium">
            Day {data.pacing.estimatedCompletionDay || "—"}
          </span>
          , leaving{" "}
          <span className="text-arabic-light font-medium">
            {data.pacing.revisionDaysLeft || "—"} days
          </span>{" "}
          for pure revision.
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted">
          <span>{data.pacing.lecturesStarted} started</span>
          <span>{data.pacing.lecturesRemaining} remaining</span>
          <span>{data.pacing.daysRemaining} days left</span>
        </div>
      </div>

      {/* Lisān-ul-Qur'ān Lectures */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Lisān-ul-Qur&apos;ān — Level 1
          </h2>
          <span className="text-xs text-muted">
            {data.arabic.avgMastery}% avg mastery
          </span>
        </div>

        <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
          {lecturesToShow.map((lecture) => (
            <div
              key={lecture.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-elevated transition-colors"
            >
              <span className="text-xs text-muted font-mono w-6 shrink-0">
                {lecture.id}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{lecture.name}</p>
                <p className="text-[10px] text-muted">
                  {formatDuration(lecture.duration_seconds)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {lecture.watched ? (
                  <Check className="h-3.5 w-3.5 text-arabic" />
                ) : (
                  <X className="h-3.5 w-3.5 text-muted/40" />
                )}
                <span className="text-xs text-muted w-8 text-right">
                  {lecture.mastery}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {data.arabic.lectureData.length > 15 && (
          <button
            onClick={() => setShowAllLectures(!showAllLectures)}
            className="mt-3 text-xs text-arabic-light hover:underline flex items-center gap-1"
          >
            {showAllLectures ? "Show less" : `Show all ${data.arabic.lectureData.length} lectures`}
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Weak Areas */}
      {data.memorization.weakAreas.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs font-medium text-warning uppercase tracking-wider mb-2">
            Memorization — Weak Areas
          </p>
          <div className="space-y-1">
            {data.memorization.weakAreas.map((area) => (
              <div key={area.id} className="flex items-center justify-between text-sm">
                <span>{area.surah} ({area.ayah_from}-{area.ayah_to})</span>
                <span className="text-xs text-muted">Confidence: {area.confidence}/5</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
