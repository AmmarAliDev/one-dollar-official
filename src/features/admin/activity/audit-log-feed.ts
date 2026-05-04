import type { Prisma } from "@prisma/client";

type AuditActorProfile = {
  id: string;
  name: string | null;
  email: string | null;
};

export type AdminActivityActorContext = {
  id: string | null;
  label: string;
  email: string | null;
  isSystem: boolean;
};

export type AdminActivityFeedItem = {
  id: string;
  action: string;
  title: string;
  summary: string;
  createdAt: Date;
  model: string | null;
  modelId: string | null;
  modelLabel: string | null;
  actor: AdminActivityActorContext;
};

export type AuditLogActivityRecord = {
  id: string;
  actorId: string | null;
  action: string;
  model: string | null;
  modelId: string | null;
  changes: Prisma.JsonValue | null;
  createdAt: Date;
};

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, Prisma.JsonValue> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Prisma.JsonValue>;
}

function readRecord(value: Prisma.JsonValue | null | undefined, key: string) {
  const record = asRecord(value);
  const nested = record[key];

  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return {};
  }

  return nested as Record<string, Prisma.JsonValue>;
}

function readString(record: Record<string, Prisma.JsonValue>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toLabel(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return "Unknown";
  }

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getEntityLabel(changes: Prisma.JsonValue | null) {
  const root = asRecord(changes);
  const before = readRecord(changes, "before");
  const after = readRecord(changes, "after");

  return (
    readString(after, "title") ??
    readString(after, "name") ??
    readString(before, "title") ??
    readString(before, "name") ??
    readString(root, "productName") ??
    readString(root, "orderNumber")
  );
}

function getActorContext(actorId: string | null, actorById: Map<string, AuditActorProfile>): AdminActivityActorContext {
  if (!actorId) {
    return {
      id: null,
      label: "System",
      email: null,
      isSystem: true,
    };
  }

  const actor = actorById.get(actorId);

  if (!actor) {
    return {
      id: actorId,
      label: "Team member",
      email: null,
      isSystem: false,
    };
  }

  return {
    id: actorId,
    label: actor.name?.trim() || actor.email?.trim() || "Team member",
    email: actor.email,
    isSystem: false,
  };
}

export function mapAuditLogTitle(action: string) {
  switch (action) {
    case "order.created":
      return "Order created";
    case "order.reordered":
      return "Order reordered";
    case "order.status.changed":
      return "Order status updated";
    case "order.internal_note.updated":
      return "Order note updated";
    case "category.created":
      return "Category created";
    case "category.updated":
      return "Category updated";
    case "category.deleted":
      return "Category deleted";
    case "product.created":
      return "Product created";
    case "product.updated":
      return "Product updated";
    case "inventory.adjusted":
      return "Inventory adjusted";
    case "review.moderated":
      return "Review moderated";
    case "homepage.section.created":
      return "Homepage section created";
    case "homepage.section.updated":
      return "Homepage section updated";
    case "homepage.banner.created":
      return "Homepage banner created";
    case "homepage.banner.updated":
      return "Homepage banner updated";
    case "homepage.banner.deleted":
      return "Homepage banner deleted";
    case "homepage.campaign.created":
      return "Homepage campaign created";
    case "homepage.campaign.updated":
      return "Homepage campaign updated";
    default:
      return toLabel(action.replaceAll(".", " "));
  }
}

export function mapAuditLogSummary(entry: Pick<AuditLogActivityRecord, "action" | "model" | "changes">) {
  const changes = asRecord(entry.changes);

  if (entry.action === "order.created") {
    const orderNumber = readString(changes, "orderNumber");
    return orderNumber ? `Order ${orderNumber} was added to the queue.` : "A new order was added to the queue.";
  }

  if (entry.action === "order.reordered") {
    const orderNumber = readString(changes, "orderNumber");
    return orderNumber
      ? `Order ${orderNumber} was reordered into an active cart.`
      : "A previous order was reordered into an active cart.";
  }

  if (entry.action === "order.status.changed") {
    const from = readString(changes, "from");
    const to = readString(changes, "to");

    if (from && to) {
      return `Status changed from ${toLabel(from)} to ${toLabel(to)}.`;
    }

    return "Order status was updated.";
  }

  if (entry.action === "order.internal_note.updated") {
    const previousNote = readString(changes, "previousNote");
    const nextNote = readString(changes, "nextNote");

    if (!previousNote && nextNote) {
      return "An internal order note was added.";
    }

    if (previousNote && !nextNote) {
      return "An internal order note was removed.";
    }

    return "An internal order note was updated.";
  }

  if (entry.action === "review.moderated") {
    const productName = readString(changes, "productName");
    const beforeStatus = readString(changes, "beforeStatus");
    const afterStatus = readString(changes, "afterStatus");

    if (productName && beforeStatus && afterStatus) {
      return `Review for ${productName} changed from ${toLabel(beforeStatus)} to ${toLabel(afterStatus)}.`;
    }

    return "A product review was moderated.";
  }

  if (entry.action.startsWith("category.")) {
    const entity = getEntityLabel(entry.changes);

    if (entry.action === "category.created") {
      return entity ? `${entity} was added to the category tree.` : "A category was added to the category tree.";
    }

    if (entry.action === "category.updated") {
      return entity ? `${entity} category details were updated.` : "Category details were updated.";
    }

    if (entry.action === "category.deleted") {
      return entity ? `${entity} was removed from categories.` : "A category was removed.";
    }
  }

  if (entry.action.startsWith("product.")) {
    const entity = getEntityLabel(entry.changes);

    if (entry.action === "product.created") {
      return entity ? `${entity} was added to the catalog.` : "A product was added to the catalog.";
    }

    if (entry.action === "product.updated") {
      return entity ? `${entity} product details were updated.` : "Product details were updated.";
    }
  }

  if (entry.action === "inventory.adjusted") {
    const productName = readString(changes, "productName");
    const sku = readString(changes, "sku");
    const beforeQuantity = changes.beforeQuantity;
    const afterQuantity = changes.afterQuantity;
    const adjustmentMode = readString(changes, "adjustmentMode");

    const targetLabel = productName ?? sku ?? "inventory row";
    if (typeof beforeQuantity === "number" && typeof afterQuantity === "number") {
      const modeLabel = adjustmentMode ? ` (${toLabel(adjustmentMode)})` : "";
      return `${targetLabel} changed from ${beforeQuantity} to ${afterQuantity}${modeLabel}.`;
    }

    return `${targetLabel} stock was adjusted.`;
  }

  if (entry.action.startsWith("homepage.")) {
    const entity = getEntityLabel(entry.changes);
    return entity
      ? `Homepage content for ${entity} was updated.`
      : "Homepage content was updated.";
  }

  if (entry.model) {
    return `${toLabel(entry.model)} activity was recorded.`;
  }

  return "System activity was recorded.";
}

export function mapAuditLogModelLabel(model: string | null) {
  return model ? toLabel(model) : null;
}

export function buildAdminActivityFeedItem(
  record: AuditLogActivityRecord,
  actorById: Map<string, AuditActorProfile>,
): AdminActivityFeedItem {
  return {
    id: record.id,
    action: record.action,
    title: mapAuditLogTitle(record.action),
    summary: mapAuditLogSummary(record),
    createdAt: record.createdAt,
    model: record.model,
    modelId: record.modelId,
    modelLabel: mapAuditLogModelLabel(record.model),
    actor: getActorContext(record.actorId, actorById),
  };
}
