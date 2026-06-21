import { describe, expect, it } from "vitest";
import { AppError, NotFoundError, UnauthorizedError, ValidationError } from "./app-error";

describe("AppError", () => {
  it("should create with defaults", () => {
    const err = new AppError("Boom");
    expect(err.message).toBe("Boom");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
  });

  it("should create with custom status/code", () => {
    const err = new AppError("Bad", 400, "BAD");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD");
  });

  it("should serialize to JSON", () => {
    expect(new AppError("NF", 404, "NF").toJSON()).toEqual({
      error: { message: "NF", code: "NF", statusCode: 404 },
    });
  });
});

describe("NotFoundError", () => {
  it("should format with id", () => {
    const err = new NotFoundError("User", "1");
    expect(err.message).toBe("User with id '1' not found");
    expect(err.statusCode).toBe(404);
  });

  it("should format without id", () => {
    expect(new NotFoundError("Users").message).toBe("Users not found");
  });

  it("should extend AppError", () => {
    expect(new NotFoundError("X")).toBeInstanceOf(AppError);
  });
});

describe("ValidationError", () => {
  it("should be 400 by default", () => {
    expect(new ValidationError("Nope").statusCode).toBe(400);
  });
});

describe("UnauthorizedError", () => {
  it("should default to 401", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });
});
