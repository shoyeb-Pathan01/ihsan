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
    for (const row of tables.rows) {
      await client.execute(`DROP TABLE IF EXISTS "${row.name}"`);
    }
    await client.execute("PRAGMA foreign_keys = ON");

    // Create all tables
    await client.execute(`CREATE TABLE IF NOT EXISTS "Profile" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL DEFAULT 'Mr. Khan',
      "mission_start" TEXT NOT NULL DEFAULT '2026-08-23',
      "mission_end" TEXT NOT NULL DEFAULT '2027-01-01',
      "theme" TEXT NOT NULL DEFAULT 'dark',
      "baseline_azure" INTEGER,
      "baseline_arabic" INTEGER,
      "baseline_comm" INTEGER,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "Goal" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "profile_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "description" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "GoalModule" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "goal_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "order_index" INTEGER NOT NULL DEFAULT 0,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "GoalTopic" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "goal_id" TEXT NOT NULL,
      "module_id" TEXT,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "priority" TEXT NOT NULL DEFAULT 'important',
      "status" TEXT NOT NULL DEFAULT 'not_started',
      "completion_percentage" REAL NOT NULL DEFAULT 0,
      "mastery_percentage" REAL NOT NULL DEFAULT 0,
      "confidence" INTEGER NOT NULL DEFAULT 0,
      "notes" TEXT,
      "started_at" DATETIME,
      "completed_at" DATETIME,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "TopicProgress" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "topic_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "completion_delta" REAL NOT NULL DEFAULT 0,
      "mastery_delta" REAL NOT NULL DEFAULT 0,
      "notes" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "AzureSession" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "session_number" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "drive_link" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'not_started',
      "completed_at" DATETIME,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "AzurePractical" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "practical_number" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "tasks" TEXT NOT NULL DEFAULT '[]',
      "status" TEXT NOT NULL DEFAULT 'not_started',
      "completed_at" DATETIME,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "LisanLecture" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "lecture_number" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "duration_seconds" INTEGER,
      "status" TEXT NOT NULL DEFAULT 'not_started',
      "watched" INTEGER NOT NULL DEFAULT 0,
      "book" INTEGER NOT NULL DEFAULT 0,
      "lecture_notes" INTEGER NOT NULL DEFAULT 0,
      "quranic_examples" INTEGER NOT NULL DEFAULT 0,
      "practice_status" TEXT NOT NULL DEFAULT 'not_started',
      "practice_notes_ok" INTEGER NOT NULL DEFAULT 0,
      "practice_examples_ok" INTEGER NOT NULL DEFAULT 0,
      "practice_exercises_ok" INTEGER NOT NULL DEFAULT 0,
      "practice_explain_ok" INTEGER NOT NULL DEFAULT 0,
      "revision_count" INTEGER NOT NULL DEFAULT 0,
      "last_revision_date" TEXT,
      "next_revision_date" TEXT,
      "completion_percentage" REAL NOT NULL DEFAULT 0,
      "mastery_percentage" REAL NOT NULL DEFAULT 0,
      "quiz_score" INTEGER,
      "understanding" INTEGER,
      "confidence" INTEGER,
      "started_at" DATETIME,
      "completed_at" DATETIME,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "ArabicPractice" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "lecture_id" TEXT NOT NULL,
      "exercise_number" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "exercise_type" TEXT NOT NULL DEFAULT 'identify',
      "status" TEXT NOT NULL DEFAULT 'not_started',
      "user_answer" TEXT,
      "completed_at" DATETIME,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "ArabicRevision" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "lecture_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "understanding" INTEGER NOT NULL,
      "confidence" INTEGER NOT NULL,
      "struggles" TEXT,
      "next_revision_date" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "ArabicNote" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "lecture_id" TEXT,
      "topic" TEXT,
      "arabic_term" TEXT,
      "meaning" TEXT,
      "examples" TEXT,
      "my_understanding" TEXT,
      "category" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "ArabicExample" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "lecture_id" TEXT NOT NULL,
      "arabic_text" TEXT NOT NULL,
      "translation" TEXT,
      "my_analysis" TEXT,
      "term_identified" TEXT,
      "meaning" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "ArabicExplainIt" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "lecture_id" TEXT NOT NULL,
      "prompt" TEXT NOT NULL,
      "understanding" INTEGER,
      "confidence" INTEGER,
      "notes" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "DailyTask" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "profile_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "completed" INTEGER NOT NULL DEFAULT 0,
      "is_must_do" INTEGER NOT NULL DEFAULT 0,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "DailyPlan" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "profile_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "focus_item" TEXT,
      "focus_type" TEXT,
      "focus_id" TEXT,
      "is_custom" INTEGER NOT NULL DEFAULT 1,
      "completed" INTEGER NOT NULL DEFAULT 0,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "QuranReading" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "profile_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "surah" TEXT NOT NULL,
      "ayah_from" INTEGER,
      "ayah_to" INTEGER,
      "pages" INTEGER NOT NULL DEFAULT 1,
      "duration_minutes" INTEGER,
      "reflection" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "QuranMemorization" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "profile_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "surah" TEXT NOT NULL,
      "ayah_from" INTEGER NOT NULL,
      "ayah_to" INTEGER NOT NULL,
      "is_new" INTEGER NOT NULL DEFAULT 1,
      "confidence" INTEGER NOT NULL,
      "mistakes" INTEGER NOT NULL DEFAULT 0,
      "notes" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "TahajjudLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "profile_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "completed" INTEGER NOT NULL DEFAULT 0,
      "rakah_count" INTEGER,
      "time" TEXT,
      "reflection" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "CommunicationSession" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "profile_id" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "practice_type" TEXT NOT NULL,
      "duration_minutes" INTEGER,
      "topic" TEXT,
      "confidence_score" INTEGER,
      "clarity_score" INTEGER,
      "fluency_score" INTEGER,
      "notes" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "objective" TEXT,
      "status" TEXT NOT NULL DEFAULT 'not_started',
      "completion_pct" REAL NOT NULL DEFAULT 0,
      "notes" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "ProjectTask" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "project_id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "completed" INTEGER NOT NULL DEFAULT 0,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "Reminder" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "text" TEXT NOT NULL,
      "source_type" TEXT NOT NULL,
      "reference" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "enabled" INTEGER NOT NULL DEFAULT 1,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS "Note" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "content" TEXT NOT NULL,
      "category" TEXT,
      "topic_id" TEXT,
      "lecture_id" TEXT,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed profile
    await client.execute(`INSERT INTO "Profile" ("id", "name", "mission_start", "mission_end") VALUES ('default', 'Mr. Khan', '2026-08-23', '2027-01-01')`);

    // Seed Azure lectures (60 lectures from data file)
    const lectures = [
      [1, "Intro to Arabic Alphabets", 2599], [2, "Harakaat and Alamaat", 2667], [3, "Types of Kalima", 2688],
      [4, "Masculine/Feminine — Part 1", 2740], [5, "Masculine/Feminine — Part 2", 2662], [6, "Singular / Plural", 2619],
      [7, "Jama ki Iqsam (Types of Plural)", 2855], [8, "Jama Saalim Muzakkar & Mo'nas", 2739], [9, "Ism ki Wus'at (Nakra & Ma'arfa)", 2458],
      [10, "Mua'raf Bil Laam", 2545], [11, "A'raab", 2635], [12, "Jama Mukassar ka A'raab", 2628],
      [13, "Musanna aur Jama Salim ka A'raab", 2607], [14, "Jumla e Ismiyah", 2637], [15, "Mubtada: Ism Alam & Mu'arraf bil Laam", 2650],
      [16, "Mubtada: Ism Ishaara", 2703], [17, "Zamair as Mubtada", 2706], [18, "Murakab Naqis (Murakab Tauseefi)", 2312],
      [19, "Murakab Naqis (Murakab Tauseefi) — Part 2", 2800], [20, "Murakab Naqis (Murakab Ishaari)", 2721],
      [21, "Murakab Naqis (Murakab Izaafi) — Part 1", 2693], [22, "Murakab Naqis (Paichida Murakab Izaafi)", 2723],
      [23, "Murakab Izaafi main Zamair", 2848], [24, "Wahid Muzakkar Ghayab", 2891], [25, "Murakkab e Jaari", 2756],
      [26, "Murakkab e Jaari — continued", 2715], [27, "Huroof e Jaara with Zamair", 2755], [28, "Murakab Taam (Jumla Ismia)", 2803],
      [29, "Jumla Ismia main Zor", 2686], [30, "Surah Asr — Use of إِنَّ with Zamair", 3262],
      [31, "Jumla Ismiya ko Manfi Banana", 2609], [32, "Huroof e Nida (La nafi Jins)", 3063],
      [33, "Huroof e Istafham | Asma e Istafham", 2681], [34, "Feil Mazi & Jumla-e-Feliya", 2856],
      [35, "Feil Mazi & Jumla-e-Feliya — Part 2", 2779], [36, "Fail Maazi Ki Girdaan", 2586],
      [37, "Jumla Feliya me Mafool Ka Istemal", 2877], [38, "Jumla Fi'liyah mein Zamair bataur Mafool", 2944],
      [39, "Jumla Feeliya me Fayal Mafool aur Mutaliq Mashq", 2643], [40, "Jumla Feeliya me Markabat Naqsa ka Istemal", 2992],
      [41, "Jumla Feeliya me (Maazi) me Takeed Peda Karna", 2575], [42, "Jumla Feeliya ko Manfi Aur Sawaliya Banana", 2765],
      [43, "Fail Mazaray", 2664], [44, "Fail e Mazare me Fayal Monus", 2779], [45, "Fail e Mazare ki Gardaan", 2462],
      [46, "Surah al Kafiroon", 2826], [47, "Fail Mazarey main Takeed — Abwaab Sulasi Mujarrad", 2519],
      [48, "Fail Mazarey main Takeed", 3190], [49, "Fail Mazarey Mansoob", 2059],
      [50, "Fail Mazarey Mansoob — An, Kay & Lām Kay", 2866], [51, "Fail Mazarey Majzoom, Laam Amar ka istimaal", 2681],
      [52, "Fail Mazarey Majzoom — Laam e Amr ka Istimaal", 2698], [53, "Fail Amar", 2721],
      [54, "Fail Nahy", 2646], [55, "Fail Majhool (Maazi)", 2574], [56, "Fail Muzarey Majhool", 2760],
      [57, "Jumla Ismiya ko Jumla Failiya main tabdeel kerna", 2600], [58, "Marfu'aat — Kaana/Yakunu ka Istimaal", 2853],
      [59, "Mansuba'at — Part 1", null], [60, "Mansuba'at — Part 2", null]
    ];

    for (const [num, title, dur] of lectures) {
      const id = `lec_${num}`;
      await client.execute({
        sql: `INSERT INTO "LisanLecture" ("id", "lecture_number", "title", "duration_seconds") VALUES (?, ?, ?, ?)`,
        args: [id, num, title, dur]
      });
      // Create 3 practice exercises per lecture
      for (let i = 1; i <= 3; i++) {
        const types = ["identify", "classify", "explain"];
        await client.execute({
          sql: `INSERT INTO "ArabicPractice" ("id", "lecture_id", "exercise_number", "title", "description", "exercise_type") VALUES (?, ?, ?, ?, ?, ?)`,
          args: [`prac_${num}_${i}`, id, i, `Exercise ${i}: ${types[i-1].charAt(0).toUpperCase()+types[i-1].slice(1)} task`, `Practice ${types[i-1]} exercise for Lecture ${num}`, types[i-1]]
        });
      }
    }

    // Seed projects
    const projects = [
      ["Secure Azure Admin Lab", "Build a complete secure Azure lab environment with Entra ID, RBAC, NSGs, and monitoring"],
      ["Hub-Spoke Azure Network", "Design and implement a hub-and-spoke network topology with VPN, firewall, and peering"],
      ["Secure VM + VNet + NSG + Bastion/Private Access", "Deploy secure VMs with NSG rules, Bastion host, and private endpoints"],
      ["Storage + Private Endpoint + Key Vault", "Configure storage accounts with private endpoints, Key Vault, and managed identities"]
    ];
    for (const [name, obj] of projects) {
      await client.execute({
        sql: `INSERT INTO "Project" ("id", "name", "objective") VALUES (?, ?, ?)`,
        args: [`proj_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name, obj]
      });
    }

    return NextResponse.json({ success: true, message: "Database reset and seeded successfully" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
