"use client";

import { cn } from "@/lib/utils";

interface JourneyTimelineProps {
  currentDay: number;
  totalDays?: number;
  totalXP: number;
}

export function JourneyTimeline({
  currentDay,
  totalDays = 60,
  totalXP,
}: JourneyTimelineProps) {
  const progressPct = Math.min(100, (currentDay / totalDays) * 100);
  const weeks = Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => (i + 1) * 7);

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">60-Day Journey</h3>
        <span className="text-xs text-muted">
          Day <span className="font-medium text-muted-foreground">{currentDay}</span> / {totalDays}
        </span>
      </div>

      {/* Timeline bar */}
      <div className="relative">
        <div className="h-3 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-azure transition-[width] duration-1000 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Week markers */}
        <div className="absolute inset-x-0 top-0 h-3 pointer-events-none">
          {weeks.map((day) => (
            <div
              key={day}
              className="absolute top-0 h-full w-px bg-border-subtle"
              style={{ left: `${(day / totalDays) * 100}%` }}
            />
          ))}
        </div>

        {/* YOU ARE HERE indicator */}
        <div
          className="absolute top-0 -translate-x-1/2 transition-[left] duration-700 ease-out"
          style={{ left: `${progressPct}%` }}
        >
          <div className="relative -top-1">
            <div className="h-5 w-5 rounded-full bg-azure border-2 border-background flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-azure-light whitespace-nowrap">
              YOU ARE HERE
            </span>
          </div>
        </div>
      </div>

      {/* Week labels */}
      <div className="flex justify-between mt-6 text-[10px] text-muted">
        {weeks.map((day) => (
          <span key={day}>W{Math.ceil(day / 7)}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
        <span className="text-xs text-muted">
          Day {currentDay} of {totalDays}
        </span>
        <span className="text-xs font-medium text-azure-light">
          {totalXP} XP earned
        </span>
      </div>
    </div>
  );
}
