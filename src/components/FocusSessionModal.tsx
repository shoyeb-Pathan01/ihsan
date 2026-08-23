"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, Play, Pause, RotateCcw } from "lucide-react";

interface FocusSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
  defaultDuration?: number;
}

export default function FocusSessionModal({
  isOpen,
  onClose,
  topicName,
  defaultDuration = 45,
}: FocusSessionModalProps) {
  const [phase, setPhase] = useState<"timer" | "complete">("timer");
  const [totalSeconds, setTotalSeconds] = useState(defaultDuration * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(defaultDuration * 60);
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [accomplished, setAccomplished] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTotalSeconds(defaultDuration * 60);
    setRemainingSeconds(defaultDuration * 60);
    setStatus("idle");
    setPhase("timer");
    setAccomplished("");
    setConfidence(3);
    setNotes("");
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [defaultDuration, isOpen]);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPhase("complete");
            setStatus("idle");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleStart = () => setStatus("running");
  const handlePause = () => setStatus("paused");
  const handleResume = () => setStatus("running");
  const handleReset = () => {
    setStatus("idle");
    setRemainingSeconds(totalSeconds);
    setPhase("timer");
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const elapsedMinutes = Math.round((totalSeconds - remainingSeconds) / 60);
      await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicName,
          duration: elapsedMinutes,
          accomplished: accomplished || null,
          confidence,
          notes: notes || null,
        }),
      });
      onClose();
    } catch {
      console.error("Failed to save focus session");
    } finally {
      setSaving(false);
    }
  }, [topicName, totalSeconds, remainingSeconds, accomplished, confidence, notes, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-muted hover:text-foreground transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="glass-card rounded-2xl w-full max-w-md mx-4 p-8 border-azure/20 animate-fade-in">
        {phase === "timer" ? (
          <>
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold tracking-[0.4em] text-azure uppercase mb-2">
                Focus Session
              </p>
              <h2 className="text-lg font-bold tracking-tight">{topicName}</h2>
            </div>

            <div className="text-center mb-8">
              <p className={cn(
                "text-6xl font-mono font-bold tracking-tighter",
                remainingSeconds === 0 ? "text-azure" : "text-foreground"
              )}>
                {formatTime(remainingSeconds)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-8">
              {status === "idle" && remainingSeconds === totalSeconds && (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-2.5 bg-azure/20 hover:bg-azure/30 text-azure text-sm font-medium rounded-lg transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Start
                </button>
              )}
              {status === "running" && (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-2.5 bg-warning/20 hover:bg-warning/30 text-warning text-sm font-medium rounded-lg transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
              )}
              {status === "paused" && (
                <>
                  <button
                    onClick={handleResume}
                    className="flex items-center gap-2 px-6 py-2.5 bg-azure/20 hover:bg-azure/30 text-azure text-sm font-medium rounded-lg transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-2.5 bg-surface-elevated hover:bg-surface-elevated/80 text-muted text-sm font-medium rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </>
              )}
            </div>

            <p className="text-center text-xs text-muted tracking-wider">
              No distractions.
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-[10px] font-bold tracking-[0.4em] text-azure uppercase mb-2">
                Session Complete
              </p>
              <h2 className="text-lg font-bold tracking-tight">{topicName}</h2>
              <p className="text-sm text-muted mt-1">
                {formatTime(totalSeconds - remainingSeconds)} focused
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">
                  What did you accomplish?
                </label>
                <textarea
                  value={accomplished}
                  onChange={(e) => setAccomplished(e.target.value)}
                  rows={3}
                  placeholder="Describe what you worked on..."
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-azure/50 resize-none placeholder:text-muted/50"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">
                  Confidence (1-5)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setConfidence(val)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-medium transition-colors border",
                        confidence === val
                          ? "bg-azure/20 text-azure border-azure/40"
                          : "bg-surface-elevated text-muted border-border hover:border-azure/20"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any reflections..."
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-azure/50 resize-none placeholder:text-muted/50"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-azure/20 hover:bg-azure/30 text-azure text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-azure"></div>
                    Saving...
                  </>
                ) : (
                  "Save & Close"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
