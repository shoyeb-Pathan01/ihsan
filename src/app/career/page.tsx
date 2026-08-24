"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Failed to load.</p></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top */}
      <div>
        <div className="eyebrow">Career Growth</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Career / Azure</h1>
        <p className="text-[#6b7280] m-0">Azure Administration → Microsoft Cloud → Cloud Security.</p>
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {/* Azure */}
        <Link href="/career/azure" className="card block hover:shadow-lg transition-shadow group">
          <div className="goal-head">
            <div>
              <div className="eyebrow">Azure</div>
              <h2 className="font-extrabold text-base mt-1">Azure Administration</h2>
              <p className="small">{data.azure.topicsCompleted}/{data.azure.totalTopics} topics · {data.azure.sessionsCompleted}/{data.azure.totalSessions} sessions</p>
            </div>
            <span className="badge">{data.azure.completion}%</span>
          </div>
          <div className="progress mt-3">
            <div className="bar" style={{ width: `${data.azure.completion}%` }}></div>
          </div>
        </Link>

        {/* Communication */}
        <Link href="/career/communication" className="card block hover:shadow-lg transition-shadow group">
          <div className="goal-head">
            <div>
              <div className="eyebrow">Communication</div>
              <h2 className="font-extrabold text-base mt-1">Communication Practice</h2>
              <p className="small">{data.communication.totalSessions} sessions logged</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#6b7280] group-hover:text-[#635bff] mt-1" />
          </div>
        </Link>

        {/* Projects */}
        <Link href="/career/projects" className="card block hover:shadow-lg transition-shadow group">
          <div className="goal-head">
            <div>
              <div className="eyebrow">Projects</div>
              <h2 className="font-extrabold text-base mt-1">Projects</h2>
              <p className="small">{data.projects.total} total · {data.projects.inProgress} in progress</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#6b7280] group-hover:text-[#635bff] mt-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
