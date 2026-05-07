import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { testIds } from "@/lib/test-selectors";

import type { CatalogProductCard } from "../types";
import { ProductCardMedia } from "./product-card-media";

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

type ProductGridCardProps = {
  product: CatalogProductCard;
  eagerImage?: boolean;
};

export function ProductGridCard({ product, eagerImage = false }: ProductGridCardProps) {
  const stockBadge = getInventoryBadge(product.inventoryQuantity);

  return (
    <Link
      href={product.href}
      className="group focus-visible:ring-primary rounded-[var(--radius-card)] focus-visible:ring-2 focus-visible:outline-none"
      data-testid={testIds.storefront.productCard(product.slug)}
    >
      <article>
        <Card className="border-border/70 overflow-hidden shadow-[var(--shadow-soft)] transition-shadow group-hover:shadow-md">
          <ProductCardMedia
            productName={product.name}
            {...(product.imageUrl ? { imageUrl: product.imageUrl } : {})}
            imageLabel={product.imageLabel}
            imageTone={product.imageTone}
            attributeSummary={product.attributeSummary}
            eagerImage={eagerImage}
          />

          <CardContent className="space-y-2 p-3">
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
            </div>
          </CardContent>
        </Card>
      </article>
    </Link>
  );
}
