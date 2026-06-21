import fs from "node:fs";
import path from "node:path";
import { getPool } from "./pool";

export async function runMigrations(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      run_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const dir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const { rows } = await pool.query("SELECT 1 FROM migrations WHERE name = $1", [file]);
    if (rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    await pool.query(sql);
    await pool.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
    console.log(`Migration applied: ${file}`);
  }

  console.log("Migrations complete");
}
