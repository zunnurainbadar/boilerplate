import { getPool } from "./pool";

export type DbRow = Record<string, unknown>;

async function findById<T extends DbRow>(table: string, id: string): Promise<T | null> {
  const { rows } = await getPool().query<T>(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return rows.length > 0 ? rows[0] : null;
}

async function findAll<T extends DbRow>(table: string, orderBy = "created_at DESC"): Promise<T[]> {
  const { rows } = await getPool().query<T>(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
  return rows;
}

async function findWhere<T extends DbRow>(table: string, column: string, value: unknown): Promise<T[]> {
  const { rows } = await getPool().query<T>(`SELECT * FROM ${table} WHERE ${column} = $1`, [value]);
  return rows;
}

async function upsert(table: string, data: Record<string, unknown>, conflictColumn = "id"): Promise<void> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, i) => `$${i + 1}`);
  const setClause = columns.map((col) => `${col} = EXCLUDED.${col}`).join(", ");

  await getPool().query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})
     ON CONFLICT (${conflictColumn}) DO UPDATE SET ${setClause}`,
    values,
  );
}

async function remove(table: string, id: string): Promise<number> {
  const { rowCount } = await getPool().query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  return rowCount ?? 0;
}

export const db = {
  findById,
  findAll,
  findWhere,
  upsert,
  remove,
};
