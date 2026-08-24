import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { AZURE_MODULES, AZURE_SESSIONS, TOPIC_PRIORITIES } from "../src/lib/data/azure-modules";
import { LISAN_LECTURES } from "../src/lib/data/arabic-lectures";
import { SEED_REMINDERS } from "../src/lib/data/reminders";

function createPrismaClient() {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log("Seeding IHSAN database...");

  // Create profile - start from zero
  const profile = await prisma.profile.create({
    data: {
      id: "default",
      name: "Mr. Khan",
      mission_start: "2026-08-23",
      mission_end: "2027-01-01",
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
  console.log("Goals created");

  // Create Azure modules and topics - all not started
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

  // Create Azure sessions - all not started
  for (const session of AZURE_SESSIONS) {
    await prisma.azureSession.create({
      data: {
        session_number: session.session_number,
        title: session.title,
        drive_link: session.drive_link,
        status: "not_started",
      },
    });
  }
  console.log("Azure sessions created");

  // Create Azure practicals
  const practicals = [
    { practical_number: 1, title: "Create a Resource Group", description: "Practice creating and managing Azure Resource Groups", tasks: JSON.stringify(["Create Resource Group", "Add tags", "Apply RBAC", "Verify access"]) },
    { practical_number: 2, title: "Build VNet + Subnets", description: "Design and implement virtual networks with subnets", tasks: JSON.stringify(["Create VNet", "Add subnets", "Configure NSG rules", "Test connectivity"]) },
    { practical_number: 3, title: "Deploy Secure VM", description: "Deploy VMs with NSG, Bastion, and private access", tasks: JSON.stringify(["Create VM", "Configure NSG", "Setup Bastion", "Test private access"]) },
    { practical_number: 4, title: "Storage + Key Vault", description: "Configure storage accounts with private endpoints and Key Vault", tasks: JSON.stringify(["Create Storage Account", "Add Private Endpoint", "Setup Key Vault", "Configure Managed Identity"]) },
  ];

  for (const practical of practicals) {
    await prisma.azurePractical.create({
      data: {
        practical_number: practical.practical_number,
        title: practical.title,
        description: practical.description,
        tasks: practical.tasks,
        status: "not_started",
      },
    });
  }
  console.log("Azure practicals created");

  // Create Arabic lectures - all not started (full learning pipeline)
  for (const lecture of LISAN_LECTURES) {
    const lisanLecture = await prisma.lisanLecture.create({
      data: {
        lecture_number: lecture.lecture_number,
        title: lecture.title,
        duration_seconds: lecture.duration_seconds,
        status: "not_started",
        // Content pipeline - all false
        watched: false,
        book: false,
        lecture_notes: false,
        quranic_examples: false,
        // Practice - not started
        practice_status: "not_started",
        practice_notes_ok: false,
        practice_examples_ok: false,
        practice_exercises_ok: false,
        practice_explain_ok: false,
        // Revision - zero
        revision_count: 0,
        // Mastery - zero
        completion_percentage: 0,
        mastery_percentage: 0,
      },
    });

    // Create 3 sample practice exercises per lecture
    const exerciseTypes = ["identify", "classify", "explain"];
    for (let i = 0; i < 3; i++) {
      await prisma.arabicPractice.create({
        data: {
          lecture_id: lisanLecture.id,
          exercise_number: i + 1,
          title: `Exercise ${i + 1}: ${exerciseTypes[i].charAt(0).toUpperCase() + exerciseTypes[i].slice(1)} task`,
          description: `Practice ${exerciseTypes[i]} exercise for Lecture ${lecture.lecture_number}`,
          exercise_type: exerciseTypes[i],
          status: "not_started",
        },
      });
    }
  }
  console.log("Arabic lectures created with practice exercises (all not started)");

  // Create Arabic goal module and topics
  const lisanModule = await prisma.goalModule.create({
    data: {
      goal_id: arabicGoal.id,
      name: "Lisan-ul-Quran Level 1",
      order_index: 1,
    },
  });

  for (const lecture of LISAN_LECTURES) {
    await prisma.goalTopic.create({
      data: {
        goal_id: arabicGoal.id,
        module_id: lisanModule.id,
        name: `Lecture ${lecture.lecture_number}: ${lecture.title}`,
        status: "not_started",
        completion_percentage: 0,
        mastery_percentage: 0,
      },
    });
  }
  console.log("Arabic goal topics created");

  // Create reminders
  for (const reminder of SEED_REMINDERS) {
    await prisma.reminder.create({
      data: {
        text: reminder.text_paraphrase,
        source_type: reminder.source_type,
        reference: reminder.reference,
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
      data: { name: project.name, objective: project.objective, status: "not_started" },
    });
  }
  console.log("Projects seeded");

  console.log("\nSeeding complete! All progress starts from zero.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
