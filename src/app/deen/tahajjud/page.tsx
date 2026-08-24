"use client";

import { useEffect, useState } from "react";

interface TahajjudNight {
  date: string; woke_up: boolean; prayed: boolean; notes: string | null;
}

export default function TahajjudPage() {
  const [nights, setNights] = useState<TahajjudNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split("T")[0]);
  const [todayWokeUp, setTodayWokeUp] = useState(false);
  const [todayPrayed, setTodayPrayed] = useState(false);
  const [todayNotes, setTodayNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/deen/tahajjud")
      .then((r) => r.json())
      .then((d) => { setNights(d.nights || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    await fetch("/api/deen/tahajjud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: todayDate, woke_up: todayWokeUp, prayed: todayPrayed, notes: todayNotes || null }),
    });
    setNights([{ date: todayDate, woke_up: todayWokeUp, prayed: todayPrayed, notes: todayNotes || null }, ...nights]);
    setTodayWokeUp(false);
    setTodayPrayed(false);
    setTodayNotes("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  const prayedCount = nights.filter((n) => n.prayed).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="eyebrow">Qur&apos;an Journey</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Tahajjud</h1>
        <p className="text-[#6b7280] m-0">A quiet night prayer tracker.</p>
      </div>

      <div className="card">
        <div className="grid-2">
          <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
            <div className="text-2xl font-bold">{nights.length}</div>
            <div className="text-[13px] text-[#6b7280]">Nights tracked</div>
          </div>
          <div className="text-center p-4 bg-[#f6f7fb] rounded-xl">
            <div className="text-2xl font-bold">{prayedCount}</div>
            <div className="text-[13px] text-[#6b7280]">Prayed</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow mb-2">Log Night</div>
        <div className="grid-2">
          <div>
            <label>Date</label>
            <input type="date" value={todayDate} onChange={(e) => setTodayDate(e.target.value)} />
          </div>
          <div className="flex gap-2 items-end">
            <button onClick={() => setTodayWokeUp(!todayWokeUp)} className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${todayWokeUp ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#4b5563] border-[#dfe3ea] hover:border-[#635bff]"}`}>
              {todayWokeUp ? "✓ Woke up" : "Did not wake up"}
            </button>
            <button onClick={() => setTodayPrayed(!todayPrayed)} className={`flex-1 py-2 rounded-lg text-[13px] font-medium border transition-colors ${todayPrayed ? "bg-[#635bff] text-white border-[#635bff]" : "bg-white text-[#4b5563] border-[#dfe3ea] hover:border-[#635bff]"}`}>
              {todayPrayed ? "✓ Prayed" : "Did not pray"}
            </button>
          </div>
        </div>
        <div className="mt-3">
          <label>Notes</label>
          <input type="text" value={todayNotes} onChange={(e) => setTodayNotes(e.target.value)} placeholder="Optional notes" />
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={save} className="btn-primary" disabled={saved}>
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-extrabold text-base mb-3">History</h3>
        {nights.length === 0 ? (
          <p className="text-[13px] text-[#6b7280]">No records yet.</p>
        ) : (
          <div className="space-y-2">
            {nights.slice(0, 20).map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#f6f7fb] rounded-xl">
                <div>
                  <div className="text-[13px] font-medium">{n.date}</div>
                  {n.notes && <div className="text-[12px] text-[#6b7280] mt-1">{n.notes}</div>}
                </div>
                <div className="flex gap-2">
                  {n.woke_up && <span className="badge bg-[#eef2ff] text-[#4f46e5]">Woke up</span>}
                  {n.prayed && <span className="badge bg-[#dcfce7] text-[#166534]">Prayed</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
