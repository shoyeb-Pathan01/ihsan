"use client";

import { useEffect, useState } from "react";

interface Project {
  id: string; name: string; objective: string | null; status: string;
  completion_pct: number; tasks: { id: string; title: string; completed: boolean }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/career/projects")
      .then((r) => r.json())
      .then((d) => { setProjects(d.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[#6b7280] text-sm">Loading...</p></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="eyebrow">Projects</div>
        <h1 className="text-[30px] font-bold mt-1 mb-1">Projects</h1>
        <p className="text-[#6b7280] m-0">Build real-world Azure projects for your portfolio.</p>
      </div>

      {projects.length === 0 ? (
        <div className="card empty">No projects yet.</div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="card">
              <div className="goal-head mb-2">
                <div>
                  <h2 className="font-extrabold text-base">{project.name}</h2>
                  {project.objective && <p className="small mt-1">{project.objective}</p>}
                </div>
                <span className={`badge ${project.status === "completed" ? "bg-[#dcfce7] text-[#166534]" : project.status === "in_progress" ? "bg-[#eef2ff] text-[#4f46e5]" : ""}`}>
                  {project.status.replace("_", " ")}
                </span>
              </div>
              {project.tasks.length > 0 && (
                <div className="grid gap-2 mt-3">
                  {project.tasks.map((t) => (
                    <label key={t.id} className="check">
                      <input type="checkbox" checked={t.completed} readOnly />
                      <span className={`text-[13px] ${t.completed ? "line-through text-[#6b7280]" : ""}`}>{t.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
