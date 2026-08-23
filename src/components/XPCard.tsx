"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface XPCardProps {
  xp: number;
  level: number;
  levelName: string;
  currentXP: number;
  nextLevelXP: number;
}

export function XPCard({
  xp,
  level,
  levelName,
  currentXP,
  nextLevelXP,
}: XPCardProps) {
  const progress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 100;

  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-azure/10">
          <Star className="h-5 w-5 text-azure-light" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">Lv.{level}</span>
            <span className="text-xs text-muted-foreground">{levelName}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {currentXP} / {nextLevelXP} XP
          </span>
          <span className="text-muted">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-azure transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-muted mt-2">
        Total: <span className="font-medium text-muted-foreground">{xp} XP</span>
      </p>
    </div>
  );
}
