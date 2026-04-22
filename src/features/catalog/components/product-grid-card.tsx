import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { testIds } from "@/lib/test-selectors";

import type { CatalogProductCard, CatalogProductImageTone } from "../types";

const imageToneClasses: Record<CatalogProductImageTone, string> = {
  sky: "from-sky-200 via-sky-100 to-white text-sky-950",
  emerald: "from-emerald-200 via-emerald-100 to-white text-emerald-950",
  amber: "from-amber-200 via-amber-100 to-white text-amber-950",
  rose: "from-rose-200 via-rose-100 to-white text-rose-950",
  slate: "from-slate-300 via-slate-100 to-white text-slate-950",
};

function getInventoryBadge(quantity: number) {
  if (quantity <= 0) {
    return { label: "Out of stock", variant: "danger" as const };
  }

  if (quantity <= 5) {
    return { label: `Low stock: ${quantity} left`, variant: "warning" as const };
  }

  return { label: "In stock", variant: "success" as const };
}

function getReviewSummary(product: CatalogProductCard) {
  if (product.reviewCount <= 0) {
    return "No reviews yet";
  }

  return `${product.averageRating.toFixed(1)} average rating | ${product.reviewCount} ${product.reviewCount === 1 ? "review" : "reviews"}`;
}

export function ProductGridCard({ product }: { product: CatalogProductCard }) {
  const stockBadge = getInventoryBadge(product.inventoryQuantity);

  return (
    <Link
      href={product.href}
      className="group focus-visible:ring-primary rounded-[var(--radius-card)] focus-visible:ring-2 focus-visible:outline-none"
      data-testid={testIds.storefront.productCard(product.slug)}
    >
      <Card className="border-border/70 overflow-hidden shadow-[var(--shadow-soft)] transition-shadow group-hover:shadow-md">
        <div
          role="img"
          aria-label={`${product.name} image placeholder`}
          className={`flex aspect-[4/3] items-end justify-between bg-gradient-to-br p-5 ${imageToneClasses[product.imageTone]}`}
        >
          <div>
            <p className="text-xs font-medium tracking-[0.24em] uppercase opacity-75">
              Catalog image
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">{product.imageLabel}</p>
          </div>
          <Badge variant="secondary" className="bg-white/80 text-slate-900">
            {product.attributeSummary.join(" | ")}
          </Badge>
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
              {product.compareAt && product.compareAt > product.price ? (
                <Badge variant="info">Discount available</Badge>
              ) : null}
            </div>
            <h3 className="group-hover:text-primary text-lg font-semibold tracking-tight transition-colors">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm">{product.description}</p>
          </div>

          <PriceDisplay
            amount={product.price}
            {...(typeof product.compareAt === "number" ? { compareAt: product.compareAt } : {})}
            size="sm"
          />

          <div className="text-muted-foreground flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span>{getReviewSummary(product)}</span>
            <span>
              {product.inventoryQuantity > 0
                ? `${product.inventoryQuantity} available`
                : "Notify me later"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
