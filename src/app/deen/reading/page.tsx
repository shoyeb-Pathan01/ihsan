"use client";

import { useEffect, useState } from "react";

export default function ReadingPage() {
  const [pages, setPages] = useState("");
  const [days, setDays] = useState("");
  const [todayPages, setTodayPages] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deen/reading")
      .then((r) => r.json())
      .then((d) => {
        setPages(String(d.pages || 0));
        setDays(String(d.days || 0));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    await fetch("/api/deen/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todayPages: parseInt(todayPages) || 0 }),
    });
    setPages(String((parseInt(pages) || 0) + (parseInt(todayPages) || 0)));
    setTodayPages("");
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
        <h1 className="text-[30px] font-bold mt-1 mb-1">Reading</h1>
        <p className="text-[#6b7280] m-0">Track Qur&apos;an pages you&apos;ve read.</p>
      </div>

      <div className="grid gap-4">
        <div className="card">
          <div className="eyebrow mb-2">Log Pages Read</div>
          <div className="grid-2">
            <div>
              <label>Pages today</label>
              <input type="number" min="1" value={todayPages} onChange={(e) => setTodayPages(e.target.value)} placeholder="e.g. 4" />
            </div>
            <div className="flex items-end">
              <button onClick={save} className="btn-primary w-full" disabled={!todayPages}>
                {saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="eyebrow mb-2">Total</div>
          <div className="grid-2">
            <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
              <div className="text-2xl font-bold">{pages}</div>
              <div className="text-[13px] text-[#6b7280]">Pages read</div>
            </div>
            <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
              <div className="text-2xl font-bold">{days}</div>
              <div className="text-[13px] text-[#6b7280]">Active days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
