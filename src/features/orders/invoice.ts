import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";

import { routes } from "@/config/routes";

import type { OrderDetails } from "./types";

function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");
}

function buildPdfDocument(lines: string[]) {
  const content = [
    "BT",
    "/F1 12 Tf",
    "50 792 Td",
    ...lines.flatMap((line, index) => {
      const escaped = escapePdfText(line);

      return index === 0 ? [`(${escaped}) Tj`] : ["0 -16 Td", `(${escaped}) Tj`];
    }),
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    `5 0 obj\n<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream\nendobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export function createOrderNumber(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const suffix = randomBytes(3).toString("hex").toUpperCase();

  return `OD-${year}${month}${day}-${suffix}`;
}

export function createInvoiceNumber(orderNumber: string) {
  return `INV-${orderNumber.replace(/^OD-/, "")}`;
}

export function buildOrderConfirmationUrl(orderNumber: string, accessToken?: string | null) {
  const base = routes.storefront.checkoutConfirmation(orderNumber);

  if (!accessToken) {
    return base;
  }

  const params = new URLSearchParams({ token: accessToken });
  return `${base}?${params.toString()}`;
}

export function buildOrderInvoiceUrl(orderNumber: string, accessToken?: string | null) {
  const base = routes.storefront.orderInvoice(orderNumber);

  if (!accessToken) {
    return base;
  }

  const params = new URLSearchParams({ token: accessToken });
  return `${base}?${params.toString()}`;
}

export function buildInvoicePdf(order: OrderDetails) {
  const placedAt = order.placedAt.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const itemLines = order.items.flatMap((item) => [
    `${item.productName}${item.variantTitle ? ` (${item.variantTitle})` : ""}`,
    `SKU: ${item.sku ?? "N/A"} | Qty: ${item.quantity} | Unit: Rs. ${item.unitPrice.toLocaleString("en-PK")} | Line: Rs. ${item.subtotal.toLocaleString("en-PK")}`,
  ]);

  const address = [
    order.shippingAddress.fullName,
    order.shippingAddress.street1,
    order.shippingAddress.street2,
    `${order.shippingAddress.city}, ${order.shippingAddress.country}`,
    order.shippingAddress.postcode,
    order.shippingAddress.phone,
    order.shippingAddress.email,
  ].filter((value): value is string => Boolean(value));

  const lines = [
    `Invoice ${order.invoiceNumber}`,
    `Order ${order.orderNumber}`,
    `Placed ${placedAt}`,
    `Status ${order.statusLabel}`,
    "",
    "Ship to",
    ...address,
    "",
    "Items",
    ...itemLines,
    "",
    `Subtotal: Rs. ${order.subtotal.toLocaleString("en-PK")}`,
    `Shipping: Rs. ${order.shipping.toLocaleString("en-PK")}`,
    `Total: Rs. ${order.total.toLocaleString("en-PK")}`,
    `Payment: ${order.paymentMethodLabel}`,
  ];

  return buildPdfDocument(lines);
}