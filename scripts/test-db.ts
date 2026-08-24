import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function test() {
  console.log("=== DATABASE COUNTS ===");
  console.log("Profile:", await prisma.profile.count());
  console.log("Lectures:", await prisma.lisanLecture.count());
  console.log("Practices:", await prisma.arabicPractice.count());
  console.log("Azure Sessions:", await prisma.azureSession.count());
  console.log("Azure Topics:", await prisma.goalTopic.count());
  console.log("Azure Modules:", await prisma.goalModule.count());
  console.log("Azure Practicals:", await prisma.azurePractical.count());
  console.log("Reminders:", await prisma.reminder.count());
  console.log("Projects:", await prisma.project.count());
  console.log("Notes:", await prisma.arabicNote.count());
  console.log("Examples:", await prisma.arabicExample.count());
  console.log("Revisions:", await prisma.arabicRevision.count());
  console.log("Explain Sessions:", await prisma.arabicExplainIt.count());

  // Check first lecture has practices
  const first = await prisma.lisanLecture.findFirst({ orderBy: { lecture_number: "asc" } });
  if (first) {
    const practices = await prisma.arabicPractice.findMany({ where: { lecture_id: first.id } });
    console.log(`\nLecture 1 "${first.title}" has ${practices.length} practices`);
    console.log(`Status: ${first.status}, Watched: ${first.watched}, Mastery: ${first.mastery_percentage}`);
  }

  // Check Azure modules and topics
  const moduleCount = await prisma.goalModule.count();
  const topicCount = await prisma.goalTopic.count();
  console.log(`\nAzure: ${moduleCount} modules, ${topicCount} topics`);

  // Check sessions
  const sessions = await prisma.azureSession.count();
  console.log(`Azure Sessions: ${sessions}`);

  // Verify all lectures have practices
  const lecturesWithoutPractices = await prisma.lisanLecture.findMany({
    where: { practices: { none: {} } },
  });
  console.log(`\nLectures WITHOUT practices: ${lecturesWithoutPractices.length}`);

  await prisma.$disconnect();
}

test().catch(console.error);
