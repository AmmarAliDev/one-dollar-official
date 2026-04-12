import { describe, expect, it } from "vitest";

import {
  buildInvoicePdf,
  buildOrderConfirmationUrl,
  buildOrderInvoiceUrl,
  createInvoiceNumber,
  createOrderNumber,
} from "@/features/orders";

describe("order invoice utilities", () => {
  it("builds deterministic confirmation and invoice URLs", () => {
    expect(buildOrderConfirmationUrl("OD-20260413-ABC123", "token-1")).toBe(
      "/checkout/confirmation/OD-20260413-ABC123?token=token-1",
    );
    expect(buildOrderInvoiceUrl("OD-20260413-ABC123", "token-1")).toBe(
      "/api/orders/OD-20260413-ABC123/invoice?token=token-1",
    );
  });

  it("creates order and invoice numbers in the expected format", () => {
    const orderNumber = createOrderNumber(new Date("2026-04-13T10:00:00.000Z"));

    expect(orderNumber).toMatch(/^OD-20260413-[A-F0-9]{6}$/);
    expect(createInvoiceNumber("OD-20260413-ABC123")).toBe("INV-20260413-ABC123");
  });

  it("renders a minimal PDF payload for invoice downloads", () => {
    const pdf = buildInvoicePdf({
      id: "order-1",
      userId: null,
      orderNumber: "OD-20260413-ABC123",
      invoiceNumber: "INV-20260413-ABC123",
      status: "PENDING",
      statusLabel: "Pending",
      placedAt: new Date("2026-04-13T10:00:00.000Z"),
      subtotal: 1000,
      shipping: 150,
      total: 1150,
      paymentMethod: "COD",
      paymentMethodLabel: "Cash on Delivery",
      paymentStatus: "pending",
      confirmationAccessToken: "token-1",
      items: [
        {
          id: "item-1",
          productName: "Ultra Wash Detergent",
          variantTitle: "2 kg",
          sku: "UWD-2KG-001",
          quantity: 1,
          unitPrice: 1000,
          subtotal: 1000,
        },
      ],
      shippingAddress: {
        fullName: "Ammar Ali",
        phone: "+923001112233",
        email: "ammar@example.com",
        street1: "House 1, Street 2",
        street2: null,
        city: "Karachi",
        province: "Sindh",
        country: "Pakistan",
        postcode: "75400",
        notes: null,
      },
    });

    const pdfText = pdf.toString("utf8");

    expect(pdfText.startsWith("%PDF-1.4")).toBe(true);
    expect(pdfText).toContain("Invoice INV-20260413-ABC123");
    expect(pdfText).toContain("Order OD-20260413-ABC123");
  });
});