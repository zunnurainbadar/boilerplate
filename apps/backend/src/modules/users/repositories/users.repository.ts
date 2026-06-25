import { type AppError, NotFoundError, type Nullable, Result } from "@ai-boilerplate/shared";
import { db } from "../../../db/crud";
import { User, type UserProps, type UserRole } from "../models/users.model";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class UserRepository {
  async findById(id: string): Promise<Nullable<User>> {
    const row = await db.findById<UserRow>("users", id);
    if (!row) return null;
    return this.toDomain(row);
  }

  async findByEmail(email: string): Promise<Nullable<User>> {
    const rows = await db.findWhere<UserRow>("users", "email", email.toLowerCase());
    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async findAll(): Promise<User[]> {
    const rows = await db.findAll<UserRow>("users");
    return rows.map((r) => this.toDomain(r));
  }

  async save(user: User): Promise<User> {
    const row = this.toRow(user);
    await db.upsert("users", row);
    return user;
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    const count = await db.remove("users", id);
    if (count === 0) {
      return Result.failure(new NotFoundError("User", id));
    }
    return Result.success(undefined);
  }

  private toRow(user: User): UserRow {
    const props = user.toJSON();
    return {
      id: props.id,
      name: props.name,
      email: props.email,
      role: props.role,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
    };
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
