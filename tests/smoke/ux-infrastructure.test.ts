import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { FormErrorSummary } from "../../src/components/ui/form-error-summary";
import { PageErrorFallback } from "../../src/components/ui/page-error-fallback";
import { AppError } from "../../src/lib/errors/app-error";
import {
  DEFAULT_ERROR_MESSAGE,
  getFormErrorMessages,
  NETWORK_ERROR_MESSAGE,
  toUserMessage,
} from "../../src/lib/errors/error-messages";
import { sanitizeForLogging } from "../../src/lib/logger";

describe("shared UX infrastructure", () => {
  it("keeps unexpected internal errors out of user-facing messages", () => {
    expect(toUserMessage(new Error("database connection failed"))).toBe(DEFAULT_ERROR_MESSAGE);
    expect(toUserMessage(new Error("Failed to fetch inventory"))).toBe(NETWORK_ERROR_MESSAGE);
    expect(toUserMessage(new AppError("Please sign in to continue", "AUTH_REQUIRED"))).toBe(
      "Please sign in to continue",
    );
  });

  it("extracts friendly form messages from validation errors", () => {
    const schema = z.object({
      email: z.string().email("Enter a valid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    });

    const result = schema.safeParse({ email: "bad", password: "123" });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getFormErrorMessages(result.error)).toEqual([
        "Enter a valid email address",
        "Password must be at least 8 characters",
      ]);
    }
  });

  it("redacts sensitive data before writing logs", () => {
    expect(
      sanitizeForLogging({
        password: "secret",
        token: "abc123",
        codeVerifier: "verifier-value",
        nested: {
          authorization: "Bearer 123",
        },
        bearer: "Bearer test-token",
        error: new Error("Unexpected failure"),
      }),
    ).toEqual({
      password: "[REDACTED]",
      token: "[REDACTED]",
      codeVerifier: "[REDACTED]",
      nested: {
        authorization: "[REDACTED]",
      },
      bearer: "[REDACTED]",
      error: {
        name: "Error",
        message: "Unexpected failure",
      },
    });
  });

  it("renders reusable page and form fallbacks with safe copy", () => {
    const fallbackMarkup = renderToStaticMarkup(
      PageErrorFallback({
        error: new Error("raw stack detail"),
        title: "We could not load this area",
      }),
    );

    const summaryMarkup = renderToStaticMarkup(
      FormErrorSummary({
        errors: ["Email is required", "Password is required"],
      }),
    );

    expect(fallbackMarkup).toContain(DEFAULT_ERROR_MESSAGE);
    expect(fallbackMarkup).not.toContain("raw stack detail");
    expect(summaryMarkup).toContain("Please fix the following");
    expect(summaryMarkup).toContain("Email is required");
  });
});
