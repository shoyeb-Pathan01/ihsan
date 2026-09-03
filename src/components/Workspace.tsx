"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Toast } from "@/components/ui/Toast";

export interface Stage {
  key: string;
  label: string;
  done: boolean;
}

export interface Note {
  id: string;
  arabic_term?: string | null;
  meaning?: string | null;
  my_understanding?: string | null;
  topic?: string | null;
  content?: string;
  created_at: string;
}

interface WorkspaceProps {
  title: string;
  subtitle?: string;
  backHref: string;
  completionPct: number;
  masteryPct: number;
  stages: Stage[];
  goal: "career" | "deen";
  onStageToggle?: (key: string, done: boolean) => void;
  saving?: boolean;
  children: React.ReactNode;
  notes?: Note[];
  onNoteAdd?: (text: string) => void;
  onNoteSave?: (text: string) => void;
  notesPlaceholder?: string;
  notesMode?: "list" | "textarea";
  revisionInfo?: { count: number; nextDate: string | null; lectureId?: string };
  onSelfTestResult?: (result: "pass" | "fail") => void;
  nav?: { prev?: { href: string; label: string }; next?: { href: string; label: string } };
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/);
  return match ? match[1] : null;
}

export function Workspace({
  title,
  subtitle,
  backHref,
  completionPct,
  masteryPct,
  stages,
  goal,
  onStageToggle,
  saving = false,
  children,
  notes = [],
  onNoteAdd,
  onNoteSave,
  notesPlaceholder = "Add a note...",
  notesMode = "list",
  revisionInfo,
  onSelfTestResult,
  nav,
}: WorkspaceProps) {
  const [noteText, setNoteText] = useState("");
  const [showSelfTest, setShowSelfTest] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const masteryGap = completionPct - masteryPct;
  const gapWarning = masteryGap > 40;
  const goalColor = goal === "career" ? "var(--color-career)" : "var(--color-deen)";

  const addNote = () => {
    if (!noteText.trim() || !onNoteAdd) return;
    onNoteAdd(noteText.trim());
    setNoteText("");
    setToast({ visible: true, message: "Note saved ✓" });
  };

  const handleTextareaChange = (value: string) => {
    setNoteText(value);
    if (onNoteSave) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => onNoteSave(value), 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Link href={backHref} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-bold tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-[13px] text-[var(--color-muted)]">{subtitle}</p>}
          </div>
        </div>

        {/* Dual Progress Bars */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[var(--color-muted)] font-medium">Completion</span>
              <span className="text-[12px] font-bold tabular-nums">{completionPct}%</span>
            </div>
            <ProgressBar value={completionPct} goal={goal} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[var(--color-muted)] font-medium">Mastery</span>
              <span className="text-[12px] font-bold tabular-nums">{masteryPct}%</span>
            </div>
            <ProgressBar value={masteryPct} goal={goal} variant="mastery" />
          </div>
        </div>
        {gapWarning && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[var(--color-warning)] font-medium">
            <AlertTriangle className="h-3 w-3" />
            <span>Mastery lagging — practice needed</span>
          </div>
        )}
      </div>

      {/* Stages Bar */}
      <div className="flex items-center gap-1 flex-wrap">
        {stages.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            <button
              onClick={() => onStageToggle?.(s.key, !s.done)}
              disabled={saving || !onStageToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                s.done
                  ? "text-white"
                  : "bg-transparent text-[var(--color-muted)] border border-[var(--color-border)] hover:border-current"
              }`}
              style={s.done ? { backgroundColor: goalColor } : undefined}
            >
              {s.done && <Check className="h-3 w-3" />}
              {s.label}
            </button>
            {i < stages.length - 1 && <span className="text-[var(--color-border)]">→</span>}
          </div>
        ))}
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          {children}
        </div>

        {/* Notes */}
        <div className="lg:col-span-2">
          <Card className="sticky top-4">
            <div className="eyebrow mb-3">MY NOTES</div>

            {notesMode === "textarea" ? (
              <textarea
                value={noteText}
                onChange={(e) => handleTextareaChange(e.target.value)}
                placeholder={notesPlaceholder}
                className="w-full text-[13px] px-3 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-career)] focus:ring-2 focus:ring-[var(--color-career)]/10 outline-none min-h-[300px] resize-y bg-transparent"
              />
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addNote()}
                    placeholder={notesPlaceholder}
                    className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-career)] focus:ring-2 focus:ring-[var(--color-career)]/10 outline-none bg-transparent min-h-[48px]"
                  />
                  <button
                    onClick={addNote}
                    disabled={saving || !noteText.trim()}
                    className="btn-primary text-[13px] px-3"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {notes.length === 0 ? (
                    <p className="text-[13px] text-[var(--color-muted)] text-center py-8">No notes yet.</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="p-3 bg-[var(--color-surface-elevated)] rounded-xl">
                        <p className="text-[13px] font-medium">{note.arabic_term || note.topic || note.content}</p>
                        {note.meaning && <p className="text-[12px] text-[var(--color-muted)] mt-1">{note.meaning}</p>}
                        {note.my_understanding && <p className="text-[12px] text-[var(--color-muted)] mt-1 italic">{note.my_understanding}</p>}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Revision Info */}
          {revisionInfo && (
            <Card className="mt-4">
              <div className="eyebrow mb-2">REVISION</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px]">Revisions: <strong className="tabular-nums">{revisionInfo.count}</strong></span>
                {revisionInfo.nextDate && (
                  <span className="text-[12px] text-[var(--color-muted)]">Next: {revisionInfo.nextDate}</span>
                )}
              </div>
              <button
                onClick={() => setShowSelfTest(true)}
                className="btn-secondary text-[12px] mt-2 w-full"
              >
                Self-Test
              </button>
            </Card>
          )}

          {/* Navigation */}
          {nav && (
            <div className="flex items-center justify-between mt-4">
              {nav.prev ? (
                <Link href={nav.prev.href} className="text-[13px] text-[var(--color-career)] hover:underline">
                  ← {nav.prev.label}
                </Link>
              ) : <div />}
              {nav.next ? (
                <Link href={nav.next.href} className="text-[13px] text-[var(--color-career)] hover:underline">
                  {nav.next.label} →
                </Link>
              ) : <div />}
            </div>
          )}
        </div>
      </div>

      {/* Self-Test Modal */}
      {showSelfTest && (
        <div className="modal-overlay show">
          <div className="modal-box">
            <div className="eyebrow mb-3">SELF-TEST</div>
            <p className="text-[13px] mb-4">
              Lecture ke 3 key words recall karo. Honest rehna hai.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <input type="text" placeholder="Key word 1..." className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]" />
              <input type="text" placeholder="Key word 2..." className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]" />
              <input type="text" placeholder="Key word 3..." className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSelfTest(false); onSelfTestResult?.("pass"); setToast({ visible: true, message: "InshAllah ✓" }); }}
                className="flex-1 btn-deen rounded-lg"
              >
                Yaad hai
              </button>
              <button
                onClick={() => { setShowSelfTest(false); onSelfTestResult?.("fail"); setToast({ visible: true, message: "Revision rescheduled" }); }}
                className="flex-1 btn-secondary rounded-lg"
              >
                Nahi yaad
              </button>
            </div>
            <button onClick={() => setShowSelfTest(false)} className="w-full mt-3 btn-ghost text-[12px]">
              Cancel
            </button>
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} onDone={() => setToast({ visible: false, message: "" })} />
    </div>
  );
}
