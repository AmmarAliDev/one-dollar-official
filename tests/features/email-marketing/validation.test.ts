import { describe, expect, it } from "vitest";

import {
  subscribeInputSchema,
  unsubscribeTokenSchema,
} from "@/features/email-marketing/validation";

describe("subscribeInputSchema", () => {
  it("accepts a valid minimal input", () => {
    const result = subscribeInputSchema.safeParse({
      email: "user@example.com",
      source: "checkout",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.email).toBe("user@example.com");
    expect(result.data.tags).toEqual([]);
  });

  it("accepts all optional fields", () => {
    const result = subscribeInputSchema.safeParse({
      email: "jane@example.com",
      firstName: "Jane",
      source: "newsletter_popup",
      tags: ["newsletter", "restock_alerts"],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.firstName).toBe("Jane");
    expect(result.data.tags).toEqual(["newsletter", "restock_alerts"]);
  });

  it("trims whitespace from email", () => {
    const result = subscribeInputSchema.safeParse({
      email: "  user@example.com  ",
      source: "checkout",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.email).toBe("user@example.com");
  });

  it("rejects an invalid email address", () => {
    const result = subscribeInputSchema.safeParse({
      email: "not-an-email",
      source: "checkout",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty source", () => {
    const result = subscribeInputSchema.safeParse({
      email: "user@example.com",
      source: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a source longer than 64 characters", () => {
    const result = subscribeInputSchema.safeParse({
      email: "user@example.com",
      source: "a".repeat(65),
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 tags", () => {
    const result = subscribeInputSchema.safeParse({
      email: "user@example.com",
      source: "checkout",
      tags: Array.from({ length: 21 }, (_, i) => `tag-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a firstName longer than 100 characters", () => {
    const result = subscribeInputSchema.safeParse({
      email: "user@example.com",
      source: "checkout",
      firstName: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe("unsubscribeTokenSchema", () => {
  it("accepts a valid token", () => {
    const result = unsubscribeTokenSchema.safeParse({ token: "abc123def456" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.token).toBe("abc123def456");
  });

  it("trims whitespace from token", () => {
    const result = unsubscribeTokenSchema.safeParse({ token: "  mytoken  " });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.token).toBe("mytoken");
  });

  it("rejects an empty token", () => {
    const result = unsubscribeTokenSchema.safeParse({ token: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a token over 256 characters", () => {
    const result = unsubscribeTokenSchema.safeParse({ token: "x".repeat(257) });
    expect(result.success).toBe(false);
  });

  it("rejects missing token field", () => {
    const result = unsubscribeTokenSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
