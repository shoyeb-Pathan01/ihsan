import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("skeleton h-4 w-full", className)} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-2">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-7 w-24" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
