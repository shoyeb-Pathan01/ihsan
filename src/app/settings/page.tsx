"use client";

import { useEffect, useState } from "react";

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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!settings) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Failed to load.</p></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="eyebrow">Settings</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Settings</h1>
        <p className="text-[#6b7280] m-0">Manage your profile and mission dates.</p>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="eyebrow mb-3">Profile</div>
        <div>
          <label>Name</label>
          <input type="text" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
        </div>
      </div>

      {/* Mission Dates */}
      <div className="card">
        <div className="eyebrow mb-3">Mission Dates</div>
        <div className="grid-2">
          <div>
            <label>Start</label>
            <input type="date" value={settings.mission_start} onChange={(e) => setSettings({ ...settings, mission_start: e.target.value })} />
          </div>
          <div>
            <label>End</label>
            <input type="date" value={settings.mission_end} onChange={(e) => setSettings({ ...settings, mission_end: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Baseline */}
      <div className="card">
        <div className="eyebrow mb-3">Baseline Self-Rating (Optional)</div>
        <div className="grid gap-3">
          {[
            { key: "baseline_azure" as const, label: "Azure Knowledge" },
            { key: "baseline_arabic" as const, label: "Arabic Knowledge" },
            { key: "baseline_comm" as const, label: "Communication Confidence" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label>{label}</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} onClick={() => setSettings({ ...settings, [key]: v })}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                      settings[key] === v
                        ? "bg-[#111827] text-white border-[#111827]"
                        : "bg-white text-[#4b5563] border-[#dfe3ea] hover:border-[#635bff]"
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
        className="btn-primary w-full disabled:opacity-50">
        {saved ? "Saved" : saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
