import type {
  NotificationDelivery,
  NotificationEvent,
  NotificationMessage,
  NotificationPlan,
  NotificationRecipients,
} from "./contracts";

function formatPkr(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function formatOrderDate(placedAt: Date) {
  return placedAt.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildOrderNewAdminMessage(
  event: Extract<NotificationEvent, { type: "order.new" }>,
): NotificationMessage {
  const { payload } = event;

  return {
    subject: `[New Order] ${payload.orderNumber}`,
    text: [
      `Order ${payload.orderNumber} has been placed.`,
      `Placed: ${formatOrderDate(payload.placedAt)}`,
      `Customer: ${payload.customerName}`,
      `Email: ${payload.customerEmail ?? "n/a"}`,
      `Phone: ${payload.customerPhone ?? "n/a"}`,
      `Items: ${payload.itemCount}`,
      `Payment: ${payload.paymentMethodLabel}`,
      `Subtotal: ${formatPkr(payload.subtotal)}`,
      `Shipping: ${formatPkr(payload.shipping)}`,
      `Total: ${formatPkr(payload.total)}`,
      `Confirmation: ${payload.confirmationUrl}`,
    ].join("\n"),
  };
}

function buildOrderNewCustomerMessage(
  event: Extract<NotificationEvent, { type: "order.new" }>,
): NotificationMessage {
  const { payload } = event;

  return {
    subject: `Order Received: ${payload.orderNumber}`,
    text: [
      `Hi ${payload.customerName},`,
      "",
      `Thanks for your order. We have received ${payload.orderNumber}.`,
      `Total: ${formatPkr(payload.total)}`,
      `Payment: ${payload.paymentMethodLabel}`,
      `Track confirmation: ${payload.confirmationUrl}`,
      `Invoice link: ${payload.invoiceUrl}`,
      "",
      "We will notify you when your order is confirmed.",
    ].join("\n"),
  };
}

function buildOrderConfirmedAdminMessage(
  event: Extract<NotificationEvent, { type: "order.confirmed" }>,
): NotificationMessage {
  const { payload } = event;

  return {
    subject: `[Order Confirmed] ${payload.orderNumber}`,
    text: [
      `Order ${payload.orderNumber} is now confirmed.`,
      `Customer: ${payload.customerName}`,
      `Email: ${payload.customerEmail ?? "n/a"}`,
      `Total: ${formatPkr(payload.total)}`,
      `Confirmation: ${payload.confirmationUrl}`,
    ].join("\n"),
  };
}

function buildOrderConfirmedCustomerMessage(
  event: Extract<NotificationEvent, { type: "order.confirmed" }>,
): NotificationMessage {
  const { payload } = event;

  return {
    subject: `Order Confirmed: ${payload.orderNumber}`,
    text: [
      `Hi ${payload.customerName},`,
      "",
      `Your order ${payload.orderNumber} has been confirmed.`,
      `Total: ${formatPkr(payload.total)}`,
      `Confirmation page: ${payload.confirmationUrl}`,
      `Invoice link: ${payload.invoiceUrl}`,
      "",
      "Thanks for shopping with us.",
    ].join("\n"),
  };
}

function buildLowStockAdminMessage(
  event: Extract<NotificationEvent, { type: "inventory.low-stock" }>,
): NotificationMessage {
  const { payload } = event;

  return {
    subject: `Low Stock Alert: ${payload.sku}`,
    text: [
      "Inventory alert placeholder event fired.",
      `SKU: ${payload.sku}`,
      `Product: ${payload.productName ?? "n/a"}`,
      `Available: ${payload.availableQuantity}`,
      `Threshold: ${payload.threshold}`,
    ].join("\n"),
  };
}

function buildContactAdminMessage(
  event: Extract<NotificationEvent, { type: "contact.form-submitted" }>,
): NotificationMessage {
  const { payload } = event;

  return {
    subject: `Contact: ${payload.subject}`,
    text: [
      "Contact form placeholder event fired.",
      `Name: ${payload.fullName}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      `Preview: ${payload.messagePreview}`,
    ].join("\n"),
  };
}

function pushAdminDeliveries(
  deliveries: NotificationDelivery[],
  message: NotificationMessage,
  recipients: NotificationRecipients,
) {
  if (recipients.adminEmails.length > 0) {
    deliveries.push({
      channel: "email",
      audience: "admin",
      recipient: recipients.adminEmails,
      message,
    });
  }

  if (recipients.telegramChatId) {
    deliveries.push({
      channel: "telegram",
      audience: "admin",
      recipient: recipients.telegramChatId,
      message,
    });
  }
}

export function buildNotificationPlan(
  event: NotificationEvent,
  recipients: NotificationRecipients,
): NotificationPlan {
  const deliveries: NotificationDelivery[] = [];

  switch (event.type) {
    case "order.new": {
      const adminMessage = buildOrderNewAdminMessage(event);
      pushAdminDeliveries(deliveries, adminMessage, recipients);

      if (event.payload.customerEmail) {
        deliveries.push({
          channel: "email",
          audience: "customer",
          recipient: event.payload.customerEmail,
          message: buildOrderNewCustomerMessage(event),
        });
      }

      return {
        eventType: event.type,
        deliveries,
      };
    }

    case "order.confirmed": {
      const adminMessage = buildOrderConfirmedAdminMessage(event);
      pushAdminDeliveries(deliveries, adminMessage, recipients);

      if (event.payload.customerEmail) {
        deliveries.push({
          channel: "email",
          audience: "customer",
          recipient: event.payload.customerEmail,
          message: buildOrderConfirmedCustomerMessage(event),
        });
      }

      return {
        eventType: event.type,
        deliveries,
      };
    }

    case "inventory.low-stock": {
      pushAdminDeliveries(deliveries, buildLowStockAdminMessage(event), recipients);

      return {
        eventType: event.type,
        deliveries,
      };
    }

    case "contact.form-submitted": {
      pushAdminDeliveries(deliveries, buildContactAdminMessage(event), recipients);

      return {
        eventType: event.type,
        deliveries,
      };
    }
  }
}
