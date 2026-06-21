import { Result } from "@ai-boilerplate/shared";
import { capitalize, chunk, pick } from "@ai-boilerplate/utils";
import { describe, expect, it } from "vitest";

describe("package integration smoke tests", () => {
  it("capitalize from utils works", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("chunk from utils works", () => {
    expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
  });

  it("pick from utils works", () => {
    expect(pick({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });
  });

  it("Result from shared works", () => {
    const result = Result.success("works");
    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe("works");
  });
});
