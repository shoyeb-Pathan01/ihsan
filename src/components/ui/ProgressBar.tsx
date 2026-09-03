"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  goal: "career" | "deen";
  variant?: "filled" | "mastery";
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  goal,
  variant = "filled",
  showLabel,
  animate = true,
  className,
}: ProgressBarProps) {
  const [mounted, setMounted] = useState(false);
  const pct = Math.min(Math.round((value / max) * 100), 100);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(timer);
    }
    setMounted(true);
  }, [animate]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          variant === "mastery" ? "progress-mastery" : "progress",
          variant === "mastery" && goal === "career" && "progress-mastery-career",
          variant === "mastery" && goal === "deen" && "progress-mastery-deen"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            goal === "career" ? "progress-career" : "progress-deen"
          )}
          style={{ width: mounted ? `${pct}%` : "0%" }}
        />
      </div>
      {showLabel && (
        <span className="text-[12px] font-semibold tabular-nums w-[36px] text-right">
          {pct}%
        </span>
      )}
    </div>
  );
}
