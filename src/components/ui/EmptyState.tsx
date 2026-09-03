import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "✦ Sab mukammal.",
  message,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("empty-state", className)}>
      {icon && <div className="mb-3 text-[var(--color-deen)]">{icon}</div>}
      <p className="text-[15px] font-medium mb-1">{title}</p>
      {message && <p className="text-[13px]">{message}</p>}
    </div>
  );
}
