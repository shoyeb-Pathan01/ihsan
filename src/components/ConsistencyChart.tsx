"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ConsistencyChartProps {
  thisWeek: number;
  lastWeek: number;
  trend: number;
}

export function ConsistencyChart({
  thisWeek,
  lastWeek,
  trend,
}: ConsistencyChartProps) {
  const maxVal = Math.max(thisWeek, lastWeek, 1);

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Consistency</h3>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend >= 0 ? "text-success" : "text-danger"
          )}
        >
          {trend >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{trend >= 0 ? "+" : ""}{trend}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* This Week */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">This Week</span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {thisWeek}%
            </span>
          </div>
          <div className="h-4 rounded-md bg-border overflow-hidden">
            <div
              className="h-full rounded-md bg-azure transition-[width] duration-700 ease-out"
              style={{ width: `${(thisWeek / maxVal) * 100}%` }}
            />
          </div>
        </div>

        {/* Last Week */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Last Week</span>
            <span className="text-xs font-medium text-muted tabular-nums">
              {lastWeek}%
            </span>
          </div>
          <div className="h-4 rounded-md bg-border overflow-hidden">
            <div
              className="h-full rounded-md bg-muted/40 transition-[width] duration-700 ease-out"
              style={{ width: `${(lastWeek / maxVal) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
