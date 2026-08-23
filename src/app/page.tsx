"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Briefcase, Building2, ArrowRight, Sun, Moon } from "lucide-react";

interface Profile {
  name: string;
  mission_start: string;
  mission_end: string;
  baseline_azure: number | null;
  baseline_arabic: number | null;
  baseline_comm: number | null;
}

interface HomeData {
  profile: Profile | null;
  daysRemaining: number;
  dayNumber: number;
  hasActivity: boolean;
  careerProgress: { azure: number; communication: number; projects: number };
  deenProgress: { arabic: number; reading: number; memorization: number; tahajjud: number };
  todayFocus: { item: string; type: string } | null;
  reminder: { text: string; source_type: string; reference: string } | null;
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 6) return { text: "Good night", icon: Moon };
  if (h < 12) return { text: "Good morning", icon: Sun };
  if (h < 17) return { text: "Good afternoon", icon: Sun };
  if (h < 21) return { text: "Good evening", icon: Sun };
  return { text: "Good night", icon: Moon };
}

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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted text-sm">Failed to load.</p>
      </div>
    );
  }

  const { profile, daysRemaining, dayNumber, hasActivity, careerProgress, deenProgress, todayFocus, reminder } = data;
  const greeting = getTimeGreeting();
  const GreetingIcon = greeting.icon;

  const formatDate = (d: string) => {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted">
          <GreetingIcon className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">{greeting.text}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile?.name || "Welcome"}
        </h1>
      </div>

      {/* Target */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Target</p>
            <p className="text-lg font-medium">{formatDate(profile?.mission_end || "2027-01-01")}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-azure-light">{daysRemaining}</p>
            <p className="text-xs text-muted">days remaining</p>
          </div>
        </div>
      </div>

      {/* Welcome State */}
      {!hasActivity && (
        <div className="space-y-6">
          <div className="text-center space-y-2 py-4">
            <h2 className="text-lg font-semibold">YOUR JOURNEY STARTS HERE</h2>
            <p className="text-sm text-muted max-w-md mx-auto">
              A personal system for learning, building, worshipping and improving.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="h-5 w-5 text-azure-light" />
                <h3 className="text-sm font-medium">Career</h3>
              </div>
              <p className="text-2xl font-semibold mb-1">0%</p>
              <p className="text-xs text-muted mb-4">started</p>
              <Link
                href="/career"
                className="flex items-center gap-2 text-xs text-azure-light hover:underline"
              >
                Explore career <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-5 w-5 text-arabic-light" />
                <h3 className="text-sm font-medium">Deen</h3>
              </div>
              <p className="text-2xl font-semibold mb-1">0%</p>
              <p className="text-xs text-muted mb-4">started</p>
              <Link
                href="/deen"
                className="flex items-center gap-2 text-xs text-arabic-light hover:underline"
              >
                Explore deen <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Today's Focus */}
      <div className="card p-5">
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Today&apos;s Focus</p>
        {todayFocus ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{todayFocus.item}</p>
              <p className="text-xs text-muted mt-0.5 capitalize">{todayFocus.type}</p>
            </div>
            <Link
              href={`/deen`}
              className="text-xs text-azure-light hover:underline flex items-center gap-1"
            >
              Start <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted mb-3">Nothing scheduled yet.</p>
            <Link
              href="/career"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-azure-soft text-azure-light text-sm font-medium hover:bg-azure/20 transition-colors"
            >
              Plan today
            </Link>
          </div>
        )}
      </div>

      {/* Career / Deen Overview */}
      {hasActivity && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-azure-light" />
              <h3 className="text-sm font-medium">Career</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Azure</span>
                  <span>{careerProgress.azure}%</span>
                </div>
                <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-azure rounded-full" style={{ width: `${careerProgress.azure}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Communication</span>
                  <span>{careerProgress.communication} sessions</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Projects</span>
                  <span>{careerProgress.projects} active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-arabic-light" />
              <h3 className="text-sm font-medium">Deen</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Arabic</span>
                  <span>{deenProgress.arabic}%</span>
                </div>
                <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-arabic rounded-full" style={{ width: `${deenProgress.arabic}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Reading</span>
                  <span>{deenProgress.reading} pages</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Memorization</span>
                  <span>{deenProgress.memorization} ayahs</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Tahajjud</span>
                  <span>{deenProgress.tahajjud} nights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder */}
      {reminder && (
        <div className="card p-5 border-l-4 border-arabic/40">
          <p className="text-sm leading-relaxed text-muted-foreground mb-2">
            &ldquo;{reminder.text}&rdquo;
          </p>
          <p className="text-xs text-muted">
            {reminder.source_type} — {reminder.reference}
          </p>
        </div>
      )}
    </div>
  );
}
