import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  goal?: "career" | "deen";
}

export function Card({ children, className, elevated, goal }: CardProps) {
  return (
    <div
      className={cn(
        elevated ? "card-elevated" : "card",
        goal === "career" && "card-career",
        goal === "deen" && "card-deen",
        className
      )}
    >
      {children}
    </div>
  );
}
