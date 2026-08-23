import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    const profileId = profile?.id;

    const totalTopics = await prisma.goalTopic.count();
    const completedTopics = await prisma.goalTopic.count({
      where: { status: { not: "not_started" } },
    });

    const totalSessions = await prisma.azureSession.count();
    const completedSessions = await prisma.azureSession.count({
      where: { status: "completed" },
    });

    const totalPracticals = await prisma.azurePractical.count();
    const completedPracticals = await prisma.azurePractical.count({
      where: { status: "completed" },
    });

    const azureCompletion = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const communicationSessions = profileId
      ? await prisma.communicationSession.count({ where: { profile_id: profileId } })
      : 0;

    const projects = await prisma.project.count();
    const inProgressProjects = await prisma.project.count({
      where: { status: "in_progress" },
    });

    return NextResponse.json({
      azure: {
        completion: azureCompletion,
        topicsCompleted: completedTopics,
        totalTopics,
        sessionsCompleted: completedSessions,
        totalSessions,
        practicalsCompleted: completedPracticals,
        totalPracticals,
      },
      communication: { totalSessions: communicationSessions },
      projects: { total: projects, inProgress: inProgressProjects },
    });
  } catch (error) {
    console.error("Career API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
