import { describe, expect, it, vi } from "vitest";

import { createNotificationService, notificationEventTypes } from "@/features/notifications";

describe("notification service contracts", () => {
  it("dispatches notifications through configured channels", async () => {
    const emailSend = vi.fn().mockResolvedValue(undefined);
    const telegramSend = vi.fn().mockResolvedValue(undefined);

    const service = createNotificationService({
      recipients: {
        adminEmails: ["ops@example.com"],
        telegramChatId: "-100123",
      },
      channels: [
        {
          type: "email",
          send: emailSend,
        },
        {
          type: "telegram",
          send: telegramSend,
        },
      ],
    });

    const result = await service.dispatch({
      type: notificationEventTypes.orderNew,
      payload: {
        orderId: "order-1",
        orderNumber: "OD-20260413-ABC123",
        placedAt: new Date("2026-04-13T10:00:00.000Z"),
        customerName: "Ammar Ali",
        customerEmail: "ammar@example.com",
        customerPhone: "+923001112233",
        itemCount: 1,
        subtotal: 1000,
        shipping: 150,
        total: 1150,
        paymentMethodLabel: "Cash on Delivery",
        confirmationUrl: "https://example.com/checkout/confirmation/OD-20260413-ABC123",
        invoiceUrl: "https://example.com/api/orders/OD-20260413-ABC123/invoice",
      },
    });

    expect(result.attempted).toBe(3);
    expect(result.delivered).toBe(3);
    expect(result.failures).toHaveLength(0);
    expect(emailSend).toHaveBeenCalledTimes(2);
    expect(telegramSend).toHaveBeenCalledTimes(1);
  });

  it("captures failures and keeps processing remaining channels", async () => {
    const emailSend = vi
      .fn()
      .mockRejectedValueOnce(new Error("smtp down"))
      .mockResolvedValueOnce(undefined);
    const telegramSend = vi.fn().mockResolvedValue(undefined);

    const service = createNotificationService({
      recipients: {
        adminEmails: ["ops@example.com"],
        telegramChatId: "-100123",
      },
      channels: [
        {
          type: "email",
          send: emailSend,
        },
        {
          type: "telegram",
          send: telegramSend,
        },
      ],
    });

    const result = await service.dispatch({
      type: notificationEventTypes.orderNew,
      payload: {
        orderId: "order-1",
        orderNumber: "OD-20260413-ABC123",
        placedAt: new Date("2026-04-13T10:00:00.000Z"),
        customerName: "Ammar Ali",
        customerEmail: "ammar@example.com",
        customerPhone: "+923001112233",
        itemCount: 1,
        subtotal: 1000,
        shipping: 150,
        total: 1150,
        paymentMethodLabel: "Cash on Delivery",
        confirmationUrl: "https://example.com/checkout/confirmation/OD-20260413-ABC123",
        invoiceUrl: "https://example.com/api/orders/OD-20260413-ABC123/invoice",
      },
    });

    expect(result.attempted).toBe(3);
    expect(result.delivered).toBe(2);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]?.reason).toContain("smtp down");
  });
});
