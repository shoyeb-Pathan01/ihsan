"use client";

import { useEffect, useState } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";
import {
  Cloud,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Star,
  BookOpen,
  Beaker,
} from "lucide-react";
import Link from "next/link";

interface Topic {
  id: string;
  name: string;
  priority: "critical" | "important" | "supporting" | "bonus";
  status: "not_started" | "learning" | "practiced" | "revised" | "mastered";
  completion_percentage: number;
  mastery_percentage: number;
  confidence: number;
}

interface Module {
  id: string;
  name: string;
  topics: Topic[];
}

interface AzureData {
  modules: Module[];
  overallCompletion: number;
  overallMastery: number;
  totalTopics: number;
  completedTopics: number;
  masteredTopics: number;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  important: {
    label: "Important",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  supporting: {
    label: "Supporting",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  bonus: {
    label: "Bonus",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
};

const statusConfig: Record<
  string,
  { label: string; className: string; color: string }
> = {
  not_started: {
    label: "Not Started",
    className: "text-muted",
    color: "#6b7280",
  },
  learning: {
    label: "Learning",
    className: "text-azure-light",
    color: "#60a5fa",
  },
  practiced: {
    label: "Practiced",
    className: "text-azure",
    color: "#3b82f6",
  },
  revised: {
    label: "Revised",
    className: "text-arabic",
    color: "#10b981",
  },
  mastered: {
    label: "Mastered",
    className: "text-success",
    color: "#22c55e",
  },
};

const statusOrder = [
  "not_started",
  "learning",
  "practiced",
  "revised",
  "mastered",
] as const;

export default function AzurePage() {
  const [data, setData] = useState<AzureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/azure")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (
    topicId: string,
    newStatus: string
  ) => {
    if (!data) return;

    const updatedModules = data.modules.map((mod) => ({
      ...mod,
      topics: mod.topics.map((topic) =>
        topic.id === topicId
          ? { ...topic, status: newStatus as Topic["status"] }
          : topic
      ),
    }));

    setData({ ...data, modules: updatedModules });

    try {
      await fetch("/api/azure/topic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, status: newStatus }),
      });
    } catch {
      setData(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">Loading Azure modules...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Failed to load Azure data.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-azure-light" />
          <h1 className="text-xs font-bold tracking-[0.3em] text-azure-light uppercase">
            Azure
          </h1>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          BECOME A SOLID AZURE ADMINISTRATOR
        </h2>
      </div>

      {/* Why This Matters */}
      <div className="glass-card rounded-xl p-5 border-azure/20">
        <div className="flex items-start gap-3">
          <Star className="h-4 w-4 text-azure-light mt-0.5 shrink-0" />
          <p className="text-sm text-muted leading-relaxed">
            Become a capable Azure Administrator with strong Microsoft cloud
            foundations and gradually move toward Azure/Microsoft Cloud Security.
            This 60-day sprint is about building a foundation, proving
            consistency, and establishing competence.
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Overall Progress
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted">
              {data.completedTopics}/{data.totalTopics} topics
            </span>
            <span className="text-muted">
              {data.masteredTopics} mastered
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <ProgressRing
            value={data.overallCompletion}
            size={72}
            color="#3b82f6"
            sublabel="completion"
          />
          <ProgressRing
            value={data.overallMastery}
            size={72}
            color="#22c55e"
            sublabel="mastery"
          />
          <div className="flex-1">
            <ProgressBar value={data.overallCompletion} color="#3b82f6" />
            <div className="mt-2">
              <ProgressBar value={data.overallMastery} color="#22c55e" />
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Link */}
      <Link
        href="/sessions"
        className="glass-card rounded-xl p-4 flex items-center justify-between hover:border-azure/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Beaker className="h-5 w-5 text-azure-light" />
          <div>
            <p className="text-sm font-medium">44 Learning Sessions</p>
            <p className="text-xs text-muted">
              Hands-on labs and guided exercises
            </p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted group-hover:text-azure-light transition-colors" />
      </Link>

      {/* Module Grid */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
          Modules
        </p>
        <div className="grid gap-3">
          {data.modules.map((mod) => {
            const isExpanded = expandedModule === mod.id;
            const moduleCompletion =
              mod.topics.length > 0
                ? mod.topics.reduce((sum, t) => sum + t.completion_percentage, 0) /
                  mod.topics.length
                : 0;
            const moduleMastery =
              mod.topics.length > 0
                ? mod.topics.reduce((sum, t) => sum + t.mastery_percentage, 0) /
                  mod.topics.length
                : 0;
            const masteredCount = mod.topics.filter(
              (t) => t.status === "mastered"
            ).length;

            return (
              <div key={mod.id} className="glass-card rounded-xl overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() =>
                    setExpandedModule(isExpanded ? null : mod.id)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <BookOpen className="h-4 w-4 text-azure-light shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{mod.name}</p>
                      <p className="text-xs text-muted">
                        {mod.topics.length} topics &middot; {masteredCount}{" "}
                        mastered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted">
                        {Math.round(moduleCompletion)}% complete
                      </p>
                      <p className="text-xs text-muted">
                        {Math.round(moduleMastery)}% mastery
                      </p>
                    </div>
                    <div className="w-24 hidden sm:block">
                      <ProgressBar
                        value={moduleCompletion}
                        color="#3b82f6"
                        height={6}
                        showLabel={false}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted" />
                    )}
                  </div>
                </button>

                {/* Topics List */}
                {isExpanded && (
                  <div className="border-t border-border/50">
                    {mod.topics.map((topic) => {
                      const priority = priorityConfig[topic.priority];
                      const status = statusConfig[topic.status];
                      const nextStatusIndex =
                        statusOrder.indexOf(topic.status) + 1;
                      const nextStatus =
                        nextStatusIndex < statusOrder.length
                          ? statusOrder[nextStatusIndex]
                          : null;

                      return (
                        <div
                          key={topic.id}
                          className="px-4 py-3 border-b border-border/30 last:border-b-0 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium truncate">
                                  {topic.name}
                                </p>
                                <span
                                  className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0",
                                    priority.className
                                  )}
                                >
                                  {priority.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "text-[10px] font-medium",
                                    status.className
                                  )}
                                >
                                  {status.label}
                                </span>
                                <span className="text-[10px] text-muted">
                                  {Math.round(topic.completion_percentage)}%
                                  complete
                                </span>
                                <span className="text-[10px] text-muted">
                                  {Math.round(topic.mastery_percentage)}%
                                  mastery
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {nextStatus && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(topic.id, nextStatus);
                                  }}
                                  className="text-[10px] px-2 py-1 rounded bg-azure/20 text-azure-light hover:bg-azure/30 transition-colors font-medium"
                                >
                                  Mark {statusConfig[nextStatus].label}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
