"use client";

import { useEffect, useState } from "react";

export default function MemorizationPage() {
  const [surahs, setSurahs] = useState("");
  const [ayahs, setAyahs] = useState("");
  const [todayAyahs, setTodayAyahs] = useState("");
  const [todaySurahs, setTodaySurahs] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deen/memorization")
      .then((r) => r.json())
      .then((d) => {
        setSurahs(String(d.surahs || 0));
        setAyahs(String(d.ayahs || 0));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    await fetch("/api/deen/memorization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todaySurahs: parseInt(todaySurahs) || 0,
        todayAyahs: parseInt(todayAyahs) || 0,
      }),
    });
    setSurahs(String((parseInt(surahs) || 0) + (parseInt(todaySurahs) || 0)));
    setAyahs(String((parseInt(ayahs) || 0) + (parseInt(todayAyahs) || 0)));
    setTodaySurahs("");
    setTodayAyahs("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="eyebrow">Qur&apos;an Journey</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Memorization</h1>
        <p className="text-[#6b7280] m-0">Track your Qur&apos;an memorization progress.</p>
      </div>

      <div className="grid gap-4">
        <div className="card">
          <div className="eyebrow mb-2">Log Memorization</div>
          <div className="grid-2">
            <div>
              <label>Surahs today</label>
              <input type="number" min="0" value={todaySurahs} onChange={(e) => setTodaySurahs(e.target.value)} placeholder="e.g. 1" />
            </div>
            <div>
              <label>Ayahs today</label>
              <input type="number" min="0" value={todayAyahs} onChange={(e) => setTodayAyahs(e.target.value)} placeholder="e.g. 5" />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={save} className="btn-primary" disabled={!todaySurahs && !todayAyahs}>
              {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="eyebrow mb-2">Total</div>
          <div className="grid-2">
            <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
              <div className="text-2xl font-bold">{surahs}</div>
              <div className="text-[13px] text-[#6b7280]">Surahs</div>
            </div>
            <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
              <div className="text-2xl font-bold">{ayahs}</div>
              <div className="text-[13px] text-[#6b7280]">Ayahs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
