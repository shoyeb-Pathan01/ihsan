import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDaysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export function getWeekEnd(date: Date = new Date()): string {
  const start = new Date(getWeekStart(date));
  start.setDate(start.getDate() + 6);
  return start.toISOString().split("T")[0];
}

export function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export function levelFromXP(xp: number): { level: number; name: string; current: number; next: number } {
  const levels = [
    { level: 1, name: "Beginner", xp: 0 },
    { level: 2, name: "Consistent", xp: 100 },
    { level: 3, name: "Builder", xp: 250 },
    { level: 4, name: "Focused", xp: 500 },
    { level: 5, name: "Disciplined", xp: 800 },
    { level: 6, name: "Advanced", xp: 1200 },
    { level: 7, name: "Mission Ready", xp: 1800 },
  ];

  let current = levels[0];
  let next = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) {
      current = levels[i];
      next = levels[i + 1] || { level: levels[i].level + 1, name: "Master", xp: levels[i].xp + 600 };
      break;
    }
  }

  return {
    level: current.level,
    name: current.name,
    current: xp - current.xp,
    next: next.xp - current.xp,
  };
}

export function calculateMastery(stages: Record<string, boolean>, understanding: number, confidence: number): number {
  const stageWeights: Record<string, number> = {
    watched: 10,
    book: 10,
    notes: 15,
    examples: 15,
    practice: 15,
    revision: 15,
    quiz: 10,
    doubts_cleared: 10,
  };

  let stageScore = 0;
  for (const [stage, completed] of Object.entries(stages)) {
    if (completed && stageWeights[stage]) {
      stageScore += stageWeights[stage];
    }
  }

  const understandingScore = (understanding / 5) * 15;
  const confidenceScore = (confidence / 5) * 10;

  return Math.min(100, Math.round(stageScore * 0.75 + understandingScore + confidenceScore));
}
