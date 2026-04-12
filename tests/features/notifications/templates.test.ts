import { describe, expect, it } from "vitest";

import { buildNotificationPlan, notificationEventTypes } from "@/features/notifications";

const recipients = {
  adminEmails: ["ops@example.com"],
  telegramChatId: "-100123456",
};

describe("notification templates", () => {
  it("builds order.new payloads for admin email + telegram and customer email", () => {
    const plan = buildNotificationPlan(
      {
        type: notificationEventTypes.orderNew,
        payload: {
          orderId: "order-1",
          orderNumber: "OD-20260413-ABC123",
          placedAt: new Date("2026-04-13T10:00:00.000Z"),
          customerName: "Ammar Ali",
          customerEmail: "ammar@example.com",
          customerPhone: "+923001112233",
          itemCount: 3,
          subtotal: 5000,
          shipping: 150,
          total: 5150,
          paymentMethodLabel: "Cash on Delivery",
          confirmationUrl: "https://example.com/checkout/confirmation/OD-20260413-ABC123",
          invoiceUrl: "https://example.com/api/orders/OD-20260413-ABC123/invoice",
        },
      },
      recipients,
    );

    expect(plan.deliveries).toHaveLength(3);
    expect(plan.deliveries.map((entry) => `${entry.channel}:${entry.audience}`)).toEqual([
      "email:admin",
      "telegram:admin",
      "email:customer",
    ]);
  });

  it("builds order.confirmed payloads for admin and customer", () => {
    const plan = buildNotificationPlan(
      {
        type: notificationEventTypes.orderConfirmed,
        payload: {
          orderId: "order-1",
          orderNumber: "OD-20260413-ABC123",
          placedAt: new Date("2026-04-13T10:00:00.000Z"),
          customerName: "Ammar Ali",
          customerEmail: "ammar@example.com",
          customerPhone: "+923001112233",
          itemCount: 3,
          subtotal: 5000,
          shipping: 150,
          total: 5150,
          paymentMethodLabel: "Cash on Delivery",
          confirmationUrl: "https://example.com/checkout/confirmation/OD-20260413-ABC123",
          invoiceUrl: "https://example.com/api/orders/OD-20260413-ABC123/invoice",
        },
      },
      recipients,
    );

    expect(plan.deliveries).toHaveLength(3);
  });

  it("builds low stock placeholder admin alerts", () => {
    const plan = buildNotificationPlan(
      {
        type: notificationEventTypes.inventoryLowStock,
        payload: {
          sku: "UWD-2KG-001",
          productName: "Ultra Wash Detergent",
          availableQuantity: 2,
          threshold: 5,
        },
      },
      recipients,
    );

    expect(plan.deliveries).toHaveLength(2);
    expect(plan.deliveries.every((entry) => entry.audience === "admin")).toBe(true);
  });

  it("builds contact form placeholder admin alerts", () => {
    const plan = buildNotificationPlan(
      {
        type: notificationEventTypes.contactFormSubmitted,
        payload: {
          fullName: "Ammar Ali",
          email: "ammar@example.com",
          subject: "Need product availability",
          messagePreview: "Do you have this in stock?",
        },
      },
      recipients,
    );

    expect(plan.deliveries).toHaveLength(2);
    expect(plan.deliveries.every((entry) => entry.audience === "admin")).toBe(true);
  });
});
