import { describe, expect, it } from "vitest";

import { comparePassword, hashPassword } from "../../../src/lib/auth/password";

describe("hashPassword", () => {
  it("returns a bcrypt hash string", async () => {
    const hash = await hashPassword("myplaintextpassword");
    // bcrypt hashes start with $2b$ or $2a$
    expect(hash).toMatch(/^\$2[ab]\$\d+\$/);
  });

  it("produces different hashes for the same input (salt randomness)", async () => {
    const hash1 = await hashPassword("samepassword");
    const hash2 = await hashPassword("samepassword");
    expect(hash1).not.toBe(hash2);
  });
});

describe("comparePassword", () => {
  it("returns true for a matching password", async () => {
    const hash = await hashPassword("correcthorsebatterystaple");
    const match = await comparePassword("correcthorsebatterystaple", hash);
    expect(match).toBe(true);
  });

  it("returns false for a wrong password", async () => {
    const hash = await hashPassword("correcthorsebatterystaple");
    const match = await comparePassword("wrongpassword", hash);
    expect(match).toBe(false);
  });

  it("returns false for an empty string vs a real hash", async () => {
    const hash = await hashPassword("somepassword");
    const match = await comparePassword("", hash);
    expect(match).toBe(false);
  });
});
