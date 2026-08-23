import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { tasks: true },
      orderBy: { created_at: "asc" },
    });

    return Response.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        objective: p.objective,
        architecture: p.architecture,
        servicesUsed: p.services_used ? JSON.parse(p.services_used) : [],
        status: p.status,
        completionPct: p.completion_pct,
        notes: p.notes,
        lessonsLearned: p.lessons_learned,
        interviewExplanation: p.interview_explanation,
        taskCount: p.tasks.length,
        completedTasks: p.tasks.filter((t) => t.completed).length,
        tasks: p.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
        })),
        createdAt: p.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Projects API error:", error);
    return Response.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "create") {
      const { name, objective } = body as {
        name: string;
        objective?: string;
      };

      if (!name) {
        return Response.json(
          { error: "name is required" },
          { status: 400 },
        );
      }

      const project = await prisma.project.create({
        data: { name, objective: objective || null },
        include: { tasks: true },
      });

      return Response.json({ success: true, project });
    }

    if (body.action === "toggleTask") {
      const { taskId } = body as { taskId: string };
      if (!taskId) {
        return Response.json(
          { error: "taskId is required" },
          { status: 400 },
        );
      }

      const task = await prisma.projectTask.findUnique({
        where: { id: taskId },
        include: { project: { include: { tasks: true } } },
      });
      if (!task) {
        return Response.json({ error: "Task not found" }, { status: 404 });
      }

      const updatedTask = await prisma.projectTask.update({
        where: { id: taskId },
        data: { completed: !task.completed },
      });

      const projectTasks = task.project.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !task.completed } : t,
      );
      const completedCount = projectTasks.filter((t) => t.completed).length;
      const newPct =
        projectTasks.length > 0
          ? Math.round((completedCount / projectTasks.length) * 100)
          : 0;

      const newStatus =
        newPct === 0
          ? "not_started"
          : newPct === 100
            ? "completed"
            : "in_progress";

      await prisma.project.update({
        where: { id: task.project_id },
        data: { completion_pct: newPct, status: newStatus },
      });

      return Response.json({ success: true, task: updatedTask, completionPct: newPct, status: newStatus });
    }

    if (body.action === "addTask") {
      const { projectId, title } = body as {
        projectId: string;
        title: string;
      };
      if (!projectId || !title) {
        return Response.json(
          { error: "projectId and title are required" },
          { status: 400 },
        );
      }

      const task = await prisma.projectTask.create({
        data: { project_id: projectId, title },
      });

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: true },
      });
      if (project) {
        const completedCount = project.tasks.filter((t) => t.completed).length;
        const newPct =
          project.tasks.length > 0
            ? Math.round((completedCount / project.tasks.length) * 100)
            : 0;
        await prisma.project.update({
          where: { id: projectId },
          data: { completion_pct: newPct },
        });
      }

      return Response.json({ success: true, task });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Projects POST error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
