"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FolderKanban } from "lucide-react";
import Link from "next/link";

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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted text-sm">Loading...</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/career" className="flex items-center gap-1 text-xs text-muted hover:text-foreground mb-3">
          <ArrowLeft className="h-3 w-3" /> Career
        </Link>
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-memorization" />
          <h1 className="text-2xl font-semibold tracking-tight">PROJECTS</h1>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card p-8 text-center">
          <FolderKanban className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">No projects yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">{project.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${project.status === "completed" ? "bg-arabic-soft text-arabic-light" : project.status === "in_progress" ? "bg-azure-soft text-azure-light" : "bg-surface-elevated text-muted"}`}>
                  {project.status.replace("_", " ")}
                </span>
              </div>
              {project.objective && <p className="text-xs text-muted mb-3">{project.objective}</p>}
              {project.tasks.length > 0 && (
                <div className="space-y-1 mt-3">
                  {project.tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-3 h-3 rounded border ${t.completed ? "bg-arabic border-arabic" : "border-border"}`} />
                      <span className={t.completed ? "text-muted line-through" : ""}>{t.title}</span>
                    </div>
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
