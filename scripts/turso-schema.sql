node.exe : Loaded Prisma config from prisma.config.ts.
At line:1 char:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (Loaded Prisma c...isma.config.ts.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Mr. Khan',
    "mission_start" TEXT NOT NULL DEFAULT '2026-08-23',
    "mission_end" TEXT NOT NULL DEFAULT '2026-10-23',
    "azure_weight" REAL NOT NULL DEFAULT 40,
    "arabic_weight" REAL NOT NULL DEFAULT 40,
    "reading_weight" REAL NOT NULL DEFAULT 7.5,
    "memorization_weight" REAL NOT NULL DEFAULT 5,
    "tahajjud_weight" REAL NOT NULL DEFAULT 5,
    "communication_weight" REAL NOT NULL DEFAULT 2.5,
    "daily_target" INTEGER NOT NULL DEFAULT 3,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Goal_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoalModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goal_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "GoalModule_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "Goal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoalTopic" (
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
    "lab_completed" BOOLEAN NOT NULL DEFAULT false,
    "revision_count" INTEGER NOT NULL DEFAULT 0,
    "last_revised" DATETIME,
    "next_revision" DATETIME,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "proof_of_work" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "GoalTopic_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "Goal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GoalTopic_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "GoalModule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TopicSessionLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topic_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TopicSessionLink_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "GoalTopic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TopicProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topic_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "completion_delta" REAL NOT NULL DEFAULT 0,
    "mastery_delta" REAL NOT NULL DEFAULT 0,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TopicProgress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "GoalTopic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AzureSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "drive_link" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LisanLecture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lecture_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "duration_seconds" INTEGER,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "book" BOOLEAN NOT NULL DEFAULT false,
    "notes" BOOLEAN NOT NULL DEFAULT false,
    "examples" BOOLEAN NOT NULL DEFAULT false,
    "practice" BOOLEAN NOT NULL DEFAULT false,
    "revision" BOOLEAN NOT NULL DEFAULT false,
    "quiz" BOOLEAN NOT NULL DEFAULT false,
    "doubts_cleared" BOOLEAN NOT NULL DEFAULT false,
    "lecture_progress" REAL NOT NULL DEFAULT 0,
    "understanding" INTEGER NOT NULL DEFAULT 0,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "mastery" REAL NOT NULL DEFAULT 0,
    "last_revised" DATETIME,
    "next_revision" DATETIME,
    "revision_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "xp_value" INTEGER NOT NULL DEFAULT 5,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "is_must_do" BOOLEAN NOT NULL DEFAULT false,
    "topic_id" TEXT,
    "lecture_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DailyTask_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "completed" TEXT,
    "learned" TEXT,
    "difficult" TEXT,
    "needs_revision" TEXT,
    "quran_done" BOOLEAN NOT NULL DEFAULT false,
    "tahajjud_done" BOOLEAN NOT NULL DEFAULT false,
    "communication_done" BOOLEAN NOT NULL DEFAULT false,
    "grateful" TEXT,
    "tomorrow_priority" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DailyLog_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "best_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Streak_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "XPTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XPTransaction_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "badge_key" TEXT NOT NULL,
    "unlocked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBadge_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuranReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "surah" TEXT NOT NULL,
    "ayah_from" INTEGER,
    "ayah_to" INTEGER,
    "pages" INTEGER NOT NULL DEFAULT 1,
    "juz" INTEGER,
    "duration_minutes" INTEGER,
    "reflection" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "QuranReading_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuranMemorization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "surah" TEXT NOT NULL,
    "ayah_from" INTEGER NOT NULL,
    "ayah_to" INTEGER NOT NULL,
    "is_new" BOOLEAN NOT NULL DEFAULT true,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "mistakes" INTEGER NOT NULL DEFAULT 0,
    "last_revised" DATETIME,
    "next_revision" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'learning',
    "revision_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "QuranMemorization_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TahajjudLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "rakah_count" INTEGER,
    "approximate_time" TEXT,
    "dua_reflection" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "TahajjudLog_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunicationLog" (
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
    "topic_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "CommunicationLog_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text_paraphrase" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "authenticity_note" TEXT,
    "category" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "profile_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "week_start" TEXT NOT NULL,
    "week_end" TEXT NOT NULL,
    "azure_progress" REAL,
    "arabic_progress" REAL,
    "azure_mastery" REAL,
    "arabic_mastery" REAL,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "tasks_missed" INTEGER NOT NULL DEFAULT 0,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "streak_current" INTEGER,
    "weakest_area" TEXT,
    "strongest_area" TEXT,
    "focus_1" TEXT,
    "focus_2" TEXT,
    "focus_3" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "WeeklyReview_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "objective" TEXT,
    "architecture" TEXT,
    "services_used" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "completion_pct" REAL NOT NULL DEFAULT 0,
    "screenshots" TEXT,
    "notes" TEXT,
    "lessons_learned" TEXT,
    "interview_explanation" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ProjectTask_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "topic_id" TEXT,
    "topic_name" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 45,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME,
    "accomplished" TEXT,
    "confidence_after" INTEGER,
    "notes" TEXT,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BaselineSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "azure_knowledge" INTEGER,
    "arabic_knowledge" INTEGER,
    "communication_confidence" INTEGER,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BaselineSnapshot_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "topic_id" TEXT,
    "lecture_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Streak_profile_id_category_key" ON "Streak"("profile_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_profile_id_badge_key_key" ON "UserBadge"("profile_id", "badge_key");

-- CreateIndex
CREATE UNIQUE INDEX "TahajjudLog_profile_id_date_key" ON "TahajjudLog"("profile_id", "date");

