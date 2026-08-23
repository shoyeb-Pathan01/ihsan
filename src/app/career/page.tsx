"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Cloud, MessageSquare, FolderKanban, ArrowRight } from "lucide-react";

interface CareerData {
  azure: { completion: number; topicsCompleted: number; totalTopics: number; sessionsCompleted: number; totalSessions: number };
  communication: { totalSessions: number };
  projects: { total: number; inProgress: number };
}

export default function CareerPage() {
  const [data, setData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/career")
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted">
          <Briefcase className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">Career</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">CAREER</h1>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {/* Azure */}
        <Link href="/career/azure" className="card p-5 block hover:border-azure/40 transition-colors group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Cloud className="h-5 w-5 text-azure-light" />
                <h2 className="text-base font-medium">Azure Administration</h2>
              </div>
              <p className="text-2xl font-semibold mb-1">{data.azure.completion}%</p>
              <p className="text-xs text-muted">started</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                <span>{data.azure.topicsCompleted}/{data.azure.totalTopics} topics</span>
                <span>{data.azure.sessionsCompleted}/{data.azure.totalSessions} sessions</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-azure-light transition-colors mt-1" />
          </div>
        </Link>

        {/* Communication */}
        <Link href="/career/communication" className="card p-5 block hover:border-communication/40 transition-colors group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="h-5 w-5 text-communication" />
                <h2 className="text-base font-medium">Communication</h2>
              </div>
              <p className="text-2xl font-semibold mb-1">{data.communication.totalSessions}</p>
              <p className="text-xs text-muted">sessions</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-communication transition-colors mt-1" />
          </div>
        </Link>

        {/* Projects */}
        <Link href="/career/projects" className="card p-5 block hover:border-memorization/40 transition-colors group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <FolderKanban className="h-5 w-5 text-memorization" />
                <h2 className="text-base font-medium">Projects</h2>
              </div>
              <p className="text-2xl font-semibold mb-1">{data.projects.total}</p>
              <p className="text-xs text-muted">total</p>
              {data.projects.inProgress > 0 && (
                <p className="text-xs text-muted mt-1">{data.projects.inProgress} in progress</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-memorization transition-colors mt-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
