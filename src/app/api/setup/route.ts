import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { createClient } = await import("@libsql/client");
    
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!url || !authToken) {
      return NextResponse.json({ error: "Turso not configured" }, { status: 500 });
    }
    
    const client = createClient({ url, authToken });
    
    // Disable foreign keys and drop ALL tables
    await client.execute("PRAGMA foreign_keys = OFF");
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    const tableNames = tables.rows.map(r => r.name as string);
    for (const table of tableNames) {
      await client.execute(`DROP TABLE IF EXISTS "${table}"`);
    }
    await client.execute("PRAGMA foreign_keys = ON");
    
    // Create all tables fresh
    const createStatements = [
      `CREATE TABLE Profile (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT 'Mr. Khan', mission_start TEXT NOT NULL DEFAULT '2026-08-23', mission_end TEXT NOT NULL DEFAULT '2027-01-01', theme TEXT NOT NULL DEFAULT 'dark', baseline_azure INTEGER, baseline_arabic INTEGER, baseline_comm INTEGER, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE Goal (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, description TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (profile_id) REFERENCES Profile(id))`,
      `CREATE TABLE GoalModule (id TEXT PRIMARY KEY, goal_id TEXT NOT NULL, name TEXT NOT NULL, description TEXT, order_index INTEGER NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (goal_id) REFERENCES Goal(id))`,
      `CREATE TABLE GoalTopic (id TEXT PRIMARY KEY, goal_id TEXT NOT NULL, module_id TEXT, name TEXT NOT NULL, description TEXT, priority TEXT NOT NULL DEFAULT 'important', status TEXT NOT NULL DEFAULT 'not_started', completion_percentage REAL NOT NULL DEFAULT 0, mastery_percentage REAL NOT NULL DEFAULT 0, confidence INTEGER NOT NULL DEFAULT 0, notes TEXT, started_at DATETIME, completed_at DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (goal_id) REFERENCES Goal(id), FOREIGN KEY (module_id) REFERENCES GoalModule(id))`,
      `CREATE TABLE TopicProgress (id TEXT PRIMARY KEY, topic_id TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, completion_delta REAL NOT NULL DEFAULT 0, mastery_delta REAL NOT NULL DEFAULT 0, notes TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (topic_id) REFERENCES GoalTopic(id))`,
      `CREATE TABLE AzureSession (id TEXT PRIMARY KEY, session_number INTEGER NOT NULL, title TEXT NOT NULL, drive_link TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'not_started', completed_at DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE AzurePractical (id TEXT PRIMARY KEY, practical_number INTEGER NOT NULL, title TEXT NOT NULL, description TEXT, tasks TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'not_started', completed_at DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE LisanLecture (id TEXT PRIMARY KEY, lecture_number INTEGER NOT NULL, title TEXT NOT NULL, duration_seconds INTEGER, watched INTEGER NOT NULL DEFAULT 0, book INTEGER NOT NULL DEFAULT 0, notes INTEGER NOT NULL DEFAULT 0, examples INTEGER NOT NULL DEFAULT 0, practice INTEGER NOT NULL DEFAULT 0, mastery REAL NOT NULL DEFAULT 0, started_at DATETIME, completed_at DATETIME, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE DailyTask (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, date TEXT NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, is_must_do INTEGER NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (profile_id) REFERENCES Profile(id))`,
      `CREATE TABLE DailyPlan (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, date TEXT NOT NULL, focus_item TEXT, focus_type TEXT, focus_id TEXT, is_custom INTEGER NOT NULL DEFAULT 1, completed INTEGER NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE QuranReading (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, date TEXT NOT NULL, surah TEXT NOT NULL, ayah_from INTEGER, ayah_to INTEGER, pages INTEGER NOT NULL DEFAULT 1, duration_minutes INTEGER, reflection TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (profile_id) REFERENCES Profile(id))`,
      `CREATE TABLE QuranMemorization (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, date TEXT NOT NULL, surah TEXT NOT NULL, ayah_from INTEGER NOT NULL, ayah_to INTEGER NOT NULL, is_new INTEGER NOT NULL DEFAULT 1, confidence INTEGER NOT NULL, mistakes INTEGER NOT NULL DEFAULT 0, notes TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (profile_id) REFERENCES Profile(id))`,
      `CREATE TABLE TahajjudLog (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, date TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, rakah_count INTEGER, time TEXT, reflection TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (profile_id) REFERENCES Profile(id), UNIQUE(profile_id, date))`,
      `CREATE TABLE CommunicationSession (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, date TEXT NOT NULL, practice_type TEXT NOT NULL, duration_minutes INTEGER, topic TEXT, confidence_score INTEGER, clarity_score INTEGER, fluency_score INTEGER, notes TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (profile_id) REFERENCES Profile(id))`,
      `CREATE TABLE Project (id TEXT PRIMARY KEY, name TEXT NOT NULL, objective TEXT, status TEXT NOT NULL DEFAULT 'not_started', completion_pct REAL NOT NULL DEFAULT 0, notes TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE ProjectTask (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_id) REFERENCES Project(id))`,
      `CREATE TABLE Reminder (id TEXT PRIMARY KEY, text TEXT NOT NULL, source_type TEXT NOT NULL, reference TEXT NOT NULL, category TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE Note (id TEXT PRIMARY KEY, content TEXT NOT NULL, category TEXT, topic_id TEXT, lecture_id TEXT, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    ];
    
    for (const sql of createStatements) {
      await client.execute(sql);
    }
    
    // Seed profile
    await client.execute({
      sql: "INSERT INTO Profile (id, name, mission_start, mission_end) VALUES (?, ?, ?, ?)",
      args: ["default", "Mr. Khan", "2026-08-23", "2027-01-01"],
    });
    
    // Seed goals
    await client.execute({
      sql: "INSERT INTO Goal (id, profile_id, name, category, description) VALUES (?, ?, ?, ?, ?)",
      args: ["azure-goal", "default", "Azure Administration", "azure", "Become a solid Azure Administrator"],
    });
    await client.execute({
      sql: "INSERT INTO Goal (id, profile_id, name, category, description) VALUES (?, ?, ?, ?, ?)",
      args: ["arabic-goal", "default", "Qur'anic Arabic", "arabic", "Lisan-ul-Quran Level 1"],
    });
    
    // Seed reminders
    const reminders = [
      ["Allah is with those who are steadfast.", "Quran", "Qur'an 41:30", "istiqamah"],
      ["Verily, with hardship comes ease.", "Quran", "Qur'an 94:5-6", "sabr"],
      ["Indeed, Allah does not change the condition of a people until they change what is in themselves.", "Quran", "Qur'an 13:11", "self_change"],
      ["Our Lord, do not let our hearts deviate after You have guided us.", "Quran", "Qur'an 3:8", "dua"],
      ["Allah does not burden a soul beyond that it can bear.", "Quran", "Qur'an 2:286", "capacity"],
      ["The most beloved deeds to Allah are those that are most consistent, even if they are small.", "Hadith", "Sahih al-Bukhari 6464", "consistency"],
      ["Indeed, actions are but by intentions.", "Hadith", "Sahih al-Bukhari 1", "niyyah"],
      ["Ihsan is to worship Allah as though you see Him.", "Hadith", "Sahih Muslim 8", "ihsan"],
      ["Whoever has taqwa of Allah, He will make a way out for them.", "Quran", "Qur'an 65:2-3", "provision"],
      ["The strong person is the one who controls himself when angry.", "Hadith", "Sahih al-Bukhari 6114", "discipline"],
      ["The best among you are those who learn the Qur'an and teach it.", "Hadith", "Sahih al-Bukhari 5027", "knowledge"],
    ];
    for (const [text, sourceType, reference, category] of reminders) {
      await client.execute({
        sql: "INSERT INTO Reminder (id, text, source_type, reference, category) VALUES (?, ?, ?, ?, ?)",
        args: [crypto.randomUUID(), text, sourceType, reference, category],
      });
    }
    
    // Seed projects
    const projects = [
      ["Secure Azure Admin Lab", "Build a complete secure Azure lab environment"],
      ["Hub-Spoke Azure Network", "Design and implement a hub-and-spoke network topology"],
      ["Secure VM + VNet + NSG + Bastion", "Deploy secure VMs with NSG rules and Bastion host"],
      ["Storage + Private Endpoint + Key Vault", "Configure storage accounts with private endpoints"],
    ];
    for (const [name, objective] of projects) {
      await client.execute({
        sql: "INSERT INTO Project (id, name, objective, status) VALUES (?, ?, ?, ?)",
        args: [crypto.randomUUID(), name, objective, "not_started"],
      });
    }
    
    // Seed Azure sessions (44 sessions)
    const { AZURE_SESSIONS } = await import("@/lib/data/azure-modules");
    for (const s of AZURE_SESSIONS) {
      await client.execute({
        sql: "INSERT INTO AzureSession (id, session_number, title, drive_link, status) VALUES (?, ?, ?, ?, ?)",
        args: [crypto.randomUUID(), s.session_number, s.title, s.drive_link, "not_started"],
      });
    }
    
    // Seed Azure modules and topics
    const { AZURE_MODULES, TOPIC_PRIORITIES } = await import("@/lib/data/azure-modules");
    let moduleIndex = 0;
    for (const mod of AZURE_MODULES) {
      const moduleId = `azure-mod-${moduleIndex}`;
      await client.execute({
        sql: "INSERT INTO GoalModule (id, goal_id, name, order_index) VALUES (?, ?, ?, ?)",
        args: [moduleId, "azure-goal", mod.name, mod.order],
      });
      for (const topicName of mod.topics) {
        const priority = TOPIC_PRIORITIES[topicName] || "supporting";
        await client.execute({
          sql: "INSERT INTO GoalTopic (id, goal_id, module_id, name, priority, status, completion_percentage, mastery_percentage, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          args: [crypto.randomUUID(), "azure-goal", moduleId, topicName, priority, "not_started", 0, 0, 0],
        });
      }
      moduleIndex++;
    }
    
    // Seed Arabic lectures
    const { LISAN_LECTURES } = await import("@/lib/data/arabic-lectures");
    for (const lecture of LISAN_LECTURES) {
      await client.execute({
        sql: "INSERT INTO LisanLecture (id, lecture_number, title, duration_seconds, watched, mastery) VALUES (?, ?, ?, ?, ?, ?)",
        args: [crypto.randomUUID(), lecture.lecture_number, lecture.title, lecture.duration_seconds, 0, 0],
      });
    }
    
    // Seed Arabic module and topics
    const arabicModuleId = "arabic-mod-0";
    await client.execute({
      sql: "INSERT INTO GoalModule (id, goal_id, name, order_index) VALUES (?, ?, ?, ?)",
      args: [arabicModuleId, "arabic-goal", "Lisan-ul-Quran Level 1", 1],
    });
    for (const lecture of LISAN_LECTURES) {
      await client.execute({
        sql: "INSERT INTO GoalTopic (id, goal_id, module_id, name, status, completion_percentage, mastery_percentage, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [crypto.randomUUID(), "arabic-goal", arabicModuleId, `Lecture ${lecture.lecture_number}: ${lecture.title}`, "not_started", 0, 0, 0],
      });
    }
    
    // Seed practicals
    const practicals = [
      [1, "Create a Resource Group", "Practice creating and managing Azure Resource Groups", '["Create Resource Group","Add tags","Apply RBAC","Verify access"]'],
      [2, "Build VNet + Subnets", "Design and implement virtual networks with subnets", '["Create VNet","Add subnets","Configure NSG rules","Test connectivity"]'],
      [3, "Deploy Secure VM", "Deploy VMs with NSG, Bastion, and private access", '["Create VM","Configure NSG","Setup Bastion","Test private access"]'],
      [4, "Storage + Key Vault", "Configure storage accounts with private endpoints and Key Vault", '["Create Storage Account","Add Private Endpoint","Setup Key Vault","Configure Managed Identity"]'],
    ];
    for (const [num, title, desc, tasks] of practicals) {
      await client.execute({
        sql: "INSERT INTO AzurePractical (id, practical_number, title, description, tasks, status) VALUES (?, ?, ?, ?, ?, ?)",
        args: [crypto.randomUUID(), num, title, desc, tasks, "not_started"],
      });
    }
    
    return NextResponse.json({ ok: true, message: "Full reset and seed complete" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
