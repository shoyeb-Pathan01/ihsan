"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, BookMarked, Brain, Moon, ArrowRight } from "lucide-react";

interface DeenData {
  arabic: { watched: number; total: number; mastery: number };
  reading: { pages: number; days: number };
  memorization: { ayahs: number; sessions: number };
  tahajjud: { nights: number };
}

export default function DeenPage() {
  const [data, setData] = useState<DeenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deen")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Loading...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Failed to load.</p></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted">
          <BookOpen className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">Deen</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">DEEN</h1>
        <p className="text-sm text-muted max-w-md">
          Translation padhne wale se Qur&apos;an ko Arabic mein samajhne wale learner tak.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {/* Arabic */}
        <Link href="/deen/arabic" className="card p-5 block hover:border-arabic/40 transition-colors group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="h-5 w-5 text-arabic-light" />
                <h2 className="text-base font-medium">Arabic</h2>
              </div>
              <p className="text-2xl font-semibold mb-1">{data.arabic.watched}/{data.arabic.total}</p>
              <p className="text-xs text-muted">lectures watched</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-arabic-light transition-colors mt-1" />
          </div>
        </Link>

        {/* Reading */}
        <Link href="/deen/reading" className="card p-5 block hover:border-arabic/40 transition-colors group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <BookMarked className="h-5 w-5 text-arabic-light" />
                <h2 className="text-base font-medium">Reading</h2>
              </div>
              {data.reading.pages > 0 ? (
                <>
                  <p className="text-2xl font-semibold mb-1">{data.reading.pages}</p>
                  <p className="text-xs text-muted">pages read</p>
                </>
              ) : (
                <p className="text-sm text-muted">No records yet</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-arabic-light transition-colors mt-1" />
          </div>
        </Link>

        {/* Memorization */}
        <Link href="/deen/memorization" className="card p-5 block hover:border-memorization/40 transition-colors group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="h-5 w-5 text-memorization" />
                <h2 className="text-base font-medium">Memorization</h2>
              </div>
              {data.memorization.ayahs > 0 ? (
                <>
                  <p className="text-2xl font-semibold mb-1">{data.memorization.ayahs}</p>
                  <p className="text-xs text-muted">ayahs memorized</p>
                </>
              ) : (
                <p className="text-sm text-muted">No records yet</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-memorization transition-colors mt-1" />
          </div>
        </Link>

        {/* Tahajjud */}
        <Link href="/deen/tahajjud" className="card p-5 block hover:border-tahajjud/40 transition-colors group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Moon className="h-5 w-5 text-tahajjud" />
                <h2 className="text-base font-medium">Tahajjud</h2>
              </div>
              {data.tahajjud.nights > 0 ? (
                <>
                  <p className="text-2xl font-semibold mb-1">{data.tahajjud.nights}</p>
                  <p className="text-xs text-muted">nights</p>
                </>
              ) : (
                <p className="text-sm text-muted">No records yet</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-tahajjud transition-colors mt-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
