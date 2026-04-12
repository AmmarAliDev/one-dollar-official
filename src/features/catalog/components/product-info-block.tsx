import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { formatPrice } from "@/lib/currency";

import type { CatalogProductDetail } from "../types";

type ProductInfoBlockProps = {
  product: CatalogProductDetail;
  /** Effective price - may differ from base price when a variant is active. */
  effectivePrice: number;
  effectiveCompareAt?: number;
  effectiveSku: string;
  effectiveInventory: number;
};

function inventoryBadge(quantity: number) {
  if (quantity <= 0) return { label: "Out of stock", variant: "danger" as const };
  if (quantity <= 5) return { label: `Only ${quantity} left`, variant: "warning" as const };
  return { label: "In stock", variant: "success" as const };
}

export function ProductInfoBlock({
  product,
  effectivePrice,
  effectiveCompareAt,
  effectiveSku,
  effectiveInventory,
}: ProductInfoBlockProps) {
  const stock = inventoryBadge(effectiveInventory);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{product.name}</h1>
        <p className="text-muted-foreground">{product.shortDescription}</p>
      </div>

      {/* Rating summary */}
      {product.reviewSummary.totalCount > 0 ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span className="text-amber-500" aria-hidden>
            {"★".repeat(Math.round(product.reviewSummary.averageRating))}
            {"☆".repeat(5 - Math.round(product.reviewSummary.averageRating))}
          </span>
          <span>
            {product.reviewSummary.averageRating.toFixed(1)} | {product.reviewSummary.totalCount} reviews
          </span>
        </div>
      ) : null}

      {/* Price */}
      <PriceDisplay
        amount={effectivePrice}
        {...(typeof effectiveCompareAt === "number" ? { compareAt: effectiveCompareAt } : {})}
        size="lg"
      />

      {/* Stock + SKU */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={stock.variant}>{stock.label}</Badge>
        <span className="text-muted-foreground text-xs">SKU: {effectiveSku}</span>
      </div>

      {/* Savings callout */}
      {typeof effectiveCompareAt === "number" && effectiveCompareAt > effectivePrice ? (
        <p className="text-success text-sm font-medium">
          You save {formatPrice(effectiveCompareAt - effectivePrice)} on this item.
        </p>
      ) : null}
    </div>
  );
}
