"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, Calendar } from "lucide-react";

interface TodayData {
  career: { lectures: number; sessions: number; azureSessions: number };
  deen: {
    arabicLectures: number;
    pagestabsread: number;
    tahajjudNights: number;
    communicationSessions: number;
  };
  readings: { alhikam: { read: boolean }; yaqeen: { read: boolean } };
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNextWeekDays(): Date[] {
  const { end } = getWeekRange(new Date());
  const days: Date[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function ReviewPage() {
  const [todayData, setTodayData] = useState<TodayData | null>(null);

  const [reflection, setReflection] = useState({
    wentWell: "",
    slipped: "",
    differently: "",
  });

  const [intentions, setIntentions] = useState<{ trigger: string; action: string }[]>([]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newAction, setNewAction] = useState("");

  const now = new Date();
  const weekNum = getWeekNumber(now);
  const { start, end } = getWeekRange(now);

  useEffect(() => {
    fetch("/api/today")
      .then((r) => r.json())
      .then((data) => setTodayData(data))
      .catch(() => {});
  }, []);

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const nextWeekDays = getNextWeekDays();

  const careerDots = [true, true, true, true, true, false, false];
  const deenDots = [true, false, true, true, false, false, true];

  const weeklyStats = {
    azureSessions: todayData?.career?.azureSessions ?? 0,
    arabicLectures: todayData?.deen?.arabicLectures ?? 0,
    pagesRead: todayData?.deen?.pagestabsread ?? 0,
    tahajjudNights: todayData?.deen?.tahajjudNights ?? 0,
    communicationSessions: todayData?.deen?.communicationSessions ?? 0,
  };

  const suggestedArabic = [
    { title: "Arabic Lecture 4", status: "next" },
    { title: "Arabic Lecture 5", status: "next" },
    { title: "Arabic Lecture 6", status: "next" },
    { title: "Arabic Lecture 7", status: "upcoming" },
  ];

  const suggestedAzure = [
    { title: "Azure Session 3", status: "next" },
    { title: "Azure Session 4", status: "next" },
    { title: "Azure Session 5", status: "upcoming" },
  ];

  const overdueRevisions = todayData?.readings
    ? [
        ...(!todayData.readings.alhikam.read
          ? [{ title: "Al-Hikam reading revision", daysOverdue: 3 }]
          : []),
        ...(!todayData.readings.yaqeen.read
          ? [{ title: "Yaqeen reading revision", daysOverdue: 1 }]
          : []),
      ]
    : [];

  function addIntention() {
    if (!newTrigger.trim() || !newAction.trim()) return;
    setIntentions((prev) => [...prev, { trigger: newTrigger.trim(), action: newAction.trim() }]);
    setNewTrigger("");
    setNewAction("");
  }

  function removeIntention(index: number) {
    setIntentions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="review-page animate-fade-in">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Weekly Review</h1>
        <Link href="/today" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          Back to Today <ArrowRight size={16} />
        </Link>
      </header>

      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>
          <Calendar size={14} /> Week {weekNum} &middot; {formatDate(start)} – {formatDate(end)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Career</p>
            <div className="grid-2" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
              {weekDays.map((label, i) => (
                <div key={`career-${i}`} style={{ textAlign: "center" }}>
                  <span className="small" style={{ display: "block", marginBottom: "0.25rem", opacity: 0.6 }}>
                    {label}
                  </span>
                  <span
                    className={careerDots[i] ? "filled" : "empty"}
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: careerDots[i] ? "#10b981" : "transparent",
                      border: careerDots[i] ? "none" : "2px solid #555",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Deen</p>
            <div className="grid-2" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
              {weekDays.map((label, i) => (
                <div key={`deen-${i}`} style={{ textAlign: "center" }}>
                  <span className="small" style={{ display: "block", marginBottom: "0.25rem", opacity: 0.6 }}>
                    {label}
                  </span>
                  <span
                    className={deenDots[i] ? "filled" : "empty"}
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: deenDots[i] ? "#10b981" : "transparent",
                      border: deenDots[i] ? "none" : "2px solid #555",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Muhāsabah</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              What went well this week?
            </label>
            <textarea
              className="card"
              style={{ width: "100%", minHeight: "80px", resize: "vertical", padding: "0.75rem", fontFamily: "inherit" }}
              value={reflection.wentWell}
              onChange={(e) => setReflection((p) => ({ ...p, wentWell: e.target.value }))}
              placeholder="Celebrate your wins..."
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              What slipped?
            </label>
            <textarea
              className="card"
              style={{ width: "100%", minHeight: "80px", resize: "vertical", padding: "0.75rem", fontFamily: "inherit" }}
              value={reflection.slipped}
              onChange={(e) => setReflection((p) => ({ ...p, slipped: e.target.value }))}
              placeholder="Be honest with yourself..."
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              What will I do differently?
            </label>
            <textarea
              className="card"
              style={{ width: "100%", minHeight: "80px", resize: "vertical", padding: "0.75rem", fontFamily: "inherit" }}
              value={reflection.differently}
              onChange={(e) => setReflection((p) => ({ ...p, differently: e.target.value }))}
              placeholder="Commit to change..."
            />
          </div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>This Week&apos;s Numbers</div>

        <div className="grid-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
          <div className="stat">
            <span className="stat-label small">Azure Sessions</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{weeklyStats.azureSessions}</span>
            <div className="progress" style={{ marginTop: "0.5rem" }}>
              <div className="bar" style={{ width: `${Math.min((weeklyStats.azureSessions / 5) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="stat">
            <span className="stat-label small">Arabic Lectures</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{weeklyStats.arabicLectures}</span>
            <div className="progress" style={{ marginTop: "0.5rem" }}>
              <div className="bar" style={{ width: `${Math.min((weeklyStats.arabicLectures / 7) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="stat">
            <span className="stat-label small">Pages Read</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{weeklyStats.pagesRead}</span>
            <div className="progress" style={{ marginTop: "0.5rem" }}>
              <div className="bar" style={{ width: `${Math.min((weeklyStats.pagesRead / 50) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="stat">
            <span className="stat-label small">Tahajjud Nights</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{weeklyStats.tahajjudNights}</span>
            <div className="progress" style={{ marginTop: "0.5rem" }}>
              <div className="bar" style={{ width: `${Math.min((weeklyStats.tahajjudNights / 7) * 100, 100)}%` }} />
            </div>
          </div>

          <div className="stat">
            <span className="stat-label small">Communication</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{weeklyStats.communicationSessions}</span>
            <div className="progress" style={{ marginTop: "0.5rem" }}>
              <div className="bar" style={{ width: `${Math.min((weeklyStats.communicationSessions / 5) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Next Week Plan</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Arabic Lectures Focus</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {suggestedArabic.map((item, i) => (
                <div
                  key={i}
                  className="badge"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    backgroundColor: item.status === "next" ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${item.status === "next" ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                    fontSize: "0.875rem",
                  }}
                >
                  {item.status === "next" && <Check size={14} color="#10b981" />}
                  {item.title}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Azure Sessions Focus</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {suggestedAzure.map((item, i) => (
                <div
                  key={i}
                  className="badge"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    backgroundColor: item.status === "next" ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${item.status === "next" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                    fontSize: "0.875rem",
                  }}
                >
                  {item.status === "next" && <Check size={14} color="#3b82f6" />}
                  {item.title}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Overdue Revisions</p>
            {overdueRevisions.length === 0 ? (
              <p className="empty" style={{ fontSize: "0.875rem", opacity: 0.6 }}>
                All revisions up to date
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {overdueRevisions.map((item, i) => (
                  <div
                    key={i}
                    className="badge"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.5rem",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "#ef4444", fontWeight: 600 }}>{item.daysOverdue}d overdue</span>
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Suggested Focus Days</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
            {nextWeekDays.map((day, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: "0.5rem 0.25rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <span className="small" style={{ display: "block", opacity: 0.6 }}>
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="small" style={{ fontWeight: 600 }}>
                  {day.getDate()}
                </span>
                <span
                  className="small"
                  style={{
                    display: "block",
                    marginTop: "0.25rem",
                    fontSize: "0.7rem",
                    color: i < 4 ? "#10b981" : "#f59e0b",
                  }}
                >
                  {i < 4 ? "Study" : "Review"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="eyebrow" style={{ marginBottom: "1rem" }}>Implementation Intentions</div>
        <p style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "1rem" }}>
          &quot;When X happens, I will Y&quot; — pre-commit to your responses
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: "0.75rem", alignItems: "end", marginBottom: "1.25rem" }}>
          <div>
            <label className="small" style={{ display: "block", marginBottom: "0.25rem" }}>When...</label>
            <input
              className="card"
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", fontFamily: "inherit", fontSize: "0.875rem" }}
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              placeholder="e.g. I feel urge to skip Tahajjud"
              onKeyDown={(e) => e.key === "Enter" && addIntention()}
            />
          </div>
          <span className="small" style={{ paddingBottom: "0.5rem", opacity: 0.5 }}>→</span>
          <div>
            <label className="small" style={{ display: "block", marginBottom: "0.25rem" }}>I will...</label>
            <input
              className="card"
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", fontFamily: "inherit", fontSize: "0.875rem" }}
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="e.g. Pray 2 rakaat then reassess"
              onKeyDown={(e) => e.key === "Enter" && addIntention()}
            />
          </div>
          <button className="btn-primary" onClick={addIntention} style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
            Add
          </button>
        </div>

        {intentions.length === 0 ? (
          <p className="empty" style={{ fontSize: "0.875rem", opacity: 0.6 }}>
            No intentions yet — build your pre-commitments above
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {intentions.map((item, i) => (
              <div
                key={i}
                className="badge"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  fontSize: "0.875rem",
                }}
              >
                <span>
                  When <strong>{item.trigger}</strong>, I will <strong>{item.action}</strong>
                </span>
                <button
                  onClick={() => removeIntention(i)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
