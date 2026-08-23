import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: "default" },
    });

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const baseline = await prisma.baselineSnapshot.findFirst({
      where: { profile_id: "default" },
      orderBy: { created_at: "desc" },
    });

    return Response.json({
      settings: {
        name: profile.name,
        mission_start: profile.mission_start,
        mission_end: profile.mission_end,
        azure_weight: profile.azure_weight,
        arabic_weight: profile.arabic_weight,
        reading_weight: profile.reading_weight,
        memorization_weight: profile.memorization_weight,
        tahajjud_weight: profile.tahajjud_weight,
        communication_weight: profile.communication_weight,
        daily_target: profile.daily_target,
        theme: profile.theme,
      },
      baseline: baseline
        ? {
            azure_knowledge: baseline.azure_knowledge,
            arabic_knowledge: baseline.arabic_knowledge,
            communication_confidence: baseline.communication_confidence,
          }
        : null,
    });
  } catch (error) {
    console.error("Settings API error:", error);
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings, baseline } = body;

    if (settings) {
      await prisma.profile.update({
        where: { id: "default" },
        data: {
          name: settings.name,
          mission_start: settings.mission_start,
          mission_end: settings.mission_end,
          azure_weight: settings.azure_weight,
          arabic_weight: settings.arabic_weight,
          reading_weight: settings.reading_weight,
          memorization_weight: settings.memorization_weight,
          tahajjud_weight: settings.tahajjud_weight,
          communication_weight: settings.communication_weight,
          daily_target: settings.daily_target,
          theme: settings.theme,
        },
      });
    }

    if (baseline) {
      await prisma.baselineSnapshot.create({
        data: {
          profile_id: "default",
          azure_knowledge: baseline.azure_knowledge,
          arabic_knowledge: baseline.arabic_knowledge,
          communication_confidence: baseline.communication_confidence,
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Settings API error:", error);
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const profileId = "default";

    await prisma.$transaction([
      prisma.dailyTask.deleteMany({ where: { profile_id: profileId } }),
      prisma.dailyLog.deleteMany({ where: { profile_id: profileId } }),
      prisma.streak.deleteMany({ where: { profile_id: profileId } }),
      prisma.xPTransaction.deleteMany({ where: { profile_id: profileId } }),
      prisma.userBadge.deleteMany({ where: { profile_id: profileId } }),
      prisma.weeklyReview.deleteMany({ where: { profile_id: profileId } }),
      prisma.baselineSnapshot.deleteMany({ where: { profile_id: profileId } }),
      prisma.quranReading.deleteMany({ where: { profile_id: profileId } }),
      prisma.quranMemorization.deleteMany({ where: { profile_id: profileId } }),
      prisma.tahajjudLog.deleteMany({ where: { profile_id: profileId } }),
      prisma.communicationLog.deleteMany({ where: { profile_id: profileId } }),
      prisma.topicProgress.deleteMany({
        where: { topic: { goal: { profile_id: profileId } } },
      }),
      prisma.goalTopic.updateMany({
        where: { goal: { profile_id: profileId } },
        data: {
          completion_percentage: 0,
          mastery_percentage: 0,
          confidence: 0,
          status: "not_started",
          lab_completed: false,
          revision_count: 0,
          last_revised: null,
          next_revision: null,
          started_at: null,
          completed_at: null,
          xp_earned: 0,
          proof_of_work: null,
          notes: null,
        },
      }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Settings DELETE error:", error);
    return Response.json(
      { error: "Failed to reset progress" },
      { status: 500 },
    );
  }
}
