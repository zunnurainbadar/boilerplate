import type { Pool } from "pg";
import { closePool, getPool } from "./pool";

let pool: Pool;

beforeAll(async () => {
  pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS examples (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
});

beforeEach(async () => {
  await pool.query("TRUNCATE TABLE examples, users CASCADE");
});

afterAll(async () => {
  await closePool();
});
