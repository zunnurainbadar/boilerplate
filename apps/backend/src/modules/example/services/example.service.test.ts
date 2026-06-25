import { beforeEach, describe, expect, it } from "vitest";
import { ExampleRepository } from "../repositories/example.repository";
import { ExampleService } from "./example.service";

describe("ExampleService", () => {
  let service: ExampleService;

  beforeEach(() => {
    service = new ExampleService(new ExampleRepository());
  });

  describe("create", () => {
    it("should create an example with valid data", async () => {
      const result = await service.create({ name: "Test", description: "A test example" });
      expect(result.isSuccess).toBe(true);
      expect(result.value.name).toBe("Test");
      expect(result.value.id).toBeDefined();
    });

    it("should fail with empty name", async () => {
      const result = await service.create({ name: "", description: "desc" });
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with whitespace-only name", async () => {
      const result = await service.create({ name: "   ", description: "desc" });
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("getById", () => {
    it("should return created example", async () => {
      const created = await service.create({ name: "FindMe", description: "desc" });
      const found = await service.getById(created.value.id);
      expect(found.isSuccess).toBe(true);
      expect(found.value.name).toBe("FindMe");
    });

    it("should return not found for missing id", async () => {
      const result = await service.getById("00000000-0000-0000-0000-000000000000");
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  describe("getAll", () => {
    it("should return all examples", async () => {
      await service.create({ name: "A", description: "desc" });
      await service.create({ name: "B", description: "desc" });
      const result = await service.getAll();
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(2);
    });

    it("should return empty array when no examples", async () => {
      const svc = new ExampleService(new ExampleRepository());
      const result = await svc.getAll();
      expect(result.isSuccess).toBe(true);
      expect(result.value).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should update name", async () => {
      const created = await service.create({ name: "Old", description: "old desc" });
      const updated = await service.update(created.value.id, { name: "New" });
      expect(updated.isSuccess).toBe(true);
      expect(updated.value.name).toBe("New");
      expect(updated.value.description).toBe("old desc");
    });

    it("should fail updating nonexistent", async () => {
      const result = await service.update("00000000-0000-0000-0000-000000000000", { name: "N" });
      expect(result.isFailure).toBe(true);
    });
  });

  describe("delete", () => {
    it("should delete existing", async () => {
      const created = await service.create({ name: "Temp", description: "desc" });
      const result = await service.delete(created.value.id);
      expect(result.isSuccess).toBe(true);
    });

    it("should fail deleting nonexistent", async () => {
      const result = await service.delete("00000000-0000-0000-0000-000000000000");
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe("NOT_FOUND");
    });
  });
});
