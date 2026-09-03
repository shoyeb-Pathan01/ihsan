import { NextResponse } from "next/server";

// Cron route for weekly backup (Vercel cron: "0 3 * * 0" = Sunday 3 AM)
// NO user-facing export UI — just raw data dump
export async function GET() {
  try {
    const { createClient } = await import("@libsql/client");

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      return NextResponse.json({ error: "Turso not configured" }, { status: 500 });
    }

    const client = createClient({ url, authToken });

    // Get all tables
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'"
    );

    const backup: Record<string, unknown[]> = {};

    for (const row of tables.rows) {
      const tableName = row.name as string;
      const result = await client.execute(`SELECT * FROM "${tableName}"`);
      backup[tableName] = result.rows;
    }

    // Add metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      version: "2.0",
      tables: Object.keys(backup).length,
      totalRows: Object.values(backup).reduce((sum, rows) => sum + rows.length, 0),
    };

    // In production, this would upload to Turso storage or Vercel Blob
    // For now, return the backup as JSON
    return NextResponse.json({
      success: true,
      metadata,
      backup,
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}
