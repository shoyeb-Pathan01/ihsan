import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function testHomeAPI() {
  console.log("\n=== HOME API ===");

  const profile = await prisma.profile.findFirst();
  assert("Profile exists", !!profile);

  const totalTopics = await prisma.goalTopic.count();
  const completedTopics = await prisma.goalTopic.count({ where: { status: { not: "not_started" } } });
  const azureProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  assert("Azure progress calculated", azureProgress === 0, `Got ${azureProgress}%`);

  const totalLectures = await prisma.lisanLecture.count();
  assert("60 lectures exist", totalLectures === 60, `Got ${totalLectures}`);

  const completedLectures = await prisma.lisanLecture.count({ where: { status: "completed" } });
  assert("No completed lectures yet", completedLectures === 0);

  const learningLectures = await prisma.lisanLecture.count({ where: { status: "learning" } });
  assert("No learning lectures yet", learningLectures === 0);

  const azureCurrent = await prisma.goalTopic.findFirst({ where: { status: "learning" } });
  assert("No current Azure topic", azureCurrent === null);

  const arabicCurrent = await prisma.lisanLecture.findFirst({ where: { status: "learning" } });
  assert("No current Arabic lecture", arabicCurrent === null);

  const reminder = await prisma.reminder.findFirst({ where: { enabled: true } });
  assert("Reminder exists", !!reminder);
}

async function testArabicAPI() {
  console.log("\n=== ARABIC API ===");

  // Test overview
  const lectures = await prisma.lisanLecture.findMany({ orderBy: { lecture_number: "asc" }, include: { practices: true, revisions: true } });
  assert("60 lectures loaded", lectures.length === 60);

  const totalMastery = lectures.reduce((sum, l) => sum + l.mastery_percentage, 0);
  const avgMastery = Math.round(totalMastery / lectures.length);
  assert("Average mastery is 0", avgMastery === 0, `Got ${avgMastery}`);

  const currentLearning = lectures.find((l) => l.status === "learning") || lectures.find((l) => l.status === "not_started");
  assert("Current learning found (first not_started)", !!currentLearning);
  assert("Current learning is lecture 1", currentLearning?.lecture_number === 1);

  const weakAreas = lectures.filter((l) => l.mastery_percentage < 50 && l.status !== "not_started");
  assert("No weak areas yet", weakAreas.length === 0);

  // Test lecture detail
  const lecture1 = await prisma.lisanLecture.findFirst({
    where: { lecture_number: 1 },
    include: { practices: true, revisions: true, notes: true, examples: true, explain_sessions: true },
  });
  assert("Lecture 1 exists", !!lecture1);
  assert("Lecture 1 has 3 practices", lecture1?.practices.length === 3);
  assert("Lecture 1 has 0 revisions", lecture1?.revisions.length === 0);
  assert("Lecture 1 has 0 notes", lecture1?.notes.length === 0);
  assert("Lecture 1 has 0 examples", lecture1?.examples.length === 0);
  assert("Lecture 1 has 0 explain sessions", lecture1?.explain_sessions.length === 0);
  assert("Lecture 1 status is not_started", lecture1?.status === "not_started");
  assert("Lecture 1 watched is false", lecture1?.watched === false);
  assert("Lecture 1 mastery is 0", lecture1?.mastery_percentage === 0);
}

async function testAzureAPI() {
  console.log("\n=== AZURE API ===");

  const sessions = await prisma.azureSession.findMany();
  assert("44 sessions loaded", sessions.length === 44, `Got ${sessions.length}`);

  const allNotStarted = sessions.every((s) => s.status === "not_started");
  assert("All sessions not started", allNotStarted);

  const practicals = await prisma.azurePractical.findMany();
  assert("4 practicals loaded", practicals.length === 4);

  const modules = await prisma.goalModule.findMany();
  assert("22 modules loaded", modules.length === 22, `Got ${modules.length}`);

  const topics = await prisma.goalTopic.findMany();
  assert("224 topics loaded", topics.length === 224, `Got ${topics.length}`);

  const allTopicsNotStarted = topics.every((t) => t.status === "not_started");
  assert("All topics not started", allTopicsNotStarted);
}

async function testPipelineUpdate() {
  console.log("\n=== PIPELINE UPDATE TEST ===");

  const lecture1 = await prisma.lisanLecture.findFirst({ where: { lecture_number: 1 } });
  if (!lecture1) { assert("Lecture 1 found", false); return; }

  // Toggle watched
  await prisma.lisanLecture.update({
    where: { id: lecture1.id },
    data: { watched: true, status: "learning", completion_percentage: 25 },
  });

  const updated = await prisma.lisanLecture.findUnique({ where: { id: lecture1.id } });
  assert("Watched toggled to true", updated?.watched === true);
  assert("Status changed to learning", updated?.status === "learning");
  assert("Completion is 25%", updated?.completion_percentage === 25);

  // Toggle book
  await prisma.lisanLecture.update({
    where: { id: lecture1.id },
    data: { book: true, completion_percentage: 50 },
  });

  const updated2 = await prisma.lisanLecture.findUnique({ where: { id: lecture1.id } });
  assert("Book toggled to true", updated2?.book === true);
  assert("Completion is 50%", updated2?.completion_percentage === 50);

  // Reset back
  await prisma.lisanLecture.update({
    where: { id: lecture1.id },
    data: { watched: false, book: false, status: "not_started", completion_percentage: 0 },
  });
}

async function testRevisionCreation() {
  console.log("\n=== REVISION CREATION TEST ===");

  const lecture1 = await prisma.lisanLecture.findFirst({ where: { lecture_number: 1 } });
  if (!lecture1) { assert("Lecture 1 found", false); return; }

  // Create revision
  const revision = await prisma.arabicRevision.create({
    data: {
      lecture_id: lecture1.id,
      date: "2026-08-24",
      understanding: 4,
      confidence: 3,
      struggles: "Need to review Ism categories",
      next_revision_date: "2026-08-25",
    },
  });
  assert("Revision created", !!revision);
  assert("Revision understanding is 4", revision.understanding === 4);

  // Update lecture revision count
  await prisma.lisanLecture.update({
    where: { id: lecture1.id },
    data: { revision_count: 1, last_revision_date: "2026-08-24", next_revision_date: "2026-08-25" },
  });

  const updated = await prisma.lisanLecture.findUnique({ where: { id: lecture1.id } });
  assert("Revision count is 1", updated?.revision_count === 1);
  assert("Next revision date set", updated?.next_revision_date === "2026-08-25");

  // Cleanup
  await prisma.arabicRevision.delete({ where: { id: revision.id } });
  await prisma.lisanLecture.update({
    where: { id: lecture1.id },
    data: { revision_count: 0, last_revision_date: null, next_revision_date: null },
  });
}

async function testNoteCreation() {
  console.log("\n=== NOTE CREATION TEST ===");

  const lecture1 = await prisma.lisanLecture.findFirst({ where: { lecture_number: 1 } });
  if (!lecture1) { assert("Lecture 1 found", false); return; }

  const note = await prisma.arabicNote.create({
    data: {
      lecture_id: lecture1.id,
      arabic_term: "Ism",
      meaning: "Noun — name of a person, place, or thing",
      my_understanding: "Ism is the Arabic word for noun",
      category: "term",
    },
  });
  assert("Note created", !!note);
  assert("Note term is Ism", note.arabic_term === "Ism");

  const notes = await prisma.arabicNote.findMany({ where: { lecture_id: lecture1.id } });
  assert("Lecture 1 has 1 note", notes.length === 1);

  // Cleanup
  await prisma.arabicNote.delete({ where: { id: note.id } });
}

async function testExampleCreation() {
  console.log("\n=== EXAMPLE CREATION TEST ===");

  const lecture1 = await prisma.lisanLecture.findFirst({ where: { lecture_number: 1 } });
  if (!lecture1) { assert("Lecture 1 found", false); return; }

  const example = await prisma.arabicExample.create({
    data: {
      lecture_id: lecture1.id,
      arabic_text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
      translation: "In the name of Allah, the Most Gracious, the Most Merciful",
      term_identified: "Ism",
      meaning: "Allah is an Ism (noun)",
    },
  });
  assert("Example created", !!example);
  assert("Example has Arabic text", example.arabic_text === "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ");

  const examples = await prisma.arabicExample.findMany({ where: { lecture_id: lecture1.id } });
  assert("Lecture 1 has 1 example", examples.length === 1);

  // Cleanup
  await prisma.arabicExample.delete({ where: { id: example.id } });
}

async function testExplainItCreation() {
  console.log("\n=== EXPLAIN IT CREATION TEST ===");

  const lecture1 = await prisma.lisanLecture.findFirst({ where: { lecture_number: 1 } });
  if (!lecture1) { assert("Lecture 1 found", false); return; }

  const session = await prisma.arabicExplainIt.create({
    data: {
      lecture_id: lecture1.id,
      prompt: "Explain what Ism is without looking at your notes",
      understanding: 4,
      confidence: 3,
      notes: "Ism is a noun in Arabic grammar",
    },
  });
  assert("Explain session created", !!session);
  assert("Understanding is 4", session.understanding === 4);

  const sessions = await prisma.arabicExplainIt.findMany({ where: { lecture_id: lecture1.id } });
  assert("Lecture 1 has 1 explain session", sessions.length === 1);

  // Cleanup
  await prisma.arabicExplainIt.delete({ where: { id: session.id } });
}

async function testPracticeUpdate() {
  console.log("\n=== PRACTICE UPDATE TEST ===");

  const lecture1 = await prisma.lisanLecture.findFirst({ where: { lecture_number: 1 } });
  if (!lecture1) { assert("Lecture 1 found", false); return; }

  const practices = await prisma.arabicPractice.findMany({ where: { lecture_id: lecture1.id } });
  assert("Lecture 1 has 3 practices", practices.length === 3);

  // Complete first practice
  await prisma.arabicPractice.update({
    where: { id: practices[0].id },
    data: { status: "completed", completed_at: new Date() },
  });

  const updated = await prisma.arabicPractice.findUnique({ where: { id: practices[0].id } });
  assert("Practice 1 completed", updated?.status === "completed");

  // Update lecture practice status
  await prisma.lisanLecture.update({
    where: { id: lecture1.id },
    data: { practice_status: "in_progress" },
  });

  const lecture = await prisma.lisanLecture.findUnique({ where: { id: lecture1.id } });
  assert("Lecture practice status is in_progress", lecture?.practice_status === "in_progress");

  // Cleanup
  await prisma.arabicPractice.update({
    where: { id: practices[0].id },
    data: { status: "not_started", completed_at: null },
  });
  await prisma.lisanLecture.update({
    where: { id: lecture1.id },
    data: { practice_status: "not_started" },
  });
}

async function testSpacedRepetition() {
  console.log("\n=== SPACED REPETITION TEST ===");

  // Simulate the spaced repetition algorithm
  function getNextRevisionDate(revisionCount: number, currentDate: string): string {
    let daysToAdd = 1;
    if (revisionCount === 2) daysToAdd = 3;
    else if (revisionCount === 3) daysToAdd = 7;
    else if (revisionCount === 4) daysToAdd = 14;
    else if (revisionCount >= 5) daysToAdd = 30;

    const next = new Date(currentDate);
    next.setDate(next.getDate() + daysToAdd);
    return next.toISOString().split("T")[0];
  }

  const date = "2026-08-24";
  assert("1st revision → 1 day", getNextRevisionDate(1, date) === "2026-08-25");
  assert("2nd revision → 3 days", getNextRevisionDate(2, date) === "2026-08-27");
  assert("3rd revision → 7 days", getNextRevisionDate(3, date) === "2026-08-31");
  assert("4th revision → 14 days", getNextRevisionDate(4, date) === "2026-09-07");
  assert("5th revision → 30 days", getNextRevisionDate(5, date) === "2026-09-23");
}

async function testProgressAPI() {
  console.log("\n=== PROGRESS API ===");

  const profile = await prisma.profile.findFirst();
  assert("Profile exists", !!profile);

  const totalTopics = await prisma.goalTopic.count();
  const completedTopics = await prisma.goalTopic.count({ where: { status: { not: "not_started" } } });
  const masteredTopics = await prisma.goalTopic.count({ where: { status: "mastered" } });
  assert("Azure completion is 0%", totalTopics > 0 && completedTopics === 0);
  assert("Azure mastery is 0%", masteredTopics === 0);

  const totalLectures = await prisma.lisanLecture.count();
  const completedLectures = await prisma.lisanLecture.count({ where: { status: "completed" } });
  assert("Arabic completion is 0%", totalLectures > 0 && completedLectures === 0);
}

async function testSettingsAPI() {
  console.log("\n=== SETTINGS API ===");

  const profile = await prisma.profile.findFirst();
  assert("Profile has name", profile?.name === "Mr. Khan");
  assert("Profile has mission_start", profile?.mission_start === "2026-08-23");
  assert("Profile has mission_end", profile?.mission_end === "2027-01-01");

  // Update settings
  await prisma.profile.update({
    where: { id: profile!.id },
    data: { name: "Test User" },
  });

  const updated = await prisma.profile.findFirst();
  assert("Name updated", updated?.name === "Test User");

  // Reset
  await prisma.profile.update({
    where: { id: profile!.id },
    data: { name: "Mr. Khan" },
  });
}

async function testCommunicationAPI() {
  console.log("\n=== COMMUNICATION API ===");

  const sessions = await prisma.communicationSession.count();
  assert("0 communication sessions", sessions === 0);

  // Create a session
  const session = await prisma.communicationSession.create({
    data: {
      profile_id: "default",
      date: "2026-08-24",
      practice_type: "Technical Explanation",
      confidence_score: 4,
      clarity_score: 3,
      fluency_score: 4,
    },
  });
  assert("Session created", !!session);

  const count = await prisma.communicationSession.count();
  assert("1 communication session now", count === 1);

  // Cleanup
  await prisma.communicationSession.delete({ where: { id: session.id } });
}

async function testTahajjudAPI() {
  console.log("\n=== TAHAJJUD API ===");

  const nights = await prisma.tahajjudLog.count();
  assert("0 tahajjud nights", nights === 0);

  // Create a log
  const log = await prisma.tahajjudLog.create({
    data: {
      profile_id: "default",
      date: "2026-08-24",
      completed: true,
    },
  });
  assert("Tahajjud log created", !!log);

  const count = await prisma.tahajjudLog.count();
  assert("1 tahajjud night now", count === 1);

  // Cleanup
  await prisma.tahajjudLog.delete({ where: { id: log.id } });
}

async function testReadingAPI() {
  console.log("\n=== READING API ===");

  const pages = await prisma.quranReading.count();
  assert("0 reading sessions", pages === 0);

  const session = await prisma.quranReading.create({
    data: {
      profile_id: "default",
      date: "2026-08-24",
      surah: "Al-Fatiha",
      pages: 1,
    },
  });
  assert("Reading session created", !!session);

  const count = await prisma.quranReading.count();
  assert("1 reading session now", count === 1);

  await prisma.quranReading.delete({ where: { id: session.id } });
}

async function testMemorizationAPI() {
  console.log("\n=== MEMORIZATION API ===");

  const sessions = await prisma.quranMemorization.count();
  assert("0 memorization sessions", sessions === 0);

  const session = await prisma.quranMemorization.create({
    data: {
      profile_id: "default",
      date: "2026-08-24",
      surah: "Al-Fatiha",
      ayah_from: 1,
      ayah_to: 7,
      confidence: 4,
    },
  });
  assert("Memorization session created", !!session);

  const count = await prisma.quranMemorization.count();
  assert("1 memorization session now", count === 1);

  await prisma.quranMemorization.delete({ where: { id: session.id } });
}

async function testProjectsAPI() {
  console.log("\n=== PROJECTS API ===");

  const projects = await prisma.project.findMany();
  assert("4 projects loaded", projects.length === 4);
  assert("All not started", projects.every((p) => p.status === "not_started"));
}

async function run() {
  console.log("Running comprehensive API tests...\n");

  await testHomeAPI();
  await testArabicAPI();
  await testAzureAPI();
  await testPipelineUpdate();
  await testRevisionCreation();
  await testNoteCreation();
  await testExampleCreation();
  await testExplainItCreation();
  await testPracticeUpdate();
  await testSpacedRepetition();
  await testProgressAPI();
  await testSettingsAPI();
  await testCommunicationAPI();
  await testTahajjudAPI();
  await testReadingAPI();
  await testMemorizationAPI();
  await testProjectsAPI();

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(console.error);
