import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { testIds } from "@/lib/test-selectors";

import type { CatalogCategory } from "../types";

export function CategoryOverviewCard({ category }: { category: CatalogCategory }) {
  return (
    <Link
      href={category.href}
      className="group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      data-testid={testIds.storefront.categoryCard(category.slug)}
    >
      <Card className="border-border/70 h-full shadow-[var(--shadow-soft)] transition-transform duration-200 group-hover:-translate-y-0.5">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="secondary">Simple category</Badge>
            <ArrowRight
              className="text-muted-foreground size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{category.name}</h2>
            <p className="text-muted-foreground text-sm">{category.description}</p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Slug: /categories/{category.slug}</span>
            <span className="font-medium">
              {category.productCount} {category.productCount === 1 ? "product" : "products"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
