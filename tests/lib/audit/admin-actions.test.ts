import { describe, expect, it, vi } from "vitest";

// Mock the logger to prevent actual log output during tests
vi.mock("@/lib/logger", () => ({
  logger: {
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
  sanitizeForLogging: vi.fn((value: unknown) => value),
}));

import {
  adminAuditStatuses,
  createAdminAuditEntry,
  logAdminAction,
  toAdminAuditLogData,
} from "@/lib/audit/admin-actions";

describe("adminAuditStatuses", () => {
  it("contains all three status values", () => {
    expect(adminAuditStatuses).toEqual(
      expect.arrayContaining(["attempt", "success", "failure"]),
    );
  });
});

describe("createAdminAuditEntry", () => {
  it("creates an entry with required fields", () => {
    const entry = createAdminAuditEntry({ action: "product.create" });

    expect(entry.action).toBe("product.create");
    expect(entry.status).toBe("attempt"); // default
    expect(entry.actorId).toBeNull();
    expect(entry.actorRole).toBeNull();
    expect(entry.model).toBeNull();
    expect(entry.modelId).toBeNull();
    expect(entry.summary).toBeNull();
    expect(entry.metadata).toBeNull();
    expect(entry.error).toBeNull();
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it("throws when action is empty", () => {
    expect(() => createAdminAuditEntry({ action: "" })).toThrow(
      "Admin audit actions require a non-empty action name.",
    );
  });

  it("throws when action is only whitespace", () => {
    expect(() => createAdminAuditEntry({ action: "   " })).toThrow(
      "Admin audit actions require a non-empty action name.",
    );
  });

  it("trims the action string", () => {
    const entry = createAdminAuditEntry({ action: "  product.update  " });
    expect(entry.action).toBe("product.update");
  });

  it("carries optional fields when provided", () => {
    const entry = createAdminAuditEntry({
      action: "order.cancel",
      actorId: "user-123",
      actorRole: "SUPER_ADMIN",
      targetType: "Order",
      targetId: "order-456",
      status: "success",
      summary: "Cancelled by admin",
      metadata: { reason: "duplicate" },
    });

    expect(entry.actorId).toBe("user-123");
    expect(entry.actorRole).toBe("SUPER_ADMIN");
    expect(entry.model).toBe("Order");
    expect(entry.modelId).toBe("order-456");
    expect(entry.status).toBe("success");
    expect(entry.summary).toBe("Cancelled by admin");
    expect(entry.metadata).toMatchObject({ reason: "duplicate" });
  });

  it("normalizes unknown roles to null", () => {
    const entry = createAdminAuditEntry({ action: "test", actorRole: "NOT_A_REAL_ROLE" });
    expect(entry.actorRole).toBeNull();
  });

  it("trims whitespace-only targetType to null", () => {
    const entry = createAdminAuditEntry({ action: "test", targetType: "  " });
    expect(entry.model).toBeNull();
  });

  it("trims whitespace-only summary to null", () => {
    const entry = createAdminAuditEntry({ action: "test", summary: "  " });
    expect(entry.summary).toBeNull();
  });
});

describe("toAdminAuditLogData", () => {
  it("converts an entry into the Prisma AuditLog shape", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const entry = {
      actorId: "user-1",
      actorRole: "SUPER_ADMIN" as const,
      action: "product.create",
      model: "Product",
      modelId: "product-1",
      status: "success" as const,
      summary: "Created a new product",
      metadata: { sku: "ABC-001" },
      error: null,
      createdAt: now,
    };

    const data = toAdminAuditLogData(entry);

    expect(data.actorId).toBe("user-1");
    expect(data.action).toBe("product.create");
    expect(data.model).toBe("Product");
    expect(data.modelId).toBe("product-1");
    expect(data.createdAt).toBe(now);
    expect(data.changes).toMatchObject({
      actorRole: "SUPER_ADMIN",
      status: "success",
      summary: "Created a new product",
      metadata: { sku: "ABC-001" },
      error: null,
    });
  });
});

describe("logAdminAction", () => {
  it("creates, logs, and returns an entry", () => {
    const entry = logAdminAction({ action: "category.delete", status: "success" });

    expect(entry.action).toBe("category.delete");
    expect(entry.status).toBe("success");
  });
});
