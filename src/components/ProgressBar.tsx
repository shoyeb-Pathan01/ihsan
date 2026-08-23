"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  color = "#3b82f6",
  height = 8,
  showLabel = true,
  label,
}: ProgressBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        className="flex-1 rounded-full bg-border overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{
            width: mounted ? `${Math.min(100, Math.max(0, value))}%` : "0%",
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums w-10 text-right">
          {label ?? `${Math.round(value)}%`}
        </span>
      )}
    </div>
  );
}
