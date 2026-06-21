import type { BaseEntity, Timestamp } from "@ai-boilerplate/shared";

export type UserRole = "admin" | "editor" | "viewer";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class User implements BaseEntity {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<UserProps, "id" | "createdAt" | "updatedAt" | "role"> & { role?: UserRole }): User {
    const now = new Date().toISOString();
    return new User({
      id: crypto.randomUUID(),
      name: props.name,
      email: props.email,
      role: props.role ?? "viewer",
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date().toISOString();
  }

  changeRole(role: UserRole): void {
    this.role = role;
    this.updatedAt = new Date().toISOString();
  }

  toJSON(): UserProps {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
