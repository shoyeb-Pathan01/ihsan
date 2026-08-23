"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface DailyTaskProps {
  id: string;
  title: string;
  category: string;
  xpValue: number;
  completed: boolean;
  isMustDo: boolean;
  onToggle: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  azure: "bg-azure",
  arabic: "bg-arabic",
  reading: "bg-reading",
  memorization: "bg-memorization",
  tahajjud: "bg-tahajjud",
  communication: "bg-communication",
};

export function DailyTask({
  id,
  title,
  category,
  xpValue,
  completed,
  isMustDo,
  onToggle,
}: DailyTaskProps) {
  const [saving, setSaving] = useState(false);

  const handleToggle = useCallback(() => {
    setSaving(true);
    onToggle(id);
    setTimeout(() => setSaving(false), 600);
  }, [id, onToggle]);

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-all duration-200",
        completed
          ? "bg-surface-elevated/50"
          : "bg-surface hover:bg-surface-elevated"
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
          completed
            ? "border-success bg-success"
            : "border-border-subtle group-hover:border-muted"
        )}
      >
        {completed && (
          <Check className="h-3 w-3 text-white animate-checkmark" strokeWidth={3} />
        )}
      </div>

      {/* Color dot */}
      <div
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          categoryColors[category] ?? "bg-muted"
        )}
      />

      {/* Title */}
      <span
        className={cn(
          "flex-1 text-sm font-medium transition-all duration-300",
          completed ? "text-muted line-through" : "text-foreground"
        )}
      >
        {title}
      </span>

      {/* XP badge */}
      <span
        className={cn(
          "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0",
          completed
            ? "bg-success/10 text-success"
            : "bg-azure/10 text-azure-light"
        )}
      >
        +{xpValue} XP
      </span>

      {/* Must-do badge */}
      {isMustDo && !completed && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning shrink-0">
          MUST
        </span>
      )}

      {/* Saving indicator */}
      {saving && (
        <span className="text-[10px] text-muted animate-pulse">saving</span>
      )}
    </button>
  );
}
