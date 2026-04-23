import { describe, expect, it } from "vitest";

import { maskEmail, stripControlChars } from "@/lib/security/pii";

describe("maskEmail", () => {
  it("masks a standard email address", () => {
    expect(maskEmail("user@example.com")).toBe("u***@example.com");
  });

  it("handles a single-character local part", () => {
    expect(maskEmail("a@example.com")).toBe("a***@example.com");
  });

  it("handles a multi-character local part", () => {
    expect(maskEmail("johndoe@example.com")).toBe("j***@example.com");
  });

  it("returns '***@***' for a string with no @ sign", () => {
    expect(maskEmail("notanemail")).toBe("***@***");
  });

  it("returns '***@***' for an empty string", () => {
    expect(maskEmail("")).toBe("***@***");
  });

  it("returns '***@***' when @ is at position 0", () => {
    expect(maskEmail("@domain.com")).toBe("***@***");
  });

  it("preserves the domain portion", () => {
    const result = maskEmail("someone@subdomain.example.org");
    expect(result).toBe("s***@subdomain.example.org");
  });
});

describe("stripControlChars", () => {
  it("removes CR and LF characters (log injection prevention)", () => {
    expect(stripControlChars("user\r\n@example.com")).toBe("user@example.com");
  });

  it("removes null bytes", () => {
    expect(stripControlChars("user\x00name")).toBe("username");
  });

  it("removes C1 control characters", () => {
    expect(stripControlChars("abc\x85def")).toBe("abcdef");
  });

  it("leaves normal text unchanged", () => {
    expect(stripControlChars("hello world 123")).toBe("hello world 123");
  });

  it("leaves an empty string unchanged", () => {
    expect(stripControlChars("")).toBe("");
  });
});
