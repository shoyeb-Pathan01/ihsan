"use client";

import { useEffect, useState, useRef } from "react";
import {
  Settings as SettingsIcon,
  Calendar,
  Target,
  Palette,
  Star,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react";

interface ProfileSettings {
  name: string;
  mission_start: string;
  mission_end: string;
  azure_weight: number;
  arabic_weight: number;
  reading_weight: number;
  memorization_weight: number;
  tahajjud_weight: number;
  communication_weight: number;
  daily_target: number;
  theme: string;
}

interface Baseline {
  azure_knowledge: number | null;
  arabic_knowledge: number | null;
  communication_confidence: number | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [baseline, setBaseline] = useState<Baseline>({
    azure_knowledge: null,
    arabic_knowledge: null,
    communication_confidence: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((d) => {
        setSettings(d.settings);
        setBaseline(d.baseline || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, baseline }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((d) => {
        const blob = new Blob([JSON.stringify(d, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ihsan-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.settings) {
          setSettings(data.settings);
        }
        if (data.baseline) {
          setBaseline(data.baseline);
        }
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await fetch("/api/settings", { method: "DELETE" });
      window.location.reload();
    } catch {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Failed to load settings.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase">
            Settings
          </h1>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">CONFIGURATION</h2>
      </div>

      {/* Mission Dates */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Mission Dates
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={settings.mission_start}
              onChange={(e) =>
                setSettings({ ...settings, mission_start: e.target.value })
              }
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-azure/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">
              End Date
            </label>
            <input
              type="date"
              value={settings.mission_end}
              onChange={(e) =>
                setSettings({ ...settings, mission_end: e.target.value })
              }
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-azure/50"
            />
          </div>
        </div>
      </div>

      {/* Progress Weights */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Progress Weights
          </p>
        </div>
        <div className="space-y-3">
          {[
            { key: "azure_weight" as const, label: "Azure" },
            { key: "arabic_weight" as const, label: "Arabic" },
            { key: "reading_weight" as const, label: "Reading" },
            { key: "memorization_weight" as const, label: "Memorization" },
            { key: "tahajjud_weight" as const, label: "Tahajjud" },
            { key: "communication_weight" as const, label: "Communication" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings[key]}
                  onChange={(e) =>
                    setSettings({ ...settings, [key]: Number(e.target.value) })
                  }
                  className="w-20 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground text-right focus:outline-none focus:border-azure/50"
                  min={0}
                  max={100}
                  step={2.5}
                />
                <span className="text-xs text-muted w-4">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Target */}
      <div className="glass-card rounded-xl p-5">
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
          Daily Target
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={settings.daily_target}
            onChange={(e) =>
              setSettings({ ...settings, daily_target: Number(e.target.value) })
            }
            className="w-20 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground text-right focus:outline-none focus:border-azure/50"
            min={1}
            max={20}
          />
          <span className="text-sm text-muted">tasks per day</span>
        </div>
      </div>

      {/* Theme */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Theme
          </p>
        </div>
        <div className="flex gap-2">
          {["dark", "light"].map((theme) => (
            <button
              key={theme}
              onClick={() => setSettings({ ...settings, theme })}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                settings.theme === theme
                  ? "bg-azure/20 text-azure-light border border-azure/30"
                  : "text-muted border border-transparent hover:text-foreground"
              }`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
              {theme === "light" && (
                <span className="ml-1 text-[10px]">(coming soon)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Baseline Self-Rating */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Baseline Self-Rating (Optional)
          </p>
        </div>
        <div className="space-y-3">
          {[
            { key: "azure_knowledge" as const, label: "Azure Knowledge" },
            { key: "arabic_knowledge" as const, label: "Arabic Knowledge" },
            { key: "communication_confidence" as const, label: "Communication Confidence" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setBaseline({ ...baseline, [key]: val })}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      baseline[key] === val
                        ? "bg-azure/20 text-azure-light border border-azure/30"
                        : "text-muted border border-border hover:border-border"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-azure/20 text-azure-light font-medium text-sm hover:bg-azure/30 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved
          </>
        ) : saving ? (
          "Saving..."
        ) : (
          "Save Settings"
        )}
      </button>

      {/* Data Management */}
      <div className="glass-card rounded-xl p-5">
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-4">
          Data Management
        </p>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data (JSON)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Data (JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Reset Progress */}
      <div className="glass-card rounded-xl p-5 border-danger/20">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-4 w-4 text-danger" />
          <p className="text-xs font-medium text-danger uppercase tracking-wider">
            Reset Progress
          </p>
        </div>
        <p className="text-sm text-muted mb-4">
          This will permanently delete all progress, streaks, XP, badges, and daily logs.
          Your profile settings will be preserved.
        </p>

        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            className="w-full py-2.5 rounded-lg border border-danger/30 text-danger text-sm font-medium hover:bg-danger/10 transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Reset All Progress
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
              <p className="text-xs text-danger font-medium">
                Are you sure? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setResetConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-lg bg-danger/20 text-danger text-sm font-medium hover:bg-danger/30 transition-colors disabled:opacity-40"
              >
                {resetting ? "Resetting..." : "Yes, Reset Everything"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
