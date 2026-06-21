import { describe, expect, it } from "vitest";
import { capitalize, isEmpty, isNotEmpty, slugify, toTitleCase, truncate } from "./string";

describe("capitalize", () => {
  it("should capitalize the first letter and lowercase the rest", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("HELLO")).toBe("Hello");
    expect(capitalize("hELLO")).toBe("Hello");
  });

  it("should handle single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("should return empty string for empty input", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("truncate", () => {
  it("should truncate long strings", () => {
    expect(truncate("Hello World", 8)).toBe("Hello...");
  });

  it("should not truncate short strings", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("should handle empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("should use custom suffix", () => {
    expect(truncate("Hello World", 9, "…")).toBe("Hello Wo…");
  });
});

describe("slugify", () => {
  it("should convert to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(slugify("Hello! @World #2024")).toBe("hello-world-2024");
  });

  it("should collapse multiple hyphens", () => {
    expect(slugify("Hello---World")).toBe("hello-world");
  });

  it("should trim leading/trailing hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });
});

describe("toTitleCase", () => {
  it("should convert to title case", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
    expect(toTitleCase("HELLO WORLD")).toBe("Hello World");
  });

  it("should handle single word", () => {
    expect(toTitleCase("hello")).toBe("Hello");
  });
});

describe("isEmpty / isNotEmpty", () => {
  it("should detect empty strings", () => {
    expect(isEmpty("")).toBe(true);
    expect(isEmpty("   ")).toBe(true);
    expect(isEmpty("hello")).toBe(false);
  });

  it("should detect non-empty strings", () => {
    expect(isNotEmpty("hello")).toBe(true);
    expect(isNotEmpty("")).toBe(false);
    expect(isNotEmpty("   ")).toBe(false);
  });
});
