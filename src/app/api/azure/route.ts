import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const azureGoal = await prisma.goal.findFirst({
      where: { category: "azure" },
      include: {
        modules: {
          include: {
            topics: true,
          },
          orderBy: { order_index: "asc" },
        },
      },
    });

    if (!azureGoal) {
      return Response.json(
        { error: "Azure goal not found" },
        { status: 404 },
      );
    }

    const allTopics = azureGoal.modules.flatMap((m) => m.topics);

    const totalTopics = allTopics.length;

    const overallCompletion =
      totalTopics > 0
        ? Math.round(
            allTopics.reduce((s, t) => s + t.completion_percentage, 0) /
              totalTopics,
          )
        : 0;

    const overallMastery =
      totalTopics > 0
        ? Math.round(
            allTopics.reduce((s, t) => s + t.mastery_percentage, 0) /
              totalTopics,
          )
        : 0;

    const completedTopics = allTopics.filter(
      (t) => t.status !== "not_started",
    ).length;

    const masteredTopics = allTopics.filter(
      (t) => t.mastery_percentage >= 80,
    ).length;

    return Response.json({
      modules: azureGoal.modules.map((m) => ({
        id: m.id,
        name: m.name,
        order: m.order_index,
        topics: m.topics.map((t) => ({
          id: t.id,
          name: t.name,
          priority: t.priority,
          status: t.status,
          completion_percentage: t.completion_percentage,
          mastery_percentage: t.mastery_percentage,
          confidence: t.confidence,
        })),
      })),
      overallCompletion,
      overallMastery,
      totalTopics,
      completedTopics,
      masteredTopics,
    });
  } catch (error) {
    console.error("Azure API error:", error);
    return Response.json(
      { error: "Failed to fetch azure data" },
      { status: 500 },
    );
  }
}
