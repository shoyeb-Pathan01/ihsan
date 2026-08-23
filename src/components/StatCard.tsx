"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  sublabel?: string;
  color?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  sublabel,
  color,
}: StatCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">{label}</p>
          <p
            className="text-2xl font-bold mt-1 text-foreground"
            style={color ? { color } : undefined}
          >
            {value}
          </p>
          {sublabel && (
            <p className="text-xs text-muted mt-1">{sublabel}</p>
          )}
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-medium", trend >= 0 ? "text-success" : "text-danger")}>
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend >= 0 ? "+" : ""}{trend}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-muted shrink-0 ml-3">{icon}</div>
        )}
      </div>
    </div>
  );
}
