"use client";

import { useEffect, useState, useCallback } from "react";
import { DailyTask } from "@/components/DailyTask";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  Plus,
  RefreshCw,
  ChevronRight,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  category: string;
  xp_value: number;
  completed: boolean;
  is_must_do: boolean;
}

export default function DailyMissionPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    category: "azure",
    xp_value: 5,
  });
  const [revisionDue, setRevisionDue] = useState(0);

  useEffect(() => {
    fetch("/api/daily-tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setRevisionDue(data.revisionDue || 0))
      .catch(() => {});
  }, []);

  const handleTaskToggle = useCallback(
    async (taskId: string) => {
      const newTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      setTasks(newTasks);

      try {
        await fetch("/api/tasks/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId }),
        });
      } catch {
        setTasks(tasks);
      }
    },
    [tasks]
  );

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const res = await fetch("/api/daily-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const task = await res.json();
      setTasks([...tasks, task]);
      setNewTask({ title: "", category: "azure", xp_value: 5 });
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted animate-pulse">Loading daily mission...</div>
      </div>
    );
  }

  const mustDoTasks = tasks.filter((t) => t.is_must_do).slice(0, 3);
  const optionalTasks = tasks.filter((t) => !t.is_must_do).slice(0, 2);
  const completedCount = tasks.filter((t) => t.completed).length;
  const mustDoCompleted = mustDoTasks.filter((t) => t.completed).length;
  const allMustDoComplete =
    mustDoTasks.length > 0 && mustDoCompleted === mustDoTasks.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Mission</h1>
          <div className="flex items-center gap-2 mt-1 text-muted">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(new Date())}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {completedCount} of {tasks.length} tasks
          </div>
          <div className="text-xs text-muted">completed</div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
            <Target className="h-4 w-4 text-warning" />
            Must-Do Tasks
          </h2>
          <span className="text-xs text-muted">
            {mustDoCompleted}/{mustDoTasks.length}
          </span>
        </div>
        <div className="space-y-2">
          {mustDoTasks.map((task) => (
            <DailyTask
              key={task.id}
              id={task.id}
              title={task.title}
              category={task.category}
              xpValue={task.xp_value}
              completed={task.completed}
              isMustDo={task.is_must_do}
              onToggle={handleTaskToggle}
            />
          ))}
          {mustDoTasks.length === 0 && (
            <p className="text-sm text-muted text-center py-4">
              No must-do tasks for today
            </p>
          )}
        </div>
        {allMustDoComplete && (
          <div className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 text-success">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">+20 XP Daily Bonus</span>
            </div>
            <p className="text-xs text-success/70 mt-1">
              All must-do tasks completed!
            </p>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Optional Tasks
          </h2>
          <span className="text-xs text-muted">
            {optionalTasks.filter((t) => t.completed).length}/
            {optionalTasks.length}
          </span>
        </div>
        <div className="space-y-2">
          {optionalTasks.map((task) => (
            <DailyTask
              key={task.id}
              id={task.id}
              title={task.title}
              category={task.category}
              xpValue={task.xp_value}
              completed={task.completed}
              isMustDo={task.is_must_do}
              onToggle={handleTaskToggle}
            />
          ))}
          {optionalTasks.length === 0 && (
            <p className="text-sm text-muted text-center py-4">
              No optional tasks for today
            </p>
          )}
        </div>
      </div>

      {revisionDue > 0 && (
        <Link
          href="/revision"
          className="glass-card rounded-xl p-4 flex items-center justify-between hover:border-warning/40 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium">
                {revisionDue} topics due for revision
              </p>
              <p className="text-xs text-muted">Keep your knowledge fresh</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted group-hover:text-warning transition-colors" />
        </Link>
      )}

      <div className="glass-card rounded-xl p-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 text-sm font-medium text-azure-light hover:text-azure transition-colors w-full"
        >
          <Plus className="h-4 w-4" />
          Quick Add Task
        </button>

        {showAddForm && (
          <form onSubmit={handleAddTask} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-sm focus:outline-none focus:border-azure transition-colors"
            />
            <div className="flex gap-3">
              <select
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value })
                }
                className="flex-1 px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-sm focus:outline-none focus:border-azure transition-colors"
              >
                <option value="azure">Azure</option>
                <option value="arabic">Arabic</option>
                <option value="reading">Reading</option>
                <option value="memorization">Memorization</option>
                <option value="tahajjud">Tahajjud</option>
                <option value="communication">Communication</option>
              </select>
              <select
                value={newTask.xp_value}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    xp_value: Number(e.target.value),
                  })
                }
                className="w-24 px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle text-sm focus:outline-none focus:border-azure transition-colors"
              >
                <option value={5}>5 XP</option>
                <option value={10}>10 XP</option>
                <option value={15}>15 XP</option>
                <option value={20}>20 XP</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-azure text-white text-sm font-medium hover:bg-azure-dark transition-colors"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg bg-surface-elevated text-muted text-sm hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}