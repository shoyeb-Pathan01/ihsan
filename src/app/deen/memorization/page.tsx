"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Brain, Plus } from "lucide-react";
import Link from "next/link";

interface MemorizationLog {
  id: string; date: string; surah: string; ayah_from: number; ayah_to: number;
  is_new: boolean; confidence: number; mistakes: number; notes: string | null;
}

export default function MemorizationPage() {
  const [logs, setLogs] = useState<MemorizationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    surah: "", ayah_from: "", ayah_to: "", is_new: true, confidence: "3", mistakes: "0", notes: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/deen/memorization");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/deen/memorization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date, surah: form.surah,
          ayah_from: parseInt(form.ayah_from), ayah_to: parseInt(form.ayah_to),
          is_new: form.is_new, confidence: parseInt(form.confidence),
          mistakes: parseInt(form.mistakes), notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [data.log, ...prev]);
        setForm({ date: new Date().toISOString().split("T")[0], surah: "", ayah_from: "", ayah_to: "", is_new: true, confidence: "3", mistakes: "0", notes: "" });
        setShowForm(false);
      }
    } catch {}
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Loading...</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/deen" className="flex items-center gap-1 text-xs text-muted hover:text-foreground mb-3">
          <ArrowLeft className="h-3 w-3" /> Deen
        </Link>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-memorization" />
          <h1 className="text-2xl font-semibold tracking-tight">MEMORIZATION</h1>
        </div>
        <p className="text-sm text-muted mt-1">Track your Qur&apos;anic memorization.</p>
      </div>

      {logs.length === 0 && !showForm && (
        <div className="card p-8 text-center">
          <Brain className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted mb-4">No memorization records yet.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-memorization/15 text-memorization text-sm font-medium hover:bg-memorization/25 transition-colors">
            <Plus className="h-4 w-4" /> Record Session
          </button>
        </div>
      )}

      {(logs.length > 0 || showForm) && (
        <button onClick={() => setShowForm(!showForm)}
          className="text-xs text-memorization hover:underline flex items-center gap-1">
          <Plus className="h-3 w-3" /> {showForm ? "Cancel" : "Record Session"}
        </button>
      )}

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-memorization/50" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Surah</label>
                <input type="text" value={form.surah} onChange={(e) => setForm({ ...form, surah: e.target.value })}
                  placeholder="e.g. Al-Mulk" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-memorization/50 placeholder:text-muted/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Ayah From</label>
                <input type="number" min="1" value={form.ayah_from} onChange={(e) => setForm({ ...form, ayah_from: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-memorization/50" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Ayah To</label>
                <input type="number" min="1" value={form.ayah_to} onChange={(e) => setForm({ ...form, ayah_to: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-memorization/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({ ...form, is_new: true })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${form.is_new ? "bg-memorization/20 text-memorization border-memorization/40" : "bg-surface-elevated text-muted border-border"}`}>
                    New
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, is_new: false })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${!form.is_new ? "bg-memorization/20 text-memorization border-memorization/40" : "bg-surface-elevated text-muted border-border"}`}>
                    Revision
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Confidence (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} type="button" onClick={() => setForm({ ...form, confidence: String(v) })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        form.confidence === String(v) ? "bg-memorization/20 text-memorization border-memorization/40" : "bg-surface-elevated text-muted border-border"
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-memorization/50 resize-none placeholder:text-muted/50" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-memorization/20 hover:bg-memorization/30 text-memorization text-sm font-medium rounded-lg transition-colors">
              Save
            </button>
          </form>
        </div>
      )}

      {logs.length > 0 && (
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Recent Sessions</p>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{log.surah}</span>
                  <span className="text-[10px] text-muted">{log.date}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>Ayah {log.ayah_from}-{log.ayah_to}</span>
                  <span>{log.is_new ? "New" : "Revision"}</span>
                  <span>Confidence: {log.confidence}/5</span>
                </div>
                {log.notes && <p className="text-xs text-muted mt-1 line-clamp-1">{log.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
