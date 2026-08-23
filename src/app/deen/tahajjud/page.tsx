"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Moon, Plus } from "lucide-react";
import Link from "next/link";

interface TahajjudLog {
  id: string; date: string; completed: boolean; rakah_count: number | null;
  time: string | null; reflection: string | null;
}

export default function TahajjudPage() {
  const [logs, setLogs] = useState<TahajjudLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    completed: true, rakah_count: "", time: "", reflection: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/deen/tahajjud");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/deen/tahajjud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date, completed: form.completed,
          rakah_count: form.rakah_count ? parseInt(form.rakah_count) : null,
          time: form.time || null, reflection: form.reflection || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [data.log, ...prev]);
        setForm({ date: new Date().toISOString().split("T")[0], completed: true, rakah_count: "", time: "", reflection: "" });
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
          <Moon className="h-5 w-5 text-tahajjud" />
          <h1 className="text-2xl font-semibold tracking-tight">TAHAJJUD</h1>
        </div>
        <p className="text-sm text-muted mt-1">Track your night-prayer consistency.</p>
      </div>

      {logs.length === 0 && !showForm && (
        <div className="card p-8 text-center">
          <Moon className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted mb-4">No records yet.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tahajjud/15 text-tahajjud text-sm font-medium hover:bg-tahajjud/25 transition-colors">
            <Plus className="h-4 w-4" /> Record Tahajjud
          </button>
        </div>
      )}

      {(logs.length > 0 || showForm) && (
        <button onClick={() => setShowForm(!showForm)}
          className="text-xs text-tahajjud hover:underline flex items-center gap-1">
          <Plus className="h-3 w-3" /> {showForm ? "Cancel" : "Record Tahajjud"}
        </button>
      )}

      {showForm && (
        <div className="card p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tahajjud/50" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Completed</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({ ...form, completed: true })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${form.completed ? "bg-tahajjud/20 text-tahajjud border-tahajjud/40" : "bg-surface-elevated text-muted border-border"}`}>
                    Yes
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, completed: false })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${!form.completed ? "bg-tahajjud/20 text-tahajjud border-tahajjud/40" : "bg-surface-elevated text-muted border-border"}`}>
                    No
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Rakah (optional)</label>
                <input type="number" min="1" value={form.rakah_count} onChange={(e) => setForm({ ...form, rakah_count: e.target.value })}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tahajjud/50" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Time (optional)</label>
                <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="e.g. 3:30 AM" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tahajjud/50 placeholder:text-muted/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Reflection (optional)</label>
              <textarea value={form.reflection} onChange={(e) => setForm({ ...form, reflection: e.target.value })} rows={2}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tahajjud/50 resize-none placeholder:text-muted/50" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-tahajjud/20 hover:bg-tahajjud/30 text-tahajjud text-sm font-medium rounded-lg transition-colors">
              Save
            </button>
          </form>
        </div>
      )}

      {logs.length > 0 && (
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Recent Records</p>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{log.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${log.completed ? "bg-tahajjud/20 text-tahajjud" : "bg-surface-elevated text-muted"}`}>
                    {log.completed ? "Completed" : "Missed"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  {log.rakah_count && <span>{log.rakah_count} rakah</span>}
                  {log.time && <span>{log.time}</span>}
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
