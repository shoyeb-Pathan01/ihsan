"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, AlertTriangle, Target } from "lucide-react";

interface MissionIntelligenceProps {
  strongest: { name: string; value: string };
  needsAttention: { name: string; value: string };
  nextMilestone: { name: string; remaining: number };
}

export function MissionIntelligence({
  strongest,
  needsAttention,
  nextMilestone,
}: MissionIntelligenceProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Strongest */}
      <div className="glass-card rounded-xl p-4 border-l-2 border-success animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-[11px] font-semibold text-success uppercase tracking-wider">
            Strongest
          </span>
        </div>
        <p className="text-sm font-medium text-foreground">{strongest.name}</p>
        <p className="text-xs text-muted mt-0.5">{strongest.value}</p>
      </div>

      {/* Needs Attention */}
      <div className="glass-card rounded-xl p-4 border-l-2 border-warning animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-[11px] font-semibold text-warning uppercase tracking-wider">
            Needs Attention
          </span>
        </div>
        <p className="text-sm font-medium text-foreground">{needsAttention.name}</p>
        <p className="text-xs text-muted mt-0.5">{needsAttention.value}</p>
      </div>

      {/* Next Milestone */}
      <div className="glass-card rounded-xl p-4 border-l-2 border-azure animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-azure-light" />
          <span className="text-[11px] font-semibold text-azure-light uppercase tracking-wider">
            Next Milestone
          </span>
        </div>
        <p className="text-sm font-medium text-foreground">{nextMilestone.name}</p>
        <p className="text-xs text-muted mt-0.5">
          {nextMilestone.remaining} days remaining
        </p>
      </div>
    </div>
  );
}
