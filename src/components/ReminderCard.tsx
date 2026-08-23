"use client";

import { cn } from "@/lib/utils";

interface ReminderCardProps {
  text: string;
  source: string;
  reference: string;
  category: string;
}

export function ReminderCard({
  text,
  source,
  reference,
  category,
}: ReminderCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 border-l-2 border-[#d4a853] animate-fade-in">
      <p className="text-sm font-medium text-foreground leading-relaxed">{text}</p>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[11px] text-muted-foreground">{source}</span>
        <span className="text-muted">·</span>
        <span className="text-[11px] text-muted">{reference}</span>
      </div>
      <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#d4a853]/10 text-[#d4a853]">
        {category}
      </span>
    </div>
  );
}
