"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Target, Play, Clock, CheckCircle, Timer } from "lucide-react";
import FocusSessionModal from "@/components/FocusSessionModal";

interface FocusSession {
  id: string;
  topicName: string;
  durationMinutes: number;
  accomplished: string | null;
  confidenceAfter: number | null;
  notes: string | null;
  createdAt: string;
}

interface FocusStats {
  totalMinutes: number;
  completedSessions: number;
  averageDuration: number;
}

const QUICK_TOPICS = [
  { name: "Azure Topic", color: "azure" },
  { name: "Arabic Revision", color: "arabic" },
  { name: "Communication Practice", color: "communication" },
];

const topicColorMap: Record<string, string> = {
  azure: "bg-azure/15 text-azure border-azure/30 hover:bg-azure/25",
  arabic: "bg-arabic/15 text-arabic-light border-arabic/30 hover:bg-arabic/25",
  communication:
    "bg-communication/15 text-communication border-communication/30 hover:bg-communication/25",
};

export default function FocusPage() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [stats, setStats] = useState<FocusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState("");
  const [modalDuration, setModalDuration] = useState(45);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/focus");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSessions(data.sessions);
      setStats(data.stats);
    } catch {
      console.error("Failed to load focus data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openSession = (topic: string, duration = 45) => {
    setActiveTopic(topic);
    setModalDuration(duration);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    fetchData();
  };

  const formatMinutes = (m: number) => {
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">Loading focus data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-azure" />
          <h1 className="text-xs font-bold tracking-[0.3em] text-azure uppercase">
            Focus Mode
          </h1>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">FOCUS MODE</h2>
      </div>

      {/* Quick Start */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted uppercase tracking-wider">
          Quick Start
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic.name}
              onClick={() => openSession(topic.name)}
              className={cn(
                "glass-card rounded-xl p-4 text-left border transition-colors",
                topicColorMap[topic.color]
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{topic.name}</span>
                <Play className="h-4 w-4 opacity-60" />
              </div>
              <p className="text-xs opacity-60 mt-1">45 min session</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <Timer className="h-4 w-4 text-azure mx-auto mb-2" />
            <p className="text-2xl font-bold text-azure">
              {formatMinutes(stats.totalMinutes)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Focus</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <CheckCircle className="h-4 w-4 text-azure mx-auto mb-2" />
            <p className="text-2xl font-bold text-azure">
              {stats.completedSessions}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sessions</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Clock className="h-4 w-4 text-azure mx-auto mb-2" />
            <p className="text-2xl font-bold text-azure">
              {stats.averageDuration}m
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg Duration</p>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
          Recent Sessions
        </p>
        {sessions.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <Target className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">
              No sessions yet. Start your first focus session!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="glass-card rounded-xl p-4 animate-fade-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-azure/15 text-azure">
                        {session.topicName}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted">
                      <span>{session.durationMinutes}min</span>
                      {session.confidenceAfter && (
                        <span>Confidence: {session.confidenceAfter}/5</span>
                      )}
                    </div>
                    {session.accomplished && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">
                        {session.accomplished}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FocusSessionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        topicName={activeTopic}
        defaultDuration={modalDuration}
      />
    </div>
  );
}
