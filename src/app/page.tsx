"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Profile {
  name: string;
  mission_start: string;
  mission_end: string;
}

interface HomeData {
  profile: Profile | null;
  daysRemaining: number;
  hasActivity: boolean;
  careerProgress: { azure: number; communication: number; projects: number };
  deenProgress: { arabic: number; reading: number; memorization: number; tahajjud: number };
  reminder: { text: string; source_type: string; reference: string } | null;
  azureCurrent?: { title: string; module: string } | null;
  arabicCurrent?: { title: string; lecture_number: number } | null;
}

const quotes = [
  "Effort is the only mode of relating to the future that a human being actually has access to.",
  "The secret of getting ahead is getting started. — Mark Twain",
  "And that there is not for man except that [good] for which he strives. — Qur'an 53:39",
  "Indeed, Allah does not change the condition of a people until they change what is in themselves. — Qur'an 13:11",
];

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home")
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

  const { profile, daysRemaining, hasActivity, careerProgress, deenProgress, reminder, azureCurrent, arabicCurrent } = data;
  const quote = quotes[new Date().getDate() % quotes.length];

  const formatDate = (d: string) => {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top header */}
      <div className="flex justify-between items-start gap-5 mb-6">
        <div>
          <div className="eyebrow">Personal Operating System</div>
          <h1 className="text-[30px] font-bold mt-1 mb-1">Dashboard</h1>
          <p className="text-[#6b7280] m-0">Build consistency across career, Qur&apos;an, worship and communication.</p>
        </div>
        <div className="card max-w-[460px] text-[13px] text-[#374151]">
          {reminder ? (
            <>&ldquo;{reminder.text}&rdquo; <span className="text-[#6b7280]">— {reminder.source_type} {reminder.reference}</span></>
          ) : (
            <>&ldquo;{quote}&rdquo;</>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-stats">
        <div className="card">
          <div className="stat-label">Target</div>
          <div className="stat text-[22px]">{formatDate(profile?.mission_end || "2027-01-01")}</div>
          <div className="small">{daysRemaining} days remaining</div>
        </div>
        <div className="card">
          <div className="stat-label">Azure</div>
          <div className="stat">{careerProgress.azure}%</div>
          <div className="small">completion</div>
        </div>
        <div className="card">
          <div className="stat-label">Arabic</div>
          <div className="stat">{deenProgress.arabic}%</div>
          <div className="small">mastery</div>
        </div>
        <div className="card">
          <div className="stat-label">Sessions</div>
          <div className="stat">{careerProgress.communication + deenProgress.reading + deenProgress.memorization}</div>
          <div className="small">logged</div>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="card">
        <div className="eyebrow mb-3">Today&apos;s Focus</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#f6f7fb] rounded-xl">
            <div className="text-[12px] text-[#6b7280] mb-1">Career</div>
            {azureCurrent ? (
              <div>
                <div className="font-bold text-sm">Azure — {azureCurrent.title}</div>
                <div className="text-[12px] text-[#6b7280]">{azureCurrent.module}</div>
              </div>
            ) : (
              <div className="font-bold text-sm text-[#6b7280]">No active session</div>
            )}
          </div>
          <div className="p-4 bg-[#f6f7fb] rounded-xl">
            <div className="text-[12px] text-[#6b7280] mb-1">Deen</div>
            {arabicCurrent ? (
              <div>
                <div className="font-bold text-sm">Arabic — Lecture {arabicCurrent.lecture_number}</div>
                <div className="text-[12px] text-[#6b7280]">{arabicCurrent.title}</div>
              </div>
            ) : (
              <div className="font-bold text-sm text-[#6b7280]">No active lecture</div>
            )}
          </div>
        </div>
      </div>

      {/* Mission Dashboard */}
      <div className="grid-dashboard">
        <div className="card">
          <h2 className="font-extrabold text-base mb-4">Mission Dashboard</h2>
          <div className="goal">
            <div className="goal-head">
              <div>
                <div className="goal-name">Azure Administration</div>
                <div className="small">Become a solid Azure Administrator</div>
              </div>
              <span className="badge">{careerProgress.azure}%</span>
            </div>
            <div className="progress mt-2.5">
              <div className="bar" style={{ width: `${careerProgress.azure}%` }}></div>
            </div>
          </div>
          <div className="goal">
            <div className="goal-head">
              <div>
                <div className="goal-name">Qur&apos;anic Arabic</div>
                <div className="small">Lisān-ul-Qur&apos;ān Level 1</div>
              </div>
              <span className="badge">{deenProgress.arabic}%</span>
            </div>
            <div className="progress mt-2.5">
              <div className="bar" style={{ width: `${deenProgress.arabic}%` }}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-extrabold text-base mb-4">Today</h2>
          <div className="grid gap-2.5">
            <label className="check">
              <input type="checkbox" disabled />
              <span>
                <b>Tahajjud</b>
                <br />
                <span className="small">Mark today complete</span>
              </span>
            </label>
            <label className="check">
              <input type="checkbox" disabled />
              <span>
                <b>Qur&apos;an Reading</b>
                <br />
                <span className="small">Mark today complete</span>
              </span>
            </label>
            <label className="check">
              <input type="checkbox" disabled />
              <span>
                <b>Communication</b>
                <br />
                <span className="small">Mark today complete</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="card">
        <div className="eyebrow mb-3">Continue Learning</div>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/career/azure" className="p-4 bg-[#f6f7fb] rounded-xl hover:shadow-lg transition-shadow block">
            <div className="text-[12px] text-[#6b7280] mb-1">Career</div>
            <div className="font-bold text-sm">Azure Networking</div>
            <div className="text-[13px] text-[#635bff] mt-2 flex items-center gap-1">
              Continue <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
          <Link href="/deen/arabic" className="p-4 bg-[#f6f7fb] rounded-xl hover:shadow-lg transition-shadow block">
            <div className="text-[12px] text-[#6b7280] mb-1">Deen</div>
            <div className="font-bold text-sm">Lisān-ul-Qur&apos;ān — {arabicCurrent ? `Lecture ${arabicCurrent.lecture_number}` : "Start"}</div>
            <div className="text-[13px] text-[#635bff] mt-2 flex items-center gap-1">
              Continue <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
