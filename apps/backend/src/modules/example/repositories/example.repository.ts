import { Pool } from "pg";
import { Nullable, Result, AppError, NotFoundError } from "@ai-boilerplate/shared";
import { Example, ExampleProps } from "../models/example.model";

interface ExampleRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export class ExampleRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Nullable<Example>> {
    const { rows } = await this.pool.query<ExampleRow>(
      "SELECT id, name, description, created_at, updated_at FROM examples WHERE id = $1",
      [id],
    );
    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async findAll(): Promise<Example[]> {
    const { rows } = await this.pool.query<ExampleRow>(
      "SELECT id, name, description, created_at, updated_at FROM examples ORDER BY created_at DESC",
    );
    return rows.map((r) => this.toDomain(r));
  }

  async save(example: Example): Promise<Example> {
    const props = example.toJSON();
    await this.pool.query(
      `INSERT INTO examples (id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         updated_at = EXCLUDED.updated_at`,
      [props.id, props.name, props.description, props.createdAt, props.updatedAt],
    );
    return example;
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    const { rowCount } = await this.pool.query("DELETE FROM examples WHERE id = $1", [id]);
    if (rowCount === 0) {
      return Result.failure(new NotFoundError("Example", id));
    }
    return Result.success(undefined);
  }

  private toDomain(row: ExampleRow): Example {
    return Example.reconstitute({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as ExampleProps);
  }
}
