import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AppError } from "../../../src/lib/errors/app-error";
import {
  DEFAULT_ERROR_MESSAGE,
  VALIDATION_ERROR_MESSAGE,
} from "../../../src/lib/errors/error-messages";
import {
  createRouteHandlerErrorResponse,
  toActionErrorState,
  toAppError,
} from "../../../src/lib/errors/handling";

describe("safe error handling utilities", () => {
  it("normalizes zod failures into a validation-safe AppError", () => {
    const schema = z.object({
      email: z.email("Enter a valid email address"),
    });

    const result = schema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);

    if (!result.success) {
      const appError = toAppError(result.error);

      expect(appError.code).toBe("VALIDATION_ERROR");
      expect(appError.statusCode).toBe(400);
      expect(appError.userMessage).toBe(VALIDATION_ERROR_MESSAGE);
      expect(appError.exposeMessage).toBe(false);
    }
  });

  it("returns a safe fallback message for unexpected server-action failures", () => {
    expect(toActionErrorState(new Error("database password leaked"), "test-action")).toEqual({
      errors: [DEFAULT_ERROR_MESSAGE],
    });
  });

  it("creates typed route-handler responses with safe status and message", async () => {
    const response = createRouteHandlerErrorResponse(
      new AppError("Forbidden", "FORBIDDEN", {
        statusCode: 403,
      }),
      "orders:create",
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "FORBIDDEN",
      error: "You do not have permission to perform that action.",
    });
  });
});
