import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";

import type { CatalogProductCard, CatalogProductImageTone } from "../types";

const toneBg: Record<CatalogProductImageTone, string> = {
  sky: "from-sky-200 via-sky-100 to-white text-sky-950",
  emerald: "from-emerald-200 via-emerald-100 to-white text-emerald-950",
  amber: "from-amber-200 via-amber-100 to-white text-amber-950",
  rose: "from-rose-200 via-rose-100 to-white text-rose-950",
  slate: "from-slate-300 via-slate-100 to-white text-slate-950",
};

type ProductRelatedGridProps = {
  products: CatalogProductCard[];
};

export function ProductRelatedGrid({ products }: ProductRelatedGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-heading">
      <div className="mb-6 space-y-3">
        <Badge variant="secondary">More like this</Badge>
        <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">
          Related Products
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className="group rounded-[var(--radius-card)] border border-border/70 overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div
              aria-hidden
              className={`flex aspect-[4/3] items-end p-4 bg-gradient-to-br ${toneBg[product.imageTone]}`}
            >
              <p className="text-base font-semibold tracking-tight group-hover:underline">{product.imageLabel}</p>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </p>
              <PriceDisplay
                amount={product.price}
                {...(typeof product.compareAt === "number" ? { compareAt: product.compareAt } : {})}
                size="sm"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
