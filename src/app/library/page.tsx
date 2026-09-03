"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Search,
  Settings,
  BookOpen,
  Moon,
  Briefcase,
  MessageSquare,
} from "lucide-react";

type TabId =
  | "arabic"
  | "azure"
  | "reading"
  | "memorization"
  | "tahajjud"
  | "projects"
  | "communication"
  | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "arabic", label: "Arabic", icon: <BookOpen size={16} /> },
  { id: "azure", label: "Azure", icon: <Search size={16} /> },
  { id: "reading", label: "Reading", icon: <BookOpen size={16} /> },
  { id: "memorization", label: "Memorization", icon: <BookOpen size={16} /> },
  { id: "tahajjud", label: "Tahajjud", icon: <Moon size={16} /> },
  { id: "projects", label: "Projects", icon: <Briefcase size={16} /> },
  { id: "communication", label: "Communication", icon: <MessageSquare size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

interface ArabicLecture {
  id: string;
  lecture_number: number;
  title: string;
  status: string;
  youtube_url: string;
}

interface AzureSession {
  id: string;
  session_number: number;
  title: string;
  drive_link: string;
  status: string;
}

interface ReadingData {
  pagesToday: number;
  totalPages: number;
  activeDays: number;
}

interface MemorizationData {
  surahsToday: number;
  ayahsToday: number;
  totalSurahs: number;
  totalAyahs: number;
}

interface TahajjudEntry {
  id: number;
  date: string;
  wokeUp: boolean;
  prayed: boolean;
}

interface Project {
  id: number;
  name: string;
  tasks: { id: number; title: string; done: boolean }[];
}

interface CommunicationSession {
  id: number;
  date: string;
  topic: string;
  score: number;
}

interface SettingsData {
  name: string;
  missionStart: string;
  missionEnd: string;
  baselinePages: number;
  baselineSurahs: number;
  baselineAyahs: number;
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("arabic");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [arabicLectures, setArabicLectures] = useState<ArabicLecture[]>([]);
  const [azureSessions, setAzureSessions] = useState<AzureSession[]>([]);
  const [readingPages, setReadingPages] = useState<number>(0);
  const [readingData, setReadingData] = useState<ReadingData>({ pagesToday: 0, totalPages: 0, activeDays: 0 });
  const [memSurahs, setMemSurahs] = useState<number>(0);
  const [memAyahs, setMemAyahs] = useState<number>(0);
  const [memData, setMemData] = useState<MemorizationData>({ surahsToday: 0, ayahsToday: 0, totalSurahs: 0, totalAyahs: 0 });
  const [tahajjudEntries, setTahajjudEntries] = useState<TahajjudEntry[]>([]);
  const [tahajjudWokeUp, setTahajjudWokeUp] = useState<boolean | null>(null);
  const [tahajjudPrayed, setTahajjudPrayed] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [commSessions, setCommSessions] = useState<CommunicationSession[]>([]);
  const [commTopic, setCommTopic] = useState<string>("");
  const [commExplain, setCommExplain] = useState<string>("");
  const [settingsData, setSettingsData] = useState<SettingsData>({ name: "", missionStart: "", missionEnd: "", baselinePages: 0, baselineSurahs: 0, baselineAyahs: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchTabData = useCallback(async (tabId: TabId) => {
    setLoading(true);
    try {
      switch (tabId) {
        case "arabic": {
          const res = await fetch("/api/deen/arabic?tab=lectures");
          const data = await res.json();
          setArabicLectures(data.lectures ?? data ?? []);
          break;
        }
        case "azure": {
          const res = await fetch("/api/career/azure");
          const data = await res.json();
          setAzureSessions(data.sessions ?? []);
          break;
        }
        case "reading": {
          const res = await fetch("/api/deen/reading");
          const data = await res.json();
          setReadingData({ pagesToday: data.pagesToday ?? 0, totalPages: data.totalPages ?? 0, activeDays: data.activeDays ?? 0 });
          break;
        }
        case "memorization": {
          const res = await fetch("/api/deen/memorization");
          const data = await res.json();
          setMemData({ surahsToday: data.surahsToday ?? 0, ayahsToday: data.ayahsToday ?? 0, totalSurahs: data.totalSurahs ?? 0, totalAyahs: data.totalAyahs ?? 0 });
          break;
        }
        case "tahajjud": {
          const res = await fetch("/api/deen/tahajjud");
          const data = await res.json();
          setTahajjudEntries(data.entries ?? data ?? []);
          break;
        }
        case "projects": {
          const res = await fetch("/api/career/projects");
          const data = await res.json();
          setProjects(data.projects ?? data ?? []);
          break;
        }
        case "communication": {
          const res = await fetch("/api/career/communication");
          const data = await res.json();
          setCommSessions(data.sessions ?? data ?? []);
          break;
        }
        case "settings": {
          const res = await fetch("/api/settings");
          const data = await res.json();
          setSettingsData({ name: data.name ?? "", missionStart: data.missionStart ?? "", missionEnd: data.missionEnd ?? "", baselinePages: data.baselinePages ?? 0, baselineSurahs: data.baselineSurahs ?? 0, baselineAyahs: data.baselineAyahs ?? 0 });
          break;
        }
      }
    } catch {} finally { setLoading(false); }
  }, []);

  const switchTab = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    setSearchQuery("");
    fetchTabData(tabId);
  }, [fetchTabData]);

  // Fetch initial tab data
  useState(() => { fetchTabData("arabic"); });

  // Submit handlers
  const handleReadingSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/deen/reading", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pages: readingPages }) });
      await fetchTabData("reading");
      setReadingPages(0);
    } finally { setSaving(false); }
  };

  const handleMemSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/deen/memorization", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ surahs: memSurahs, ayahs: memAyahs }) });
      await fetchTabData("memorization");
      setMemSurahs(0); setMemAyahs(0);
    } finally { setSaving(false); }
  };

  const handleTahajjudLog = async () => {
    if (tahajjudWokeUp === null || tahajjudPrayed === null) return;
    setSaving(true);
    try {
      await fetch("/api/deen/tahajjud", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wokeUp: tahajjudWokeUp, prayed: tahajjudPrayed }) });
      await fetchTabData("tahajjud");
      setTahajjudWokeUp(null); setTahajjudPrayed(null);
    } finally { setSaving(false); }
  };

  const handleCommLog = async () => {
    if (!commTopic.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/career/communication", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: commTopic, explainIt: commExplain }) });
      await fetchTabData("communication");
      setCommTopic(""); setCommExplain("");
    } finally { setSaving(false); }
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settingsData) });
    } finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-[26px] font-bold tracking-tight">Library</h1>

      {/* Scrollable tabs */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-[var(--color-career)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] border border-[var(--color-border)]"
              }`}
              onClick={() => switchTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Arabic */}
      {activeTab === "arabic" && (
        <div className="animate-fade-in space-y-5">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Total</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{arabicLectures.length}</p>
            </div>
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Done</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{arabicLectures.filter((l) => l.status === "completed").length}</p>
            </div>
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Left</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{arabicLectures.filter((l) => l.status !== "completed").length}</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <p className="text-[13px] text-[var(--color-muted)]">Loading...</p>
          ) : (searchQuery ? arabicLectures.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(l.lecture_number).includes(searchQuery) || l.status.toLowerCase().includes(searchQuery.toLowerCase())) : arabicLectures).length === 0 ? (
            <p className="text-[13px] text-[var(--color-muted)] text-center py-8">No lectures found.</p>
          ) : (
            <div className="space-y-2">
              {(searchQuery ? arabicLectures.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(l.lecture_number).includes(searchQuery) || l.status.toLowerCase().includes(searchQuery.toLowerCase())) : arabicLectures).map((lecture) => (
                <div key={lecture.id} className="card card-deen flex items-center justify-between gap-3 py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[var(--color-muted)] font-mono text-[12px] tabular-nums w-6 sm:w-8 text-right shrink-0">{lecture.lecture_number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{lecture.title}</p>
                      <span className="text-[11px] text-[var(--color-muted)] capitalize">{lecture.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lecture.youtube_url && (
                      <a href={lecture.youtube_url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-muted)] hover:text-[var(--color-deen)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <Link href={`/arabic/${lecture.id}`} className="btn-secondary text-[12px] px-3 py-1.5">Open</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Azure */}
      {activeTab === "azure" && (
        <div className="animate-fade-in space-y-5">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Total</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{azureSessions.length}</p>
            </div>
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Done</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{azureSessions.filter((s) => s.status === "completed").length}</p>
            </div>
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Left</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{azureSessions.filter((s) => s.status !== "completed").length}</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <p className="text-[13px] text-[var(--color-muted)]">Loading...</p>
          ) : (searchQuery ? azureSessions.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(s.session_number).includes(searchQuery) || s.status.toLowerCase().includes(searchQuery.toLowerCase())) : azureSessions).length === 0 ? (
            <p className="text-[13px] text-[var(--color-muted)] text-center py-8">No sessions found.</p>
          ) : (
            <div className="space-y-2">
              {(searchQuery ? azureSessions.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(s.session_number).includes(searchQuery) || s.status.toLowerCase().includes(searchQuery.toLowerCase())) : azureSessions).map((session) => (
                <div key={session.id} className="card flex items-center justify-between gap-3 py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[var(--color-muted)] font-mono text-[12px] tabular-nums w-6 sm:w-8 text-right shrink-0">{session.session_number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{session.title}</p>
                      <span className="text-[11px] text-[var(--color-muted)] capitalize">{session.status.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {session.drive_link && (
                      <a href={session.drive_link} target="_blank" rel="noopener noreferrer" className="text-[var(--color-muted)] hover:text-[var(--color-career)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <Link href={`/azure/${session.id}`} className="btn-secondary text-[12px] px-3 py-1.5">Open</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reading */}
      {activeTab === "reading" && (
        <div className="animate-fade-in space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Total Pages</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{readingData.totalPages}</p>
            </div>
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Active Days</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{readingData.activeDays}</p>
            </div>
          </div>

          <div className="card">
            <div className="eyebrow mb-3">Log Today</div>
            <div className="form-group">
              <label htmlFor="reading-pages" className="text-[13px] font-medium mb-1.5 block">Pages today</label>
              <input
                id="reading-pages"
                type="number"
                min={0}
                value={readingPages || ""}
                onChange={(e) => setReadingPages(Number(e.target.value))}
                placeholder="Pages read today"
                className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]"
              />
            </div>
            <button className="btn-primary w-full mt-3" onClick={handleReadingSave} disabled={saving || readingPages <= 0}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Memorization */}
      {activeTab === "memorization" && (
        <div className="animate-fade-in space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Total Surahs</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{memData.totalSurahs}</p>
            </div>
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Total Ayahs</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{memData.totalAyahs}</p>
            </div>
          </div>

          <div className="card">
            <div className="eyebrow mb-3">Log Today</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label htmlFor="mem-surahs" className="text-[13px] font-medium mb-1.5 block">Surahs</label>
                <input id="mem-surahs" type="number" min={0} value={memSurahs || ""} onChange={(e) => setMemSurahs(Number(e.target.value))} placeholder="0" className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px] text-center" />
              </div>
              <div className="form-group">
                <label htmlFor="mem-ayahs" className="text-[13px] font-medium mb-1.5 block">Ayahs</label>
                <input id="mem-ayahs" type="number" min={0} value={memAyahs || ""} onChange={(e) => setMemAyahs(Number(e.target.value))} placeholder="0" className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px] text-center" />
              </div>
            </div>
            <button className="btn-primary w-full mt-3" onClick={handleMemSave} disabled={saving || (memSurahs <= 0 && memAyahs <= 0)}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Tahajjud */}
      {activeTab === "tahajjud" && (
        <div className="animate-fade-in space-y-5">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Nights</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{tahajjudEntries.length}</p>
            </div>
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Prayed</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{tahajjudEntries.filter((e) => e.prayed).length}</p>
            </div>
            <div className="card text-center py-3 sm:py-4">
              <p className="text-[11px] text-[var(--color-muted)]">Woke Up</p>
              <p className="text-[20px] sm:text-[24px] font-extrabold tabular-nums">{tahajjudEntries.filter((e) => e.wokeUp).length}</p>
            </div>
          </div>

          <div className="card">
            <div className="eyebrow mb-3">Log Night</div>
            <div className="space-y-3">
              <div>
                <label className="text-[13px] font-medium mb-2 block">Woke up?</label>
                <div className="flex gap-2">
                  <button className={`flex-1 btn-secondary text-[13px] ${tahajjudWokeUp === true ? "bg-[var(--color-deen-soft)] text-[var(--color-deen)] border-[var(--color-deen)]" : ""}`} onClick={() => setTahajjudWokeUp(true)} type="button">Yes</button>
                  <button className={`flex-1 btn-secondary text-[13px] ${tahajjudWokeUp === false ? "bg-[var(--color-deen-soft)] text-[var(--color-deen)] border-[var(--color-deen)]" : ""}`} onClick={() => setTahajjudWokeUp(false)} type="button">No</button>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium mb-2 block">Prayed?</label>
                <div className="flex gap-2">
                  <button className={`flex-1 btn-secondary text-[13px] ${tahajjudPrayed === true ? "bg-[var(--color-deen-soft)] text-[var(--color-deen)] border-[var(--color-deen)]" : ""}`} onClick={() => setTahajjudPrayed(true)} type="button">Yes</button>
                  <button className={`flex-1 btn-secondary text-[13px] ${tahajjudPrayed === false ? "bg-[var(--color-deen-soft)] text-[var(--color-deen)] border-[var(--color-deen)]" : ""}`} onClick={() => setTahajjudPrayed(false)} type="button">No</button>
                </div>
              </div>
              <button className="btn-primary w-full" onClick={handleTahajjudLog} disabled={saving || tahajjudWokeUp === null || tahajjudPrayed === null}>
                {saving ? "Saving..." : "Log Night"}
              </button>
            </div>
          </div>

          <div>
            <div className="eyebrow mb-3">History</div>
            {loading ? (
              <p className="text-[13px] text-[var(--color-muted)]">Loading...</p>
            ) : tahajjudEntries.length === 0 ? (
              <p className="text-[13px] text-[var(--color-muted)] text-center py-8">No entries yet.</p>
            ) : (
              <div className="space-y-2">
                {tahajjudEntries.map((entry) => (
                  <div key={entry.id} className="card flex items-center justify-between py-3 px-3 sm:px-4">
                    <span className="text-[13px] font-medium tabular-nums">{entry.date}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-[12px] font-medium ${entry.wokeUp ? "text-[var(--color-deen)]" : "text-[var(--color-muted)]"}`}>
                        {entry.wokeUp ? "✓ Woke" : "✗ Slept"}
                      </span>
                      <span className={`text-[12px] font-medium ${entry.prayed ? "text-[var(--color-deen)]" : "text-[var(--color-muted)]"}`}>
                        {entry.prayed ? "✓ Prayed" : "✗ Missed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {activeTab === "projects" && (
        <div className="animate-fade-in space-y-4">
          {loading ? (
            <p className="text-[13px] text-[var(--color-muted)]">Loading...</p>
          ) : projects.length === 0 ? (
            <p className="text-[13px] text-[var(--color-muted)] text-center py-8">No projects found.</p>
          ) : (
            projects.map((project) => {
              const doneCount = project.tasks.filter((t) => t.done).length;
              const totalCount = project.tasks.length;
              const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
              return (
                <div key={project.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="eyebrow">{project.name}</span>
                    <span className="text-[12px] text-[var(--color-muted)] tabular-nums">{doneCount}/{totalCount}</span>
                  </div>
                  <div className="progress mb-3">
                    <div className="bar" style={{ width: `${pct}%` }} />
                  </div>
                  {project.tasks.length > 0 ? (
                    <div className="space-y-1.5">
                      {project.tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 py-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${task.done ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"}`} />
                          <span className={`text-[13px] ${task.done ? "text-[var(--color-muted)] line-through" : ""}`}>{task.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-[var(--color-muted)]">No tasks.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Communication */}
      {activeTab === "communication" && (
        <div className="animate-fade-in space-y-5">
          <div className="card">
            <div className="eyebrow mb-3">Log Session</div>
            <div className="form-group mb-3">
              <label htmlFor="comm-topic" className="text-[13px] font-medium mb-1.5 block">Topic</label>
              <input id="comm-topic" type="text" value={commTopic} onChange={(e) => setCommTopic(e.target.value)} placeholder="What did you practice?" className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]" />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="comm-explain" className="text-[13px] font-medium mb-1.5 block">Explain It Challenge</label>
              <textarea id="comm-explain" value={commExplain} onChange={(e) => setCommExplain(e.target.value)} placeholder="Explain the concept in your own words..." rows={3} className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[80px] resize-y" />
            </div>
            <button className="btn-primary w-full" onClick={handleCommLog} disabled={saving || !commTopic.trim()}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <div>
            <div className="eyebrow mb-3">Practice Sessions</div>
            {loading ? (
              <p className="text-[13px] text-[var(--color-muted)]">Loading...</p>
            ) : commSessions.length === 0 ? (
              <p className="text-[13px] text-[var(--color-muted)] text-center py-8">No sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {commSessions.map((session) => (
                  <div key={session.id} className="card flex items-center justify-between py-3 px-3 sm:px-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{session.topic}</p>
                      <span className="text-[11px] text-[var(--color-muted)] tabular-nums">{session.date}</span>
                    </div>
                    <span className="text-[13px] font-bold tabular-nums shrink-0">{session.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === "settings" && (
        <div className="animate-fade-in space-y-5">
          <div className="card">
            <div className="eyebrow mb-3">Profile</div>
            <div className="form-group mb-3">
              <label htmlFor="settings-name" className="text-[13px] font-medium mb-1.5 block">Name</label>
              <input id="settings-name" type="text" value={settingsData.name} onChange={(e) => setSettingsData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Your name" className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label htmlFor="settings-mission-start" className="text-[13px] font-medium mb-1.5 block">Start</label>
                <input id="settings-mission-start" type="date" value={settingsData.missionStart} onChange={(e) => setSettingsData((prev) => ({ ...prev, missionStart: e.target.value }))} className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]" />
              </div>
              <div className="form-group">
                <label htmlFor="settings-mission-end" className="text-[13px] font-medium mb-1.5 block">End</label>
                <input id="settings-mission-end" type="date" value={settingsData.missionEnd} onChange={(e) => setSettingsData((prev) => ({ ...prev, missionEnd: e.target.value }))} className="w-full text-[13px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px]" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="eyebrow mb-3">Baselines</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="form-group">
                <label htmlFor="settings-baseline-pages" className="text-[11px] sm:text-[13px] font-medium mb-1.5 block">Pages/day</label>
                <input id="settings-baseline-pages" type="number" min={0} value={settingsData.baselinePages || ""} onChange={(e) => setSettingsData((prev) => ({ ...prev, baselinePages: Number(e.target.value) }))} className="w-full text-[13px] px-2 sm:px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px] text-center" />
              </div>
              <div className="form-group">
                <label htmlFor="settings-baseline-surahs" className="text-[11px] sm:text-[13px] font-medium mb-1.5 block">Surahs/day</label>
                <input id="settings-baseline-surahs" type="number" min={0} value={settingsData.baselineSurahs || ""} onChange={(e) => setSettingsData((prev) => ({ ...prev, baselineSurahs: Number(e.target.value) }))} className="w-full text-[13px] px-2 sm:px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px] text-center" />
              </div>
              <div className="form-group">
                <label htmlFor="settings-baseline-ayahs" className="text-[11px] sm:text-[13px] font-medium mb-1.5 block">Ayahs/day</label>
                <input id="settings-baseline-ayahs" type="number" min={0} value={settingsData.baselineAyahs || ""} onChange={(e) => setSettingsData((prev) => ({ ...prev, baselineAyahs: Number(e.target.value) }))} className="w-full text-[13px] px-2 sm:px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent min-h-[48px] text-center" />
              </div>
            </div>
            <button className="btn-primary w-full mt-4" onClick={handleSettingsSave} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
