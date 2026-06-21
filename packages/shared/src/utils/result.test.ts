import { describe, expect, it } from "vitest";
import { Result } from "./result";

describe("Result", () => {
  describe("success", () => {
    it("should create a successful result", () => {
      const result = Result.success(42);
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe(42);
    });

    it("should unwrap to the value", () => {
      expect(Result.success("hello").unwrap()).toBe("hello");
    });

    it("unwrapOr returns value on success", () => {
      expect(Result.success(42).unwrapOr(0)).toBe(42);
    });
  });

  describe("failure", () => {
    it("should create a failed result", () => {
      const error = new Error("fail");
      const result = Result.failure(error);
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });

    it("unwrapOr returns default on failure", () => {
      expect(Result.failure(new Error("fail")).unwrapOr(0)).toBe(0);
    });

    it("throws when accessing value on failure", () => {
      expect(() => Result.failure(new Error("fail")).value).toThrow();
    });

    it("throws when accessing error on success", () => {
      expect(() => Result.success(42).error).toThrow();
    });
  });

  describe("map", () => {
    it("should transform value on success", () => {
      const result = Result.success(5).map((x) => x * 2);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(10);
    });

    it("should pass through failure", () => {
      const error = new Error("fail");
      const result = Result.failure(error).map((x: unknown) => x);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe("match", () => {
    it("should call onSuccess for success", () => {
      const out = Result.success("hello").match(
        (v) => `ok:${v}`,
        (e) => `err:${e.message}`,
      );
      expect(out).toBe("ok:hello");
    });

    it("should call onFailure for failure", () => {
      const out = Result.failure(new Error("fail")).match(
        (v) => `ok:${v}`,
        (e) => `err:${e.message}`,
      );
      expect(out).toBe("err:fail");
    });
  });
});
