"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Star } from "lucide-react";

interface ProfileSettings {
  name: string;
  mission_start: string;
  mission_end: string;
  baseline_azure: number | null;
  baseline_arabic: number | null;
  baseline_comm: number | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { setSettings(d.settings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Loading...</p></div>;
  }

  if (!settings) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Failed to load.</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted">
          <SettingsIcon className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">Settings</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">SETTINGS</h1>
      </div>

      {/* Profile */}
      <div className="card p-5">
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Profile</p>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">Name</label>
            <input type="text" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-azure/50" />
          </div>
        </div>
      </div>

      {/* Mission Dates */}
      <div className="card p-5">
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Mission Dates</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">Start</label>
            <input type="date" value={settings.mission_start} onChange={(e) => setSettings({ ...settings, mission_start: e.target.value })}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-azure/50" />
          </div>
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider block mb-1">End</label>
            <input type="date" value={settings.mission_end} onChange={(e) => setSettings({ ...settings, mission_end: e.target.value })}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-azure/50" />
          </div>
        </div>
      </div>

      {/* Baseline */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-muted" />
          <p className="text-xs text-muted uppercase tracking-wider">Baseline Self-Rating (Optional)</p>
        </div>
        <div className="space-y-3">
          {[
            { key: "baseline_azure" as const, label: "Azure Knowledge" },
            { key: "baseline_arabic" as const, label: "Arabic Knowledge" },
            { key: "baseline_comm" as const, label: "Communication Confidence" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} onClick={() => setSettings({ ...settings, [key]: v })}
                    className={`w-8 h-8 rounded-lg text-xs font-medium border transition-colors ${
                      settings[key] === v ? "bg-azure/20 text-azure-light border-azure/30" : "text-muted border-border hover:border-border"
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl bg-azure/20 text-azure-light font-medium text-sm hover:bg-azure/30 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
        {saved ? <><Save className="h-4 w-4" /> Saved</> : saving ? "Saving..." : <><Save className="h-4 w-4" /> Save Settings</>}
      </button>
    </div>
  );
}
