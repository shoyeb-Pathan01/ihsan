import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { AZURE_MODULES, AZURE_SESSIONS, TOPIC_PRIORITIES } from "../src/lib/data/azure-modules";
import { LISAN_LECTURES } from "../src/lib/data/arabic-lectures";
import { SEED_REMINDERS } from "../src/lib/data/reminders";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding IHSAN database...");

  // Create profile
  const profile = await prisma.profile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Mr. Khan",
      mission_start: "2026-08-23",
      mission_end: "2026-10-23",
    },
  });
  console.log("Profile created");

  // Create goals
  const azureGoal = await prisma.goal.create({
    data: { profile_id: profile.id, name: "Azure Administration", category: "azure", description: "Become a solid Azure Administrator" },
  });
  const arabicGoal = await prisma.goal.create({
    data: { profile_id: profile.id, name: "Qur'anic Arabic", category: "arabic", description: "Lisan-ul-Quran Level 1 - Direct Qur'anic comprehension" },
  });
  const readingGoal = await prisma.goal.create({
    data: { profile_id: profile.id, name: "Qur'an Reading", category: "reading", description: "Daily Qur'an reading" },
  });
  const memorizationGoal = await prisma.goal.create({
    data: { profile_id: profile.id, name: "Qur'an Memorization", category: "memorization", description: "Memorize selected surahs and ayat" },
  });
  const tahajjudGoal = await prisma.goal.create({
    data: { profile_id: profile.id, name: "Tahajjud", category: "tahajjud", description: "Consistent night prayer" },
  });
  const communicationGoal = await prisma.goal.create({
    data: { profile_id: profile.id, name: "Communication Practice", category: "communication", description: "Professional and technical communication" },
  });
  console.log("Goals created");

  // Create Azure modules and topics
  for (const mod of AZURE_MODULES) {
    const module = await prisma.goalModule.create({
      data: {
        goal_id: azureGoal.id,
        name: mod.name,
        order_index: mod.order,
      },
    });

    for (const topicName of mod.topics) {
      const priority = TOPIC_PRIORITIES[topicName] || "supporting";
      await prisma.goalTopic.create({
        data: {
          goal_id: azureGoal.id,
          module_id: module.id,
          name: topicName,
          priority,
          status: "not_started",
          completion_percentage: 0,
          mastery_percentage: 0,
        },
      });
    }
  }
  console.log("Azure modules and topics created");

  // Create Azure sessions
  for (const session of AZURE_SESSIONS) {
    await prisma.azureSession.create({
      data: {
        session_number: session.session_number,
        title: session.title,
        drive_link: session.drive_link,
      },
    });
  }
  console.log("Azure sessions created");

  // Create Arabic lectures
  for (const lecture of LISAN_LECTURES) {
    const isWatched = lecture.lecture_number <= 15;
    const startedAt = isWatched ? new Date("2026-08-23") : null;

    await prisma.lisanLecture.create({
      data: {
        lecture_number: lecture.lecture_number,
        title: lecture.title,
        duration_seconds: lecture.duration_seconds,
        watched: isWatched,
        lecture_progress: isWatched ? 25 : 0,
        understanding: 0,
        confidence: 0,
        mastery: 0,
        started_at: startedAt,
      },
    });
  }
  console.log("Arabic lectures created (1-15 watched)");

  // Create Lisan-ul-Quran as an Arabic goal topic entry for tracking
  const lisanModule = await prisma.goalModule.create({
    data: {
      goal_id: arabicGoal.id,
      name: "Lisan-ul-Quran Level 1",
      order_index: 1,
    },
  });

  for (const lecture of LISAN_LECTURES) {
    const isWatched = lecture.lecture_number <= 15;
    await prisma.goalTopic.create({
      data: {
        goal_id: arabicGoal.id,
        module_id: lisanModule.id,
        name: `Lecture ${lecture.lecture_number}: ${lecture.title}`,
        status: isWatched ? "learning" : "not_started",
        completion_percentage: isWatched ? 25 : 0,
        mastery_percentage: 0,
      },
    });
  }
  console.log("Arabic goal topics created");

  // Create reminders
  for (const reminder of SEED_REMINDERS) {
    await prisma.reminder.create({
      data: {
        text_paraphrase: reminder.text_paraphrase,
        source_type: reminder.source_type,
        reference: reminder.reference,
        authenticity_note: reminder.authenticity_note,
        category: reminder.category,
        enabled: true,
      },
    });
  }
  console.log("Reminders seeded");

  // Create projects
  const projects = [
    { name: "Secure Azure Admin Lab", objective: "Build a complete secure Azure lab environment with Entra ID, RBAC, NSGs, and monitoring" },
    { name: "Hub-Spoke Azure Network", objective: "Design and implement a hub-and-spoke network topology with VPN, firewall, and peering" },
    { name: "Secure VM + VNet + NSG + Bastion/Private Access", objective: "Deploy secure VMs with NSG rules, Bastion host, and private endpoints" },
    { name: "Storage + Private Endpoint + Key Vault", objective: "Configure storage accounts with private endpoints, Key Vault, and managed identities" },
  ];

  for (const project of projects) {
    await prisma.project.create({
      data: { name: project.name, objective: project.objective },
    });
  }
  console.log("Projects seeded");

  // Create streaks
  const streakCategories = ["overall", "azure", "arabic", "reading", "memorization", "tahajjud", "communication"];
  for (const cat of streakCategories) {
    await prisma.streak.create({
      data: {
        profile_id: profile.id,
        category: cat,
        current_streak: 0,
        best_streak: 0,
      },
    });
  }
  console.log("Streaks initialized");

  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
