import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  createPasswordSchema,
  emailAddressSchema,
  optionalDisplayNameSchema,
  validateWithSchema,
} from "../../../src/lib/security/validation";

describe("security validation helpers", () => {
  it("trims email input before validation succeeds", () => {
    const result = validateWithSchema(
      z.object({
        email: emailAddressSchema,
      }),
      {
        email: "  user@example.com  ",
      },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("treats blank display names as optional but rejects too-short names", () => {
    expect(optionalDisplayNameSchema.safeParse("   ").success).toBe(true);
    expect(optionalDisplayNameSchema.safeParse("A").success).toBe(false);
  });

  it("returns friendly issue messages for invalid payloads", () => {
    const schema = z.object({
      email: emailAddressSchema,
      password: createPasswordSchema(),
    });

    const result = validateWithSchema(schema, {
      email: "bad-email",
      password: "123",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.errors).toContain("Please enter a valid email address.");
      expect(result.errors).toContain("Password must be at least 8 characters.");
    }
  });
});
