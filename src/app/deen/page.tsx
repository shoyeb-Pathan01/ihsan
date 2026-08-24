"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Failed to load.</p></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top */}
      <div>
        <div className="eyebrow">Qur&apos;an Journey</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Qur&apos;an</h1>
        <p className="text-[#6b7280] m-0">Arabic learning, Qur&apos;an reading and memorization in one flow.</p>
      </div>

      {/* Mission quote */}
      <div className="card">
        <div className="eyebrow mb-2">Mission</div>
        <h2 className="font-extrabold text-base mb-1">Translation padhne wale se Qur&apos;an ko Arabic mein samajhne wale learner tak.</h2>
        <p className="text-[13px] text-[#6b7280]">Foundation: Lisān-ul-Qur&apos;ān. Method: Lecture → Book → Roman Urdu Notes → Qur&apos;anic Examples → Practice → Revision/MCQs → Doubt Clearing → Mastery.</p>
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        <Link href="/deen/arabic" className="card block hover:shadow-lg transition-shadow group">
          <div className="goal-head">
            <div>
              <div className="eyebrow">Arabic</div>
              <h2 className="font-extrabold text-base mt-1">Lisān-ul-Qur&apos;ān</h2>
              <p className="small">{data.arabic.watched}/{data.arabic.total} lectures watched</p>
            </div>
            <span className="badge">{data.arabic.total > 0 ? Math.round((data.arabic.watched / data.arabic.total) * 100) : 0}%</span>
          </div>
          <div className="progress mt-3">
            <div className="bar" style={{ width: `${data.arabic.total > 0 ? (data.arabic.watched / data.arabic.total) * 100 : 0}%` }}></div>
          </div>
        </Link>

        <Link href="/deen/reading" className="card block hover:shadow-lg transition-shadow group">
          <div className="goal-head">
            <div>
              <div className="eyebrow">Reading</div>
              <h2 className="font-extrabold text-base mt-1">Qur&apos;an Reading</h2>
              <p className="small">{data.reading.pages > 0 ? `${data.reading.pages} pages · ${data.reading.days} active days` : "No reading sessions yet."}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#6b7280] group-hover:text-[#635bff] mt-1" />
          </div>
        </Link>

        <Link href="/deen/memorization" className="card block hover:shadow-lg transition-shadow group">
          <div className="goal-head">
            <div>
              <div className="eyebrow">Memorization</div>
              <h2 className="font-extrabold text-base mt-1">Memorization</h2>
              <p className="small">{data.memorization.ayahs > 0 ? `${data.memorization.ayahs} ayahs · ${data.memorization.sessions} sessions` : "No memorization sessions yet."}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#6b7280] group-hover:text-[#635bff] mt-1" />
          </div>
        </Link>

        <Link href="/deen/tahajjud" className="card block hover:shadow-lg transition-shadow group">
          <div className="goal-head">
            <div>
              <div className="eyebrow">Tahajjud</div>
              <h2 className="font-extrabold text-base mt-1">Tahajjud Tracker</h2>
              <p className="small">{data.tahajjud.nights > 0 ? `${data.tahajjud.nights} nights` : "No records yet."}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#6b7280] group-hover:text-[#635bff] mt-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
