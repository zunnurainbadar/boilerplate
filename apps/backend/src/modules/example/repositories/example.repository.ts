import { type AppError, NotFoundError, type Nullable, Result } from "@ai-boilerplate/shared";
import { db } from "../../../db/crud";
import { Example, type ExampleProps } from "../models/example.model";

interface ExampleRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class ExampleRepository {
  async findById(id: string): Promise<Nullable<Example>> {
    const row = await db.findById<ExampleRow>("examples", id);
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Example[]> {
    const rows = await db.findAll<ExampleRow>("examples");
    return rows.map((r) => this.toDomain(r));
  }

  async save(example: Example): Promise<Example> {
    const row = this.toRow(example);
    await db.upsert("examples", row);
    return example;
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    const count = await db.remove("examples", id);
    if (count === 0) {
      return Result.failure(new NotFoundError("Example", id));
    }
    return Result.success(undefined);
  }

  private toRow(example: Example): ExampleRow {
    const props = example.toJSON();
    return {
      id: props.id,
      name: props.name,
      description: props.description,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
    };
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
