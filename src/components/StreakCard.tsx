"use client";

import { cn } from "@/lib/utils";

interface StreakCardProps {
  streak: number;
  category: string;
  bestStreak?: number;
  color?: string;
}

export function StreakCard({
  streak,
  category,
  bestStreak,
  color = "#f97316",
}: StreakCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-flicker">🔥</span>
        <div>
          <p className="text-3xl font-bold text-foreground" style={{ color }}>
            {streak}
          </p>
          <p className="text-xs text-muted-foreground">{category}</p>
        </div>
      </div>
      {bestStreak !== undefined && (
        <p className="text-[11px] text-muted mt-2">
          Best: {bestStreak}
        </p>
      )}
    </div>
  );
}
