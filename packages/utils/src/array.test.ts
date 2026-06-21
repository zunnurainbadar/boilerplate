import { describe, expect, it } from "vitest";
import { chunk, first, groupBy, last, range, shuffle, unique } from "./array";

describe("chunk", () => {
  it("should split array into chunks of given size", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("should return empty array for empty input", () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it("should return empty array for invalid size", () => {
    expect(chunk([1, 2, 3], 0)).toEqual([]);
    expect(chunk([1, 2, 3], -1)).toEqual([]);
  });
});

describe("unique", () => {
  it("should remove duplicate values", () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it("should handle empty array", () => {
    expect(unique([])).toEqual([]);
  });
});

describe("shuffle", () => {
  it("should return array with same length", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(arr.length);
  });

  it("should contain all original elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it("should not mutate original array", () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });
});

describe("groupBy", () => {
  it("should group by key", () => {
    const items = [
      { type: "a", value: 1 },
      { type: "b", value: 2 },
      { type: "a", value: 3 },
    ];
    const result = groupBy(items, (x) => x.type);
    expect(result).toEqual({
      a: [
        { type: "a", value: 1 },
        { type: "a", value: 3 },
      ],
      b: [{ type: "b", value: 2 }],
    });
  });

  it("should return empty object for empty array", () => {
    expect(groupBy([], (x) => x)).toEqual({});
  });
});

describe("range", () => {
  it("should generate range of numbers", () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("should handle single number range", () => {
    expect(range(3, 3)).toEqual([3]);
  });
});

describe("first / last", () => {
  it("should return first element", () => {
    expect(first([1, 2, 3])).toBe(1);
    expect(first([])).toBeUndefined();
  });

  it("should return last element", () => {
    expect(last([1, 2, 3])).toBe(3);
    expect(last([])).toBeUndefined();
  });
});
