"use client";

import { useEffect, useState } from "react";
import { FolderOpen, ChevronDown, ChevronUp, CheckCircle2, Circle, Layers } from "lucide-react";

interface ProjectTask { id: string; title: string; completed: boolean }

interface ProjectData {
  id: string;
  name: string;
  objective: string | null;
  servicesUsed: string[];
  status: string;
  completionPct: number;
  notes: string | null;
  lessonsLearned: string | null;
  taskCount: number;
  completedTasks: number;
  tasks: ProjectTask[];
}

const STATUS_STYLES: Record<string, string> = {
  not_started: "bg-muted/20 text-muted-foreground",
  in_progress: "bg-azure/15 text-azure-light",
  completed: "bg-success/15 text-success",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleTask = async (taskId: string, projectId: string) => {
    setTogglingTask(taskId);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleTask", taskId }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== projectId) return p;
            const newTasks = p.tasks.map((t) =>
              t.id === taskId ? { ...t, completed: !t.completed } : t,
            );
            return {
              ...p,
              tasks: newTasks,
              completedTasks: newTasks.filter((t) => t.completed).length,
              completionPct: data.completionPct,
              status: data.status,
            };
          }),
        );
      }
    } catch {}
    setTogglingTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-azure mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-azure/10 rounded-xl">
          <FolderOpen className="w-6 h-6 text-azure-light" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Hands-on labs to prove your skills</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Layers className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
          <p className="text-muted-foreground">Projects will appear here once seeded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const isExpanded = expandedId === project.id;
            return (
              <div key={project.id} className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                  className="w-full text-left p-5 flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-base truncate">{project.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[project.status] || STATUS_STYLES.not_started}`}>
                        {STATUS_LABELS[project.status] || project.status}
                      </span>
                    </div>
                    {project.objective && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.objective}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-azure rounded-full transition-all duration-500" style={{ width: `${project.completionPct}%` }} />
                      </div>
                      <span className="text-sm font-bold text-azure-light shrink-0">{project.completionPct}%</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{project.completedTasks}/{project.taskCount} tasks</span>
                      {project.servicesUsed.length > 0 && <span>{project.servicesUsed.length} services</span>}
                    </div>
                  </div>
                  <div className="shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border-subtle px-5 pb-5 space-y-4 animate-fade-in">
                    {project.servicesUsed.length > 0 && (
                      <div className="pt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Services Used</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {project.servicesUsed.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-azure/10 text-azure-light text-xs rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.tasks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tasks</h4>
                        <div className="space-y-1">
                          {project.tasks.map((task) => (
                            <button
                              key={task.id}
                              onClick={() => handleToggleTask(task.id, project.id)}
                              disabled={togglingTask === task.id}
                              className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left disabled:opacity-50"
                            >
                              {task.completed ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <Circle className="w-4 h-4 text-muted shrink-0" />}
                              <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(project.notes || project.lessonsLearned) && (
                      <div className="space-y-3">
                        {project.notes && (
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{project.notes}</p>
                          </div>
                        )}
                        {project.lessonsLearned && (
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Lessons Learned</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{project.lessonsLearned}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
