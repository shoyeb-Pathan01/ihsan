"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, BookMarked, Plus } from "lucide-react";
import Link from "next/link";

interface ReadingLog {
  id: string; date: string; surah: string; ayah_from: number | null;
  ayah_to: number | null; pages: number; duration_minutes: number | null;
  reflection: string | null;
}

export default function ReadingPage() {
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    surah: "", ayah_from: "", ayah_to: "", pages: "1", duration_minutes: "", reflection: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/deen/reading");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/deen/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date, surah: form.surah,
          ayah_from: form.ayah_from ? parseInt(form.ayah_from) : null,
          ayah_to: form.ayah_to ? parseInt(form.ayah_to) : null,
          pages: parseInt(form.pages) || 1,
          duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
          reflection: form.reflection || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [data.log, ...prev]);
        setForm({ date: new Date().toISOString().split("T")[0], surah: "", ayah_from: "", ayah_to: "", pages: "1", duration_minutes: "", reflection: "" });
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
          <BookMarked className="h-5 w-5 text-arabic-light" />
          <h1 className="text-2xl font-semibold tracking-tight">READING</h1>
        </div>
        <p className="text-sm text-muted mt-1">Track your Qur&apos;anic reading sessions.</p>
      </div>

      {logs.length === 0 && !showForm && (
        <div className="card p-8 text-center">
          <BookMarked className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted mb-4">No reading recorded yet.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-arabic-soft text-arabic-light text-sm font-medium hover:bg-arabic/20 transition-colors">
            <Plus className="h-4 w-4" /> Record Reading
          </button>
        </div>
      )}

      {(logs.length > 0 || showForm) && (
        <button onClick={() => setShowForm(!showForm)}
          className="text-xs text-arabic-light hover:underline flex items-center gap-1">
          <Plus className="h-3 w-3" /> {showForm ? "Cancel" : "Record Reading"}
        </button>
      )}

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arabic/50" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Surah</label>
                <input type="text" value={form.surah} onChange={(e) => setForm({ ...form, surah: e.target.value })}
                  placeholder="e.g. Al-Fatiha" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arabic/50 placeholder:text-muted/50" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Ayah From</label>
                <input type="number" min="1" value={form.ayah_from} onChange={(e) => setForm({ ...form, ayah_from: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arabic/50" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Ayah To</label>
                <input type="number" min="1" value={form.ayah_to} onChange={(e) => setForm({ ...form, ayah_to: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arabic/50" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Pages</label>
                <input type="number" min="1" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arabic/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Duration (min, optional)</label>
              <input type="number" min="1" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arabic/50" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Reflection (optional)</label>
              <textarea value={form.reflection} onChange={(e) => setForm({ ...form, reflection: e.target.value })} rows={2}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arabic/50 resize-none placeholder:text-muted/50" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-arabic/20 hover:bg-arabic/30 text-arabic-light text-sm font-medium rounded-lg transition-colors">
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
                  {log.ayah_from && <span>Ayah {log.ayah_from}-{log.ayah_to}</span>}
                  <span>{log.pages} pages</span>
                  {log.duration_minutes && <span>{log.duration_minutes}min</span>}
                </div>
                {log.reflection && <p className="text-xs text-muted mt-1 line-clamp-1">{log.reflection}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
