import { describe, expect, it } from "vitest";

import {
  buildAdminActivityFeedItem,
  mapAuditLogSummary,
  mapAuditLogTitle,
} from "@/features/admin/activity/audit-log-feed";

describe("admin activity audit-log mapping", () => {
  it("maps known actions into non-technical titles", () => {
    expect(mapAuditLogTitle("order.status.changed")).toBe("Order status updated");
    expect(mapAuditLogTitle("homepage.banner.updated")).toBe("Homepage banner updated");
    expect(mapAuditLogTitle("homepage.banner.deleted")).toBe("Homepage banner deleted");
  });

  it("builds meaningful order and moderation summaries", () => {
    expect(
      mapAuditLogSummary({
        action: "order.status.changed",
        model: "Order",
        changes: {
          from: "PENDING",
          to: "CONFIRMED",
        },
      }),
    ).toBe("Status changed from Pending to Confirmed.");

    expect(
      mapAuditLogSummary({
        action: "review.moderated",
        model: "Review",
        changes: {
          productName: "Classic Tee",
          beforeStatus: "PENDING",
          afterStatus: "APPROVED",
        },
      }),
    ).toBe("Review for Classic Tee changed from Pending to Approved.");
  });

  it("falls back cleanly when change payloads are sparse", () => {
    expect(
      mapAuditLogSummary({
        action: "unknown.system.event",
        model: "Order",
        changes: null,
      }),
    ).toBe("Order activity was recorded.");
  });

  it("adds actor context when building feed items", () => {
    const item = buildAdminActivityFeedItem(
      {
        id: "audit-1",
        actorId: "user-1",
        action: "product.updated",
        model: "Product",
        modelId: "product-1",
        changes: {
          after: {
            title: "Classic Tee",
          },
        },
        createdAt: new Date("2026-04-24T15:00:00.000Z"),
      },
      new Map([
        [
          "user-1",
          {
            id: "user-1",
            name: "Admin User",
            email: "admin@example.com",
          },
        ],
      ]),
    );

    expect(item).toMatchObject({
      title: "Product updated",
      summary: "Classic Tee product details were updated.",
      actor: {
        label: "Admin User",
        email: "admin@example.com",
      },
      modelLabel: "Product",
    });
  });
});
