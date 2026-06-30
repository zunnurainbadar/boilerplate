import path from "node:path";
import { Client } from "pg";

async function bootstrap(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL ?? "postgresql://localhost:5432/ai_boilerplate";
  const url = new URL(databaseUrl);
  const targetDb = url.pathname.replace("/", "");

  if (!targetDb) return;

  url.pathname = "/postgres";
  const adminUrl = url.toString();

  const client = new Client({ connectionString: adminUrl });

  try {
    await client.connect();
    const { rows } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDb]);

    if (rows.length === 0) {
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`Database "${targetDb}" created`);
    }
  } finally {
    await client.end();
  }
}

export async function runMigrations(): Promise<void> {
  await bootstrap();

  const databaseUrl = process.env.DATABASE_URL ?? "postgresql://localhost:5432/ai_boilerplate";
  const { runner } = (await new Function("return import('node-pg-migrate')")()) as typeof import("node-pg-migrate");

  const migrations = await runner({
    databaseUrl,
    migrationsTable: "pgmigrations",
    dir: path.join(__dirname, "..", "..", "migrations"),
    direction: "up",
    migrationsSchema: "public",
  });

  if (migrations.length > 0) {
    console.log(`Applied ${migrations.length} migration(s):`, migrations.map((m) => m.name).join(", "));
  }

  console.log("Migrations complete");
}
