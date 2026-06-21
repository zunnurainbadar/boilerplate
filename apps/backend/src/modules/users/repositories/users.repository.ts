import { type AppError, NotFoundError, type Nullable, Result } from "@ai-boilerplate/shared";
import type { Pool } from "pg";
import { User, type UserProps, type UserRole } from "../models/users.model";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export class UserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Nullable<User>> {
    const { rows } = await this.pool.query<UserRow>(
      "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1",
      [id],
    );
    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async findByEmail(email: string): Promise<Nullable<User>> {
    const { rows } = await this.pool.query<UserRow>(
      "SELECT id, name, email, role, created_at, updated_at FROM users WHERE email = $1",
      [email.toLowerCase()],
    );
    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async findAll(): Promise<User[]> {
    const { rows } = await this.pool.query<UserRow>(
      "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC",
    );
    return rows.map((r) => this.toDomain(r));
  }

  async save(user: User): Promise<User> {
    const props = user.toJSON();
    await this.pool.query(
      `INSERT INTO users (id, name, email, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         role = EXCLUDED.role,
         updated_at = EXCLUDED.updated_at`,
      [props.id, props.name, props.email, props.role, props.createdAt, props.updatedAt],
    );
    return user;
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    const { rowCount } = await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
    if (rowCount === 0) {
      return Result.failure(new NotFoundError("User", id));
    }
    return Result.success(undefined);
  }

  private toDomain(row: UserRow): User {
    return User.reconstitute({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as UserProps);
  }
}
