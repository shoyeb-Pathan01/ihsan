import { NextResponse } from "next/server";
import { AZURE_MODULES, AZURE_SESSIONS, TOPIC_PRIORITIES } from "@/lib/data/azure-modules";
import { LISAN_LECTURES } from "@/lib/data/arabic-lectures";
import { SEED_REMINDERS } from "@/lib/data/reminders";

export async function POST() {
  try {
    const { createClient } = await import("@libsql/client");

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      return NextResponse.json({ error: "Turso not configured" }, { status: 500 });
    }

    const client = createClient({ url, authToken });

    const stmts: { sql: string; args?: (string | number | null)[] }[] = [];

    // Drop ALL tables
    stmts.push({ sql: "PRAGMA foreign_keys = OFF" });

    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    for (const row of tables.rows) {
      stmts.push({ sql: `DROP TABLE IF EXISTS "${row.name}"` });
    }
    stmts.push({ sql: "PRAGMA foreign_keys = ON" });

    // Create all tables — matches schema.prisma exactly
    stmts.push({ sql: `CREATE TABLE "Profile" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL DEFAULT 'Mr. Khan', "mission_start" TEXT NOT NULL DEFAULT '2026-08-23', "mission_end" TEXT NOT NULL DEFAULT '2027-01-01', "theme" TEXT NOT NULL DEFAULT 'dark', "baseline_azure" INTEGER, "baseline_arabic" INTEGER, "baseline_comm" INTEGER, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "Goal" ("id" TEXT PRIMARY KEY, "profile_id" TEXT NOT NULL, "name" TEXT NOT NULL, "category" TEXT NOT NULL, "description" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "GoalModule" ("id" TEXT PRIMARY KEY, "goal_id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "order_index" INTEGER NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "GoalTopic" ("id" TEXT PRIMARY KEY, "goal_id" TEXT NOT NULL, "module_id" TEXT, "name" TEXT NOT NULL, "description" TEXT, "priority" TEXT NOT NULL DEFAULT 'important', "status" TEXT NOT NULL DEFAULT 'not_started', "completion_percentage" REAL NOT NULL DEFAULT 0, "mastery_percentage" REAL NOT NULL DEFAULT 0, "confidence" INTEGER NOT NULL DEFAULT 0, "notes" TEXT, "started_at" DATETIME, "completed_at" DATETIME, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "TopicProgress" ("id" TEXT PRIMARY KEY, "topic_id" TEXT NOT NULL, "date" TEXT NOT NULL, "status" TEXT NOT NULL, "completion_delta" REAL NOT NULL DEFAULT 0, "mastery_delta" REAL NOT NULL DEFAULT 0, "notes" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("topic_id", "date"))` });
    stmts.push({ sql: `CREATE TABLE "AzureSession" ("id" TEXT PRIMARY KEY, "session_number" INTEGER NOT NULL, "title" TEXT NOT NULL, "drive_link" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'not_started', "completed_at" DATETIME, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("session_number"))` });
    stmts.push({ sql: `CREATE TABLE "AzurePractical" ("id" TEXT PRIMARY KEY, "practical_number" INTEGER NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "tasks" TEXT NOT NULL DEFAULT '[]', "status" TEXT NOT NULL DEFAULT 'not_started', "completed_at" DATETIME, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("practical_number"))` });
    stmts.push({ sql: `CREATE TABLE "LisanLecture" ("id" TEXT PRIMARY KEY, "lecture_number" INTEGER NOT NULL, "title" TEXT NOT NULL, "youtube_url" TEXT, "duration_seconds" INTEGER, "status" TEXT NOT NULL DEFAULT 'not_started', "watched" INTEGER NOT NULL DEFAULT 0, "book" INTEGER NOT NULL DEFAULT 0, "lecture_notes" INTEGER NOT NULL DEFAULT 0, "quranic_examples" INTEGER NOT NULL DEFAULT 0, "practice_status" TEXT NOT NULL DEFAULT 'not_started', "practice_notes_ok" INTEGER NOT NULL DEFAULT 0, "practice_examples_ok" INTEGER NOT NULL DEFAULT 0, "practice_exercises_ok" INTEGER NOT NULL DEFAULT 0, "practice_explain_ok" INTEGER NOT NULL DEFAULT 0, "revision_count" INTEGER NOT NULL DEFAULT 0, "last_revision_date" TEXT, "next_revision_date" TEXT, "completion_percentage" REAL NOT NULL DEFAULT 0, "mastery_percentage" REAL NOT NULL DEFAULT 0, "quiz_score" INTEGER, "understanding" INTEGER, "confidence" INTEGER, "started_at" DATETIME, "completed_at" DATETIME, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("lecture_number"))` });
    stmts.push({ sql: `CREATE TABLE "ArabicPractice" ("id" TEXT PRIMARY KEY, "lecture_id" TEXT NOT NULL, "exercise_number" INTEGER NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "exercise_type" TEXT NOT NULL DEFAULT 'identify', "status" TEXT NOT NULL DEFAULT 'not_started', "user_answer" TEXT, "completed_at" DATETIME, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "ArabicRevision" ("id" TEXT PRIMARY KEY, "lecture_id" TEXT NOT NULL, "date" TEXT NOT NULL, "understanding" INTEGER NOT NULL, "confidence" INTEGER NOT NULL, "struggles" TEXT, "next_revision_date" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "ArabicNote" ("id" TEXT PRIMARY KEY, "lecture_id" TEXT, "topic" TEXT, "arabic_term" TEXT, "meaning" TEXT, "examples" TEXT, "my_understanding" TEXT, "category" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "ArabicExample" ("id" TEXT PRIMARY KEY, "lecture_id" TEXT NOT NULL, "arabic_text" TEXT NOT NULL, "translation" TEXT, "my_analysis" TEXT, "term_identified" TEXT, "meaning" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "ArabicExplainIt" ("id" TEXT PRIMARY KEY, "lecture_id" TEXT NOT NULL, "prompt" TEXT NOT NULL, "understanding" INTEGER, "confidence" INTEGER, "notes" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "DailyTask" ("id" TEXT PRIMARY KEY, "profile_id" TEXT NOT NULL, "date" TEXT NOT NULL, "title" TEXT NOT NULL, "category" TEXT NOT NULL, "completed" INTEGER NOT NULL DEFAULT 0, "is_must_do" INTEGER NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "DailyPlan" ("id" TEXT PRIMARY KEY, "profile_id" TEXT NOT NULL, "date" TEXT NOT NULL, "focus_item" TEXT, "focus_type" TEXT, "focus_id" TEXT, "is_custom" INTEGER NOT NULL DEFAULT 1, "completed" INTEGER NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "QuranReading" ("id" TEXT PRIMARY KEY, "profile_id" TEXT NOT NULL, "date" TEXT NOT NULL, "surah" TEXT NOT NULL, "ayah_from" INTEGER, "ayah_to" INTEGER, "pages" INTEGER NOT NULL DEFAULT 1, "duration_minutes" INTEGER, "reflection" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "QuranMemorization" ("id" TEXT PRIMARY KEY, "profile_id" TEXT NOT NULL, "date" TEXT NOT NULL, "surah" TEXT NOT NULL, "ayah_from" INTEGER NOT NULL, "ayah_to" INTEGER NOT NULL, "is_new" INTEGER NOT NULL DEFAULT 1, "confidence" INTEGER NOT NULL, "mistakes" INTEGER NOT NULL DEFAULT 0, "notes" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "TahajjudLog" ("id" TEXT PRIMARY KEY, "profile_id" TEXT NOT NULL, "date" TEXT NOT NULL, "completed" INTEGER NOT NULL DEFAULT 0, "rakah_count" INTEGER, "time" TEXT, "reflection" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("profile_id", "date"))` });
    stmts.push({ sql: `CREATE TABLE "CommunicationSession" ("id" TEXT PRIMARY KEY, "profile_id" TEXT NOT NULL, "date" TEXT NOT NULL, "practice_type" TEXT NOT NULL, "duration_minutes" INTEGER, "topic" TEXT, "confidence_score" INTEGER, "clarity_score" INTEGER, "fluency_score" INTEGER, "notes" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "Project" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "objective" TEXT, "status" TEXT NOT NULL DEFAULT 'not_started', "completion_pct" REAL NOT NULL DEFAULT 0, "notes" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "ProjectTask" ("id" TEXT PRIMARY KEY, "project_id" TEXT NOT NULL, "title" TEXT NOT NULL, "completed" INTEGER NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "Reminder" ("id" TEXT PRIMARY KEY, "text" TEXT NOT NULL, "source_type" TEXT NOT NULL, "reference" TEXT NOT NULL, "category" TEXT NOT NULL, "enabled" INTEGER NOT NULL DEFAULT 1, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });
    stmts.push({ sql: `CREATE TABLE "Note" ("id" TEXT PRIMARY KEY, "content" TEXT NOT NULL, "category" TEXT, "topic_id" TEXT, "lecture_id" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)` });

    // Create indexes
    stmts.push({ sql: `CREATE INDEX "GoalTopic_goal_id_idx" ON "GoalTopic"("goal_id")` });
    stmts.push({ sql: `CREATE INDEX "GoalTopic_module_id_idx" ON "GoalTopic"("module_id")` });
    stmts.push({ sql: `CREATE INDEX "GoalTopic_status_idx" ON "GoalTopic"("status")` });
    stmts.push({ sql: `CREATE INDEX "TopicProgress_topic_id_idx" ON "TopicProgress"("topic_id")` });
    stmts.push({ sql: `CREATE INDEX "DailyTask_profile_id_date_idx" ON "DailyTask"("profile_id", "date")` });
    stmts.push({ sql: `CREATE INDEX "DailyPlan_profile_id_date_idx" ON "DailyPlan"("profile_id", "date")` });
    stmts.push({ sql: `CREATE INDEX "QuranReading_profile_id_date_idx" ON "QuranReading"("profile_id", "date")` });
    stmts.push({ sql: `CREATE INDEX "QuranMemorization_profile_id_date_idx" ON "QuranMemorization"("profile_id", "date")` });
    stmts.push({ sql: `CREATE INDEX "CommunicationSession_profile_id_date_idx" ON "CommunicationSession"("profile_id", "date")` });
    stmts.push({ sql: `CREATE INDEX "LisanLecture_status_idx" ON "LisanLecture"("status")` });
    stmts.push({ sql: `CREATE INDEX "LisanLecture_next_revision_date_idx" ON "LisanLecture"("next_revision_date")` });

    // Seed profile
    stmts.push({ sql: `INSERT INTO "Profile" ("id","name","mission_start","mission_end") VALUES (?,?,?,?)`, args: ["default", "Mr. Khan", "2026-08-23", "2027-01-01"] });

    // Seed goals
    stmts.push({ sql: `INSERT INTO "Goal" ("id","profile_id","name","category","description") VALUES (?,?,?,?,?)`, args: ["azure-goal", "default", "Azure Administration", "azure", "Become a solid Azure Administrator"] });
    stmts.push({ sql: `INSERT INTO "Goal" ("id","profile_id","name","category","description") VALUES (?,?,?,?,?)`, args: ["arabic-goal", "default", "Qur'anic Arabic", "arabic", "Lisan-ul-Quran Level 1 - Direct Qur'anic comprehension"] });

    // Seed Azure modules & topics
    let modIdx = 0;
    for (const mod of AZURE_MODULES) {
      const moduleId = `az-mod-${modIdx}`;
      stmts.push({ sql: `INSERT INTO "GoalModule" ("id","goal_id","name","order_index") VALUES (?,?,?,?)`, args: [moduleId, "azure-goal", mod.name, mod.order] });
      for (const topicName of mod.topics) {
        const priority = TOPIC_PRIORITIES[topicName] || "supporting";
        stmts.push({ sql: `INSERT INTO "GoalTopic" ("id","goal_id","module_id","name","priority","status","completion_percentage","mastery_percentage","confidence") VALUES (?,?,?,?,?,?,?,?,?)`, args: [`az-top-${modIdx}-${Math.random().toString(36).slice(2,8)}`, "azure-goal", moduleId, topicName, priority, "not_started", 0, 0, 0] });
      }
      modIdx++;
    }

    // Seed Azure sessions
    for (const s of AZURE_SESSIONS) {
      stmts.push({ sql: `INSERT INTO "AzureSession" ("id","session_number","title","drive_link","status") VALUES (?,?,?,?,?)`, args: [`az-sess-${s.session_number}`, s.session_number, s.title, s.drive_link, "not_started"] });
    }

    // Seed Azure practicals
    const practicals: [number, string, string, string][] = [
      [1, "Create a Resource Group", "Practice creating and managing Azure Resource Groups", '["Create Resource Group","Add tags","Apply RBAC","Verify access"]'],
      [2, "Build VNet + Subnets", "Design and implement virtual networks with subnets", '["Create VNet","Add subnets","Configure NSG rules","Test connectivity"]'],
      [3, "Deploy Secure VM", "Deploy VMs with NSG, Bastion, and private access", '["Create VM","Configure NSG","Setup Bastion","Test private access"]'],
      [4, "Storage + Key Vault", "Configure storage accounts with private endpoints and Key Vault", '["Create Storage Account","Add Private Endpoint","Setup Key Vault","Configure Managed Identity"]'],
    ];
    for (const [num, title, desc, tasks] of practicals) {
      stmts.push({ sql: `INSERT INTO "AzurePractical" ("id","practical_number","title","description","tasks","status") VALUES (?,?,?,?,?,?)`, args: [`az-prac-${num}`, num, title, desc, tasks, "not_started"] });
    }

    // Seed Arabic lectures + practices
    for (const lec of LISAN_LECTURES) {
      const id = `lec_${lec.lecture_number}`;
      stmts.push({ sql: `INSERT INTO "LisanLecture" ("id","lecture_number","title","youtube_url") VALUES (?,?,?,?)`, args: [id, lec.lecture_number, lec.title, lec.youtube_url] });
      const types = ["identify", "classify", "explain"];
      for (let i = 1; i <= 3; i++) {
        stmts.push({ sql: `INSERT INTO "ArabicPractice" ("id","lecture_id","exercise_number","title","description","exercise_type") VALUES (?,?,?,?,?,?)`, args: [`prac_${lec.lecture_number}_${i}`, id, i, `Exercise ${i}: ${types[i-1].charAt(0).toUpperCase()+types[i-1].slice(1)} task`, `Practice ${types[i-1]} exercise for Lecture ${lec.lecture_number}`, types[i-1]] });
      }
    }

    // Seed Arabic module & topics
    const arabicModId = "arabic-mod-0";
    stmts.push({ sql: `INSERT INTO "GoalModule" ("id","goal_id","name","order_index") VALUES (?,?,?,?)`, args: [arabicModId, "arabic-goal", "Lisan-ul-Quran Level 1", 1] });
    for (const lec of LISAN_LECTURES) {
      stmts.push({ sql: `INSERT INTO "GoalTopic" ("id","goal_id","module_id","name","status","completion_percentage","mastery_percentage","confidence") VALUES (?,?,?,?,?,?,?,?)`, args: [`ar-top-${lec.lecture_number}`, "arabic-goal", arabicModId, `Lecture ${lec.lecture_number}: ${lec.title}`, "not_started", 0, 0, 0] });
    }

    // Seed reminders — from reminders.ts (single source of truth)
    for (const r of SEED_REMINDERS) {
      stmts.push({ sql: `INSERT INTO "Reminder" ("id","text","source_type","reference","category") VALUES (?,?,?,?,?)`, args: [`rem-${Math.random().toString(36).slice(2,8)}`, r.text_paraphrase, r.source_type, r.reference, r.category] });
    }

    // Seed projects
    const projects: [string, string][] = [
      ["Secure Azure Admin Lab", "Build a complete secure Azure lab environment with Entra ID, RBAC, NSGs, and monitoring"],
      ["Hub-Spoke Azure Network", "Design and implement a hub-and-spoke network topology with VPN, firewall, and peering"],
      ["Secure VM + VNet + NSG + Bastion/Private Access", "Deploy secure VMs with NSG rules, Bastion host, and private endpoints"],
      ["Storage + Private Endpoint + Key Vault", "Configure storage accounts with private endpoints, Key Vault, and managed identities"],
    ];
    for (const [name, obj] of projects) {
      stmts.push({ sql: `INSERT INTO "Project" ("id","name","objective","status") VALUES (?,?,?,?)`, args: [`proj-${Math.random().toString(36).slice(2,8)}`, name, obj, "not_started"] });
    }

    // Execute everything in a single batch — avoids 300+ round trips
    await client.batch(stmts, "write");

    return NextResponse.json({ success: true, message: "Full reset and seed complete" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
