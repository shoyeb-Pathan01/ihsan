"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Check,
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
  id: number;
  lecture: string;
  status: string;
  youtube: string;
}

interface AzureSession {
  id: number;
  session: string;
  status: string;
  link: string;
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

  // Arabic
  const [arabicLectures, setArabicLectures] = useState<ArabicLecture[]>([]);

  // Azure
  const [azureSessions, setAzureSessions] = useState<AzureSession[]>([]);

  // Reading
  const [readingPages, setReadingPages] = useState<number>(0);
  const [readingData, setReadingData] = useState<ReadingData>({
    pagesToday: 0,
    totalPages: 0,
    activeDays: 0,
  });

  // Memorization
  const [memSurahs, setMemSurahs] = useState<number>(0);
  const [memAyahs, setMemAyahs] = useState<number>(0);
  const [memData, setMemData] = useState<MemorizationData>({
    surahsToday: 0,
    ayahsToday: 0,
    totalSurahs: 0,
    totalAyahs: 0,
  });

  // Tahajjud
  const [tahajjudEntries, setTahajjudEntries] = useState<TahajjudEntry[]>([]);
  const [tahajjudWokeUp, setTahajjudWokeUp] = useState<boolean | null>(null);
  const [tahajjudPrayed, setTahajjudPrayed] = useState<boolean | null>(null);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);

  // Communication
  const [commSessions, setCommSessions] = useState<CommunicationSession[]>([]);
  const [commTopic, setCommTopic] = useState<string>("");
  const [commExplain, setCommExplain] = useState<string>("");

  // Settings
  const [settingsData, setSettingsData] = useState<SettingsData>({
    name: "",
    missionStart: "",
    missionEnd: "",
    baselinePages: 0,
    baselineSurahs: 0,
    baselineAyahs: 0,
  });

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchArabic = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/deen/arabic?tab=lectures");
      const data = await res.json();
      setArabicLectures(data.lectures ?? data ?? []);
    } catch {
      setArabicLectures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAzure = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/career/azure");
      const data = await res.json();
      setAzureSessions(data.sessions ?? data ?? []);
    } catch {
      setAzureSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReading = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/deen/reading");
      const data = await res.json();
      setReadingData({
        pagesToday: data.pagesToday ?? 0,
        totalPages: data.totalPages ?? 0,
        activeDays: data.activeDays ?? 0,
      });
    } catch {
      setReadingData({ pagesToday: 0, totalPages: 0, activeDays: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMemorization = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/deen/memorization");
      const data = await res.json();
      setMemData({
        surahsToday: data.surahsToday ?? 0,
        ayahsToday: data.ayahsToday ?? 0,
        totalSurahs: data.totalSurahs ?? 0,
        totalAyahs: data.totalAyahs ?? 0,
      });
    } catch {
      setMemData({ surahsToday: 0, ayahsToday: 0, totalSurahs: 0, totalAyahs: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTahajjud = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/deen/tahajjud");
      const data = await res.json();
      setTahajjudEntries(data.entries ?? data ?? []);
    } catch {
      setTahajjudEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/career/projects");
      const data = await res.json();
      setProjects(data.projects ?? data ?? []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommunication = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/career/communication");
      const data = await res.json();
      setCommSessions(data.sessions ?? data ?? []);
    } catch {
      setCommSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettingsData({
        name: data.name ?? "",
        missionStart: data.missionStart ?? "",
        missionEnd: data.missionEnd ?? "",
        baselinePages: data.baselinePages ?? 0,
        baselineSurahs: data.baselineSurahs ?? 0,
        baselineAyahs: data.baselineAyahs ?? 0,
      });
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case "arabic":
        fetchArabic();
        break;
      case "azure":
        fetchAzure();
        break;
      case "reading":
        fetchReading();
        break;
      case "memorization":
        fetchMemorization();
        break;
      case "tahajjud":
        fetchTahajjud();
        break;
      case "projects":
        fetchProjects();
        break;
      case "communication":
        fetchCommunication();
        break;
      case "settings":
        fetchSettings();
        break;
    }
  }, [
    activeTab,
    fetchArabic,
    fetchAzure,
    fetchReading,
    fetchMemorization,
    fetchTahajjud,
    fetchProjects,
    fetchCommunication,
    fetchSettings,
  ]);

  // --- Submit handlers ---

  const handleReadingSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/deen/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: readingPages }),
      });
      await fetchReading();
      setReadingPages(0);
    } finally {
      setSaving(false);
    }
  };

  const handleMemSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/deen/memorization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surahs: memSurahs, ayahs: memAyahs }),
      });
      await fetchMemorization();
      setMemSurahs(0);
      setMemAyahs(0);
    } finally {
      setSaving(false);
    }
  };

  const handleTahajjudLog = async () => {
    if (tahajjudWokeUp === null || tahajjudPrayed === null) return;
    setSaving(true);
    try {
      await fetch("/api/deen/tahajjud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wokeUp: tahajjudWokeUp, prayed: tahajjudPrayed }),
      });
      await fetchTahajjud();
      setTahajjudWokeUp(null);
      setTahajjudPrayed(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCommLog = async () => {
    if (!commTopic.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/career/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: commTopic, explainIt: commExplain }),
      });
      await fetchCommunication();
      setCommTopic("");
      setCommExplain("");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Render helpers ---

  const renderArabic = () => (
    <div className="animate-fade-in">
      <div className="grid-stats" style={{ marginBottom: "1.5rem" }}>
        <div className="stat">
          <div className="stat-label">Total Lectures</div>
          <div className="small">{arabicLectures.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Completed</div>
          <div className="small">
            {arabicLectures.filter((l) => l.status === "completed").length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Remaining</div>
          <div className="small">
            {arabicLectures.filter((l) => l.status !== "completed").length}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="small">Loading...</p>
      ) : arabicLectures.length === 0 ? (
        <p className="empty">No lectures found.</p>
      ) : (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Lecture</th>
                <th>Status</th>
                <th>YouTube</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {arabicLectures.map((lecture, index) => (
                <tr key={lecture.id}>
                  <td>{index + 1}</td>
                  <td>{lecture.lecture}</td>
                  <td>
                    <span
                      className={`badge ${
                        lecture.status === "completed" ? "check" : ""
                      }`}
                    >
                      {lecture.status === "completed" && <Check size={14} />}
                      {lecture.status}
                    </span>
                  </td>
                  <td>
                    {lecture.youtube ? (
                      <a
                        href={lecture.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/arabic/${lecture.id}`}
                      className="btn-secondary"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAzure = () => (
    <div className="animate-fade-in">
      <div className="grid-stats" style={{ marginBottom: "1.5rem" }}>
        <div className="stat">
          <div className="stat-label">Total Sessions</div>
          <div className="small">{azureSessions.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Completed</div>
          <div className="small">
            {azureSessions.filter((s) => s.status === "completed").length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Remaining</div>
          <div className="small">
            {azureSessions.filter((s) => s.status !== "completed").length}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="small">Loading...</p>
      ) : azureSessions.length === 0 ? (
        <p className="empty">No sessions found.</p>
      ) : (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Session</th>
                <th>Status</th>
                <th>Link</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {azureSessions.map((session, index) => (
                <tr key={session.id}>
                  <td>{index + 1}</td>
                  <td>{session.session}</td>
                  <td>
                    <span
                      className={`badge ${
                        session.status === "completed" ? "check" : ""
                      }`}
                    >
                      {session.status === "completed" && <Check size={14} />}
                      {session.status}
                    </span>
                  </td>
                  <td>
                    {session.link ? (
                      <a
                        href={session.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/azure/${session.id}`}
                      className="btn-secondary"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderReading = () => {
    const progressPct =
      readingData.totalPages > 0
        ? Math.min(
            100,
            Math.round((readingData.totalPages / 100) * 100)
          )
        : 0;

    return (
      <div className="animate-fade-in">
        <div className="grid-stats" style={{ marginBottom: "1.5rem" }}>
          <div className="stat">
            <div className="stat-label">Total Pages</div>
            <div className="small">{readingData.totalPages}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active Days</div>
            <div className="small">{readingData.activeDays}</div>
          </div>
        </div>

        <div className="progress" style={{ marginBottom: "1.5rem" }}>
          <div
            className="bar"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="eyebrow">Log Today</div>
          <div className="form-group">
            <label htmlFor="reading-pages">Pages today</label>
            <input
              id="reading-pages"
              type="number"
              min={0}
              value={readingPages || ""}
              onChange={(e) => setReadingPages(Number(e.target.value))}
              placeholder="Pages read today"
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleReadingSave}
            disabled={saving || readingPages <= 0}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {loading && <p className="small">Loading...</p>}
      </div>
    );
  };

  const renderMemorization = () => {
    const surahProgressPct =
      memData.totalSurahs > 0
        ? Math.min(100, Math.round((memData.totalSurahs / 114) * 100))
        : 0;

    return (
      <div className="animate-fade-in">
        <div className="grid-stats" style={{ marginBottom: "1.5rem" }}>
          <div className="stat">
            <div className="stat-label">Total Surahs</div>
            <div className="small">{memData.totalSurahs}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total Ayahs</div>
            <div className="small">{memData.totalAyahs}</div>
          </div>
        </div>

        <div className="progress" style={{ marginBottom: "1.5rem" }}>
          <div
            className="bar"
            style={{ width: `${surahProgressPct}%` }}
          />
        </div>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="eyebrow">Log Today</div>
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="mem-surahs">Surahs today</label>
              <input
                id="mem-surahs"
                type="number"
                min={0}
                value={memSurahs || ""}
                onChange={(e) => setMemSurahs(Number(e.target.value))}
                placeholder="Surahs memorized"
              />
            </div>
            <div className="form-group">
              <label htmlFor="mem-ayahs">Ayahs today</label>
              <input
                id="mem-ayahs"
                type="number"
                min={0}
                value={memAyahs || ""}
                onChange={(e) => setMemAyahs(Number(e.target.value))}
                placeholder="Ayahs memorized"
              />
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={handleMemSave}
            disabled={saving || (memSurahs <= 0 && memAyahs <= 0)}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {loading && <p className="small">Loading...</p>}
      </div>
    );
  };

  const renderTahajjud = () => (
    <div className="animate-fade-in">
      <div className="grid-stats" style={{ marginBottom: "1.5rem" }}>
        <div className="stat">
          <div className="stat-label">Total Nights</div>
          <div className="small">{tahajjudEntries.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Prayed</div>
          <div className="small">
            {tahajjudEntries.filter((e) => e.prayed).length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Woke Up</div>
          <div className="small">
            {tahajjudEntries.filter((e) => e.wokeUp).length}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow">Log Night</div>

        <div className="form-group">
          <label>Woke up?</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`btn-secondary ${
                tahajjudWokeUp === true ? "check" : ""
              }`}
              onClick={() => setTahajjudWokeUp(true)}
              type="button"
            >
              {tahajjudWokeUp === true && <Check size={14} />}
              Yes
            </button>
            <button
              className={`btn-secondary ${
                tahajjudWokeUp === false ? "check" : ""
              }`}
              onClick={() => setTahajjudWokeUp(false)}
              type="button"
            >
              No
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Prayed?</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`btn-secondary ${
                tahajjudPrayed === true ? "check" : ""
              }`}
              onClick={() => setTahajjudPrayed(true)}
              type="button"
            >
              {tahajjudPrayed === true && <Check size={14} />}
              Yes
            </button>
            <button
              className={`btn-secondary ${
                tahajjudPrayed === false ? "check" : ""
              }`}
              onClick={() => setTahajjudPrayed(false)}
              type="button"
            >
              No
            </button>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleTahajjudLog}
          disabled={saving || tahajjudWokeUp === null || tahajjudPrayed === null}
        >
          {saving ? "Saving..." : "Log Night"}
        </button>
      </div>

      <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>
        History
      </div>
      {loading ? (
        <p className="small">Loading...</p>
      ) : tahajjudEntries.length === 0 ? (
        <p className="empty">No entries yet.</p>
      ) : (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Woke Up</th>
                <th>Prayed</th>
              </tr>
            </thead>
            <tbody>
              {tahajjudEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>
                    <span className={`badge ${entry.wokeUp ? "check" : ""}`}>
                      {entry.wokeUp && <Check size={14} />}
                      {entry.wokeUp ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${entry.prayed ? "check" : ""}`}>
                      {entry.prayed && <Check size={14} />}
                      {entry.prayed ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="animate-fade-in">
      {loading ? (
        <p className="small">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="empty">No projects found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {projects.map((project) => {
            const doneCount = project.tasks.filter((t) => t.done).length;
            const totalCount = project.tasks.length;
            const pct =
              totalCount > 0
                ? Math.round((doneCount / totalCount) * 100)
                : 0;

            return (
              <div className="card" key={project.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div className="eyebrow">{project.name}</div>
                  <span className="small">
                    {doneCount}/{totalCount} tasks
                  </span>
                </div>

                <div className="progress" style={{ marginBottom: "0.75rem" }}>
                  <div className="bar" style={{ width: `${pct}%` }} />
                </div>

                {project.tasks.length === 0 ? (
                  <p className="empty">No tasks.</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {project.tasks.map((task) => (
                      <li
                        key={task.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.25rem 0",
                        }}
                      >
                        <span
                          className={`badge ${task.done ? "check" : ""}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          {task.done && <Check size={14} />}
                          {task.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCommunication = () => (
    <div className="animate-fade-in">
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow">Log Session</div>
        <div className="form-group">
          <label htmlFor="comm-topic">Topic</label>
          <input
            id="comm-topic"
            type="text"
            value={commTopic}
            onChange={(e) => setCommTopic(e.target.value)}
            placeholder="What did you practice?"
          />
        </div>
        <div className="form-group">
          <label htmlFor="comm-explain">Explain It Challenge</label>
          <textarea
            id="comm-explain"
            value={commExplain}
            onChange={(e) => setCommExplain(e.target.value)}
            placeholder="Explain the concept in your own words..."
            rows={3}
          />
        </div>
        <button
          className="btn-primary"
          onClick={handleCommLog}
          disabled={saving || !commTopic.trim()}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>
        Practice Sessions
      </div>
      {loading ? (
        <p className="small">Loading...</p>
      ) : commSessions.length === 0 ? (
        <p className="empty">No sessions yet.</p>
      ) : (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {commSessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.date}</td>
                  <td>{session.topic}</td>
                  <td>
                    <span className="badge">{session.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="animate-fade-in">
      <div className="card">
        <div className="eyebrow">Profile</div>
        <div className="form-group">
          <label htmlFor="settings-name">Name</label>
          <input
            id="settings-name"
            type="text"
            value={settingsData.name}
            onChange={(e) =>
              setSettingsData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Your name"
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="settings-mission-start">Mission Start</label>
            <input
              id="settings-mission-start"
              type="date"
              value={settingsData.missionStart}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  missionStart: e.target.value,
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="settings-mission-end">Mission End</label>
            <input
              id="settings-mission-end"
              type="date"
              value={settingsData.missionEnd}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  missionEnd: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="eyebrow" style={{ marginTop: "1rem" }}>Baselines</div>
        <div className="grid-3">
          <div className="form-group">
            <label htmlFor="settings-baseline-pages">Pages / day</label>
            <input
              id="settings-baseline-pages"
              type="number"
              min={0}
              value={settingsData.baselinePages || ""}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  baselinePages: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="settings-baseline-surahs">Surahs / day</label>
            <input
              id="settings-baseline-surahs"
              type="number"
              min={0}
              value={settingsData.baselineSurahs || ""}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  baselineSurahs: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="settings-baseline-ayahs">Ayahs / day</label>
            <input
              id="settings-baseline-ayahs"
              type="number"
              min={0}
              value={settingsData.baselineAyahs || ""}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  baselineAyahs: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleSettingsSave}
          disabled={saving}
          style={{ marginTop: "1rem" }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {loading && (
        <p className="small" style={{ marginTop: "0.5rem" }}>
          Loading...
        </p>
      )}
    </div>
  );

  // --- Tab content map ---

  const renderContent = () => {
    switch (activeTab) {
      case "arabic":
        return renderArabic();
      case "azure":
        return renderAzure();
      case "reading":
        return renderReading();
      case "memorization":
        return renderMemorization();
      case "tahajjud":
        return renderTahajjud();
      case "projects":
        return renderProjects();
      case "communication":
        return renderCommunication();
      case "settings":
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="tabs" style={{ marginBottom: "1.5rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn-secondary ${activeTab === tab.id ? "check" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}
