import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TheLineProps {
  careerPct: number;
  deenPct: number;
  className?: string;
}

export function TheLine({ careerPct, deenPct, className }: TheLineProps) {
  return (
    <div
      className={cn("the-line", className)}
      style={{
        "--line-career": `${Math.min(careerPct, 100)}%`,
        "--line-deen": `${Math.min(careerPct + deenPct, 100)}%`,
      } as React.CSSProperties}
    />
  );
}
