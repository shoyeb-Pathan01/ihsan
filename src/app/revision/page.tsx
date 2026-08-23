"use client";

import { useEffect, useState } from "react";
import { RotateCcw, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

interface RevisionItem {
  id: string;
  name: string;
  category: string;
  mastery: number;
  revisionCount: number;
  lastRevised: string | null;
  nextRevision: string | null;
  daysSinceLastRevised: number | null;
  type: "topic" | "lecture";
}

interface RevisionStats {
  totalDue: number;
  overdueBy3Days: number;
  overdueBy7Days: number;
}

export default function RevisionPage() {
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [stats, setStats] = useState<RevisionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const fetchRevisions = async () => {
    try {
      const res = await fetch("/api/revision");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.items);
      setStats(data.stats);
    } catch {
      console.error("Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  const handleReview = async (id: string, type: "topic" | "lecture") => {
    setReviewing(id);
    try {
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setStats((prev) =>
          prev
            ? { ...prev, totalDue: prev.totalDue - 1 }
            : null,
        );
      }
    } catch {
      console.error("Failed to mark as revised");
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-warning mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading revisions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-warning/10 rounded-xl">
          <RotateCcw className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Revision Queue</h1>
          <p className="text-sm text-muted-foreground">
            Spaced repetition for lasting retention
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats.totalDue}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Due</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">
              {stats.overdueBy3Days}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Overdue &gt;3 days
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-danger">
              {stats.overdueBy7Days}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Overdue &gt;7 days
            </p>
          </div>
        </div>
      )}

      {/* Revision List */}
      {items.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            All caught up!
          </h3>
          <p className="text-muted-foreground">
            No revisions due today. Keep up the consistency.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isOverdue3 =
              item.daysSinceLastRevised !== null &&
              item.daysSinceLastRevised > 3;
            const isOverdue7 =
              item.daysSinceLastRevised !== null &&
              item.daysSinceLastRevised > 7;

            return (
              <div
                key={item.id}
                className="glass-card rounded-xl p-4 flex items-center justify-between gap-4 animate-fade-in"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        item.category === "azure"
                          ? "bg-azure/15 text-azure-light"
                          : "bg-arabic/15 text-arabic-light"
                      }`}
                    >
                      {item.category}
                    </span>
                    {isOverdue7 && (
                      <span className="flex items-center gap-1 text-[10px] text-danger">
                        <AlertTriangle className="w-3 h-3" />
                        Critical
                      </span>
                    )}
                    {isOverdue3 && !isOverdue7 && (
                      <span className="flex items-center gap-1 text-[10px] text-orange-400">
                        <Clock className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>
                      {item.daysSinceLastRevised !== null
                        ? `${item.daysSinceLastRevised}d since last review`
                        : "Never reviewed"}
                    </span>
                    <span>Rev # {item.revisionCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        item.mastery >= 80
                          ? "text-success"
                          : item.mastery >= 50
                            ? "text-warning"
                            : "text-danger"
                      }`}
                    >
                      {Math.round(item.mastery)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">mastery</p>
                  </div>
                  <button
                    onClick={() => handleReview(item.id, item.type)}
                    disabled={reviewing === item.id}
                    className="px-4 py-2 bg-warning/15 hover:bg-warning/25 text-warning text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shrink-0"
                  >
                    {reviewing === item.id ? (
                      <span className="flex items-center gap-1.5">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-warning"></div>
                        Saving
                      </span>
                    ) : (
                      "Review Now"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
