"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useState, useEffect } from "react";

interface TaskRowProps {
  children: ReactNode;
  goal?: "career" | "deen";
  completed?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TaskRow({ children, goal, completed, onClick, className }: TaskRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "task-row",
        completed && "completed",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  goal?: "career" | "deen";
}

export function Checkbox({ checked, onChange, goal }: CheckboxProps) {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    onChange();
    if (!checked) {
      setAnimate(true);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
      setTimeout(() => setAnimate(false), 200);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "checkbox",
        checked && "checked",
        animate && "animate",
        checked && goal === "career" && "bg-[var(--color-career)] border-[var(--color-career)]"
      )}
      aria-label={checked ? "Uncheck" : "Check"}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}
