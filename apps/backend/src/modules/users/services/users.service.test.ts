import { beforeEach, describe, expect, it } from "vitest";
import { getPool } from "../../../db/pool";
import { UserRepository } from "../repositories/users.repository";
import { UserService } from "./users.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService(new UserRepository(getPool()));
  });

  describe("create", () => {
    it("should create a user with valid data", async () => {
      const result = await service.create({ name: "Alice", email: "alice@example.com" });
      expect(result.isSuccess).toBe(true);
      expect(result.value.name).toBe("Alice");
      expect(result.value.email).toBe("alice@example.com");
      expect(result.value.role).toBe("viewer");
      expect(result.value.id).toBeDefined();
    });

    it("should default role to viewer", async () => {
      const result = await service.create({ name: "Bob", email: "bob@test.com" });
      expect(result.isSuccess).toBe(true);
      expect(result.value.role).toBe("viewer");
    });

    it("should accept a valid role", async () => {
      const result = await service.create({ name: "Carol", email: "carol@test.com", role: "admin" });
      expect(result.isSuccess).toBe(true);
      expect(result.value.role).toBe("admin");
    });

    it("should fail with empty name", async () => {
      const result = await service.create({ name: "", email: "x@test.com" });
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with invalid email", async () => {
      const result = await service.create({ name: "Dave", email: "not-an-email" });
      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe("Invalid email format");
    });

    it("should fail with duplicate email", async () => {
      await service.create({ name: "Eve", email: "eve@test.com" });
      const result = await service.create({ name: "Eve Dupe", email: "eve@test.com" });
      expect(result.isFailure).toBe(true);
      expect(result.error.message).toContain("already exists");
    });

    it("should fail with invalid role", async () => {
      const result = await service.create({
        name: "Frank",
        email: "frank@test.com",
        role: "superuser" as "admin",
      });
      expect(result.isFailure).toBe(true);
      expect(result.error.message).toContain("Invalid role");
    });

    it("should lowercase email", async () => {
      const result = await service.create({ name: "Grace", email: "Grace@Example.COM" });
      expect(result.value.email).toBe("grace@example.com");
    });
  });

  describe("getById", () => {
    it("should return a user by id", async () => {
      const created = await service.create({ name: "Heidi", email: "heidi@test.com" });
      const found = await service.getById(created.value.id);
      expect(found.isSuccess).toBe(true);
      expect(found.value.name).toBe("Heidi");
    });

    it("should fail for nonexistent id", async () => {
      const result = await service.getById("00000000-0000-0000-0000-000000000000");
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  describe("getAll", () => {
    it("should return all users", async () => {
      await service.create({ name: "Ivan", email: "ivan@test.com" });
      await service.create({ name: "Judy", email: "judy@test.com" });
      const result = await service.getAll();
      expect(result.value).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("should update name", async () => {
      const created = await service.create({ name: "Ken", email: "ken@test.com" });
      const updated = await service.update(created.value.id, { name: "Kenneth" });
      expect(updated.value.name).toBe("Kenneth");
      expect(updated.value.email).toBe("ken@test.com");
    });

    it("should change role", async () => {
      const created = await service.create({ name: "Lara", email: "lara@test.com" });
      const updated = await service.update(created.value.id, { role: "admin" });
      expect(updated.value.role).toBe("admin");
    });

    it("should fail updating nonexistent user", async () => {
      const result = await service.update("00000000-0000-0000-0000-000000000000", { name: "Nope" });
      expect(result.isFailure).toBe(true);
    });

    it("should reject duplicate email on update", async () => {
      await service.create({ name: "Mike", email: "mike@test.com" });
      const nancy = await service.create({ name: "Nancy", email: "nancy@test.com" });
      const result = await service.update(nancy.value.id, { email: "mike@test.com" });
      expect(result.isFailure).toBe(true);
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      const created = await service.create({ name: "Oscar", email: "oscar@test.com" });
      const result = await service.delete(created.value.id);
      expect(result.isSuccess).toBe(true);
      const after = await service.getById(created.value.id);
      expect(after.isFailure).toBe(true);
    });

    it("should fail deleting nonexistent", async () => {
      const result = await service.delete("00000000-0000-0000-0000-000000000000");
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe("NOT_FOUND");
    });
  });
});
