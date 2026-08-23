#!/usr/bin/env node

/**
 * IHSAN Setup Script
 * 
 * Usage:
 *   npm run setup          — Full setup (push schema + seed)
 *   npm run setup:push     — Push schema only
 *   npm run setup:seed     — Seed database only
 *   npm run setup:turso    — Setup Turso database
 */

import { execSync } from "child_process";

const args = process.argv.slice(2);
const command = args[0] || "full";

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
}

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║      IHSAN — Setup Script            ║");
  console.log("╚══════════════════════════════════════╝");

  const hasTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

  if (command === "turso" || command === "full") {
    if (hasTurso) {
      console.log("\n✓ Turso credentials found in environment");
      console.log("  Pushing schema to Turso...");
      run("npx prisma db push --accept-data-loss");
      console.log("  Seeding Turso database...");
      run("npx tsx prisma/seed.ts");
    } else if (command === "turso") {
      console.log("\n✗ Turso credentials not found!");
      console.log("\nTo setup Turso:");
      console.log("1. Install Turso CLI: curl -sSfL https://get.tur.so/install.sh | bash");
      console.log("2. Login: turso auth login");
      console.log("3. Create database: turso db create ihsan");
      console.log("4. Get URL: turso db show ihsan --url");
      console.log("5. Get token: turso db tokens create ihsan");
      console.log("6. Add to .env.local:");
      console.log("   TURSO_DATABASE_URL=<url>");
      console.log("   TURSO_AUTH_TOKEN=<token>");
      console.log("\nThen run: npm run setup:turso");
      process.exit(1);
    }
  }

  if (command === "full" && !hasTurso) {
    console.log("\nNo Turso credentials — using local SQLite");
    console.log("  Pushing schema...");
    run("npx prisma db push --accept-data-loss");
    console.log("  Seeding database...");
    run("npx tsx prisma/seed.ts");
  }

  if (command === "push") {
    run("npx prisma db push --accept-data-loss");
  }

  if (command === "seed") {
    run("npx tsx prisma/seed.ts");
  }

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║      Setup complete!                 ║");
  console.log("║                                      ║");
  console.log("║  Run: npm run dev                    ║");
  console.log("║  Open: http://localhost:3000          ║");
  console.log("╚══════════════════════════════════════╝");
}

main().catch((e) => {
  console.error("Setup failed:", e);
  process.exit(1);
});
