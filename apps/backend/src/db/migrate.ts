import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { getPool } from "./pool";

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

  const pool = getPool();
  const db = drizzle(pool);

  const migrationsFolder = path.join(__dirname, "..", "..", "migrations");

  await migrate(db, { migrationsFolder });

  console.log("Migrations complete");
}
