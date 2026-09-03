import { cn } from "@/lib/utils";

interface AyahCardProps {
  text: string;
  citation: string;
  className?: string;
}

export function AyahCard({ text, citation, className }: AyahCardProps) {
  return (
    <div className={cn("ayah-card", className)}>
      <p className="ayah-text">{text}</p>
      <p className="ayah-citation">{citation}</p>
    </div>
  );
}
