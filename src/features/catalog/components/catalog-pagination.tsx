import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { buildCategoryListingHref } from "../filters";
import type { CatalogCategoryListing } from "../types";

export function CatalogPagination({ listing }: { listing: CatalogCategoryListing }) {
  const { category, filters, pagination } = listing;

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Pagination</p>
          <p className="text-muted-foreground text-sm">
            Page {pagination.currentPage} of {pagination.totalPages} for {category.name}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {pagination.hasPreviousPage ? (
            <Link
              href={buildCategoryListingHref(category.slug, filters, {
                page: Math.max(1, pagination.currentPage - 1),
              })}
              prefetch={false}
              rel="prev"
              className={buttonVariants({ variant: "outline" })}
            >
              Previous
            </Link>
          ) : null}

          {pagination.hasNextPage ? (
            <Link
              href={buildCategoryListingHref(category.slug, filters, {
                page: pagination.currentPage + 1,
              })}
              prefetch={false}
              rel="next"
              className={buttonVariants({ variant: "default" })}
            >
              Next page
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
