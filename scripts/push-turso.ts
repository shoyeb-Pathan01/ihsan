import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function main() {
  console.log("Connecting to Turso...");
  console.log(`URL: ${TURSO_URL}`);

  // Read and apply schema SQL
  const sqlPath = resolve(__dirname, "turso-schema.sql");
  let sql = readFileSync(sqlPath, "utf-8");

  // Remove error lines from the beginning
  const lines = sql.split("\n");
  const startIdx = lines.findIndex((l) => l.startsWith("-- CreateTable"));
  sql = lines.slice(startIdx).join("\n");

  // Split by CreateTable statements and execute each
  const statements = sql
    .split("-- CreateTable")
    .filter((s) => s.trim())
    .map((s) => "-- CreateTable" + s);

  console.log(`\nApplying ${statements.length} table creation statements...`);

  for (const stmt of statements) {
    const cleanSql = stmt.replace(/-- CreateTable\n/g, "").trim();
    if (cleanSql) {
      try {
        await client.execute(cleanSql);
        const tableName = cleanSql.match(/CREATE TABLE "?(\w+)"?/)?.[1] || "unknown";
        console.log(`  ✓ Table: ${tableName}`);
      } catch (e: any) {
        if (e.message?.includes("already exists")) {
          const tableName = cleanSql.match(/CREATE TABLE "?(\w+)"?/)?.[1] || "unknown";
          console.log(`  → Table: ${tableName} (already exists, skipping)`);
        } else {
          console.error(`  ✗ Error: ${e.message}`);
        }
      }
    }
  }

  // Apply indexes
  const indexStatements = sql
    .split("-- CreateIndex")
    .filter((s) => s.trim())
    .map((s) => s.split("-- CreateTable")[0].trim())
    .filter((s) => s.startsWith("CREATE UNIQUE INDEX") || s.startsWith("CREATE INDEX"));

  if (indexStatements.length > 0) {
    console.log(`\nApplying ${indexStatements.length} indexes...`);
    for (const idx of indexStatements) {
      try {
        await client.execute(idx);
        const idxName = idx.match(/CREATE (?:UNIQUE )?INDEX "?(\w+)"?/)?.[1] || "unknown";
        console.log(`  ✓ Index: ${idxName}`);
      } catch (e: any) {
        if (e.message?.includes("already exists")) {
          console.log(`  → Index already exists, skipping`);
        } else {
          console.error(`  ✗ Error: ${e.message}`);
        }
      }
    }
  }

  console.log("\nSchema applied successfully!");
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
