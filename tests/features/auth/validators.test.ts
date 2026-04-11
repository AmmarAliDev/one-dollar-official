import { describe, expect, it } from "vitest";

import {
  forgotPasswordValidator,
  signInValidator,
  signUpValidator,
} from "../../../src/features/auth/validators";

// ── signInValidator ──────────────────────────────────────────────────────────

describe("signInValidator", () => {
  it("accepts valid email and password", () => {
    const result = signInValidator.safeParse({
      email: "user@example.com",
      password: "correct-password",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = signInValidator.safeParse({ email: "", password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => /email/i.test(m))).toBe(true);
    }
  });

  it("rejects invalid email format", () => {
    const result = signInValidator.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => /valid email/i.test(m))).toBe(true);
    }
  });

  it("rejects missing password", () => {
    const result = signInValidator.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => /password/i.test(m))).toBe(true);
    }
  });

  it("trims whitespace from email before validation", () => {
    const result = signInValidator.safeParse({
      email: "  user@example.com  ",
      password: "correct-password",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });
});

// ── signUpValidator ──────────────────────────────────────────────────────────

describe("signUpValidator", () => {
  const valid = {
    name: "Ali Khan",
    email: "ali@example.com",
    password: "securepass123",
    confirmPassword: "securepass123",
  };

  it("accepts valid full sign-up data", () => {
    const result = signUpValidator.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts sign-up without a name", () => {
    const result = signUpValidator.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(true);
  });

  it("rejects passwords that do not match", () => {
    const result = signUpValidator.safeParse({ ...valid, confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => /do not match/i.test(m))).toBe(true);
    }
  });

  it("rejects passwords shorter than 8 characters", () => {
    const result = signUpValidator.safeParse({
      ...valid,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => /at least 8/i.test(m))).toBe(true);
    }
  });

  it("rejects invalid email format", () => {
    const result = signUpValidator.safeParse({ ...valid, email: "bad-email" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from email", () => {
    const result = signUpValidator.safeParse({ ...valid, email: " ali@example.com " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ali@example.com");
    }
  });
});

// ── forgotPasswordValidator ───────────────────────────────────────────────────

describe("forgotPasswordValidator", () => {
  it("accepts a valid email", () => {
    const result = forgotPasswordValidator.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordValidator.safeParse({ email: "notanemail" });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = forgotPasswordValidator.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});
