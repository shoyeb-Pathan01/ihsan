"use client";

import { useEffect, useState } from "react";
import { SEED_REMINDERS } from "@/lib/data/reminders";
import {
  BookOpen,
  Plus,
  X,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface Reminder {
  id: string;
  text_paraphrase: string;
  source_type: string;
  reference: string;
  authenticity_note: string | null;
  category: string;
  enabled: boolean;
  is_custom: boolean;
  pool: string;
}

type Tab = "steadfastness" | "purpose" | "motivation";

const tabs: { key: Tab; label: string }[] = [
  { key: "steadfastness", label: "Steadfastness" },
  { key: "purpose", label: "Purpose & Provision" },
  { key: "motivation", label: "Motivation" },
];

const sourceIcons: Record<string, typeof BookOpen> = {
  Quran: BookOpen,
  Hadith: ShieldCheck,
  Quote: Quote,
};

const sourceColors: Record<string, string> = {
  Quran: "bg-arabic/20 text-arabic-light border-arabic/30",
  Hadith: "bg-azure/20 text-azure-light border-azure/30",
  Quote: "bg-memorization/20 text-memorization border-memorization/30",
};

export default function RemindersPage() {
  const [dbReminders, setDbReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("steadfastness");
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [newSource, setNewSource] = useState("Quote");
  const [newReference, setNewReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((d) => {
        setDbReminders(d.reminders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const seedReminders: Reminder[] = SEED_REMINDERS.map((r, i) => ({
    id: `seed-${i}`,
    text_paraphrase: r.text_paraphrase,
    source_type: r.source_type,
    reference: r.reference,
    authenticity_note: r.authenticity_note,
    category: r.category,
    enabled: true,
    is_custom: false,
    pool: r.pool,
  }));

  const allReminders = [
    ...seedReminders,
    ...dbReminders.filter((r) => !r.is_custom),
    ...dbReminders.filter((r) => r.is_custom),
  ];

  const filteredReminders = allReminders.filter((r) => r.pool === activeTab);

  const handleToggle = async (id: string) => {
    if (id.startsWith("seed-")) return;
    setDbReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    try {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id }),
      });
    } catch {
      setDbReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
      );
    }
  };

  const handleAddReminder = async () => {
    if (!newText.trim() || !newReference.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          text_paraphrase: newText.trim(),
          source_type: newSource,
          reference: newReference.trim(),
          category: "custom",
          pool: activeTab,
        }),
      });
      const data = await res.json();
      if (data.reminder) {
        setDbReminders((prev) => [...prev, data.reminder]);
      }
      setNewText("");
      setNewReference("");
      setShowForm(false);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-memorization" />
          <h1 className="text-xs font-bold tracking-[0.3em] text-memorization uppercase">
            Reminders
          </h1>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          ISLAMIC REMINDERS
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-memorization/20 text-memorization border border-memorization/30"
                : "text-muted hover:text-foreground border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminder List */}
      <div className="space-y-3">
        {filteredReminders.map((reminder) => {
          const SourceIcon = sourceIcons[reminder.source_type] || Quote;
          return (
            <div
              key={reminder.id}
              className={`glass-card rounded-xl p-5 transition-opacity ${
                !reminder.enabled ? "opacity-40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm font-medium leading-relaxed flex-1">
                  &ldquo;{reminder.text_paraphrase}&rdquo;
                </p>
                {!reminder.id.startsWith("seed-") && (
                  <button
                    onClick={() => handleToggle(reminder.id)}
                    className="text-xs px-2 py-1 rounded border border-border/50 text-muted hover:text-foreground hover:border-border shrink-0"
                  >
                    {reminder.enabled ? "Disable" : "Enable"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border font-medium ${
                    sourceColors[reminder.source_type] || "bg-muted/20 text-muted border-border"
                  }`}
                >
                  <SourceIcon className="h-3 w-3" />
                  {reminder.source_type}
                </span>
                <span className="text-[10px] text-muted">
                  {reminder.reference}
                </span>
                {reminder.authenticity_note && (
                  <span className="text-[10px] text-success italic">
                    {reminder.authenticity_note}
                  </span>
                )}
                {reminder.is_custom && (
                  <span className="text-[10px] text-muted italic">
                    Custom
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredReminders.length === 0 && (
          <div className="glass-card rounded-xl p-6 text-center text-sm text-muted">
            No reminders in this category yet.
          </div>
        )}
      </div>

      {/* Add Custom Reminder */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="glass-card rounded-xl p-4 flex items-center gap-3 w-full hover:border-memorization/40 transition-colors group"
        >
          <Plus className="h-5 w-5 text-memorization" />
          <span className="text-sm font-medium text-muted group-hover:text-foreground transition-colors">
            Add Custom Reminder
          </span>
        </button>
      ) : (
        <div className="glass-card rounded-xl p-5 border-memorization/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
              New Reminder
            </p>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                Reminder Text
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-memorization/50 resize-none"
                rows={3}
                placeholder="Write the reminder..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                  Source Type
                </label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-memorization/50"
                >
                  <option value="Quran">Quran</option>
                  <option value="Hadith">Hadith</option>
                  <option value="Quote">Quote</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
                  Reference
                </label>
                <input
                  value={newReference}
                  onChange={(e) => setNewReference(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-memorization/50"
                  placeholder="e.g. Sahih al-Bukhari 1"
                />
              </div>
            </div>
            <button
              onClick={handleAddReminder}
              disabled={submitting || !newText.trim() || !newReference.trim()}
              className="w-full py-2 rounded-lg bg-memorization/20 text-memorization font-medium text-sm hover:bg-memorization/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Reminder"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
