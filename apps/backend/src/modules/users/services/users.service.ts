import { Result, AppError, NotFoundError, ValidationError } from "@ai-boilerplate/shared";
import { User, UserRole } from "../models/users.model";
import { UserRepository } from "../repositories/users.repository";

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async create(data: { name: string; email: string; role?: UserRole }): Promise<Result<User, AppError>> {
    if (!data.name?.trim()) {
      return Result.failure(new ValidationError("Name is required"));
    }
    if (!data.email?.trim()) {
      return Result.failure(new ValidationError("Email is required"));
    }
    if (!this.isValidEmail(data.email)) {
      return Result.failure(new ValidationError("Invalid email format"));
    }

    const existing = await this.repository.findByEmail(data.email.trim().toLowerCase());
    if (existing) {
      return Result.failure(new ValidationError("A user with this email already exists"));
    }

    if (data.role && !["admin", "editor", "viewer"].includes(data.role)) {
      return Result.failure(new ValidationError(`Invalid role: ${data.role}`));
    }

    const user = User.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
    });

    const saved = await this.repository.save(user);
    return Result.success(saved);
  }

  async getById(id: string): Promise<Result<User, AppError>> {
    const user = await this.repository.findById(id);
    if (!user) {
      return Result.failure(new NotFoundError("User", id));
    }
    return Result.success(user);
  }

  async getAll(): Promise<Result<User[], AppError>> {
    const users = await this.repository.findAll();
    return Result.success(users);
  }

  async update(id: string, data: { name?: string; email?: string; role?: UserRole }): Promise<Result<User, AppError>> {
    const result = await this.getById(id);
    if (result.isFailure) return Result.failure(result.error);

    const user = result.value;

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return Result.failure(new ValidationError("Name cannot be empty"));
      }
      user.updateName(data.name.trim());
    }

    if (data.email !== undefined) {
      if (!data.email.trim()) {
        return Result.failure(new ValidationError("Email cannot be empty"));
      }
      if (!this.isValidEmail(data.email)) {
        return Result.failure(new ValidationError("Invalid email format"));
      }
      const existing = await this.repository.findByEmail(data.email.trim().toLowerCase());
      if (existing && existing.id !== id) {
        return Result.failure(new ValidationError("A user with this email already exists"));
      }
      user.email = data.email.trim().toLowerCase();
      (user as { updatedAt: string }).updatedAt = new Date().toISOString();
    }

    if (data.role !== undefined) {
      if (!["admin", "editor", "viewer"].includes(data.role)) {
        return Result.failure(new ValidationError(`Invalid role: ${data.role}`));
      }
      user.changeRole(data.role);
    }

    const saved = await this.repository.save(user);
    return Result.success(saved);
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    return this.repository.delete(id);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
