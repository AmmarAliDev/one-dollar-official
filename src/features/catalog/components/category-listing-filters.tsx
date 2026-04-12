import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";

import { buildCategoryListingHref } from "../filters";
import type { CatalogCategoryListing } from "../types";
import {
  availabilityFilterOptions,
  catalogSortOptions,
  discountFilterOptions,
  ratingFilterOptions,
} from "../types";

const selectClassName =
  "border-input bg-background ring-offset-background flex h-10 w-full rounded-[calc(var(--radius)-2px)] border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function CategoryListingFilters({ listing }: { listing: CatalogCategoryListing }) {
  const { category, filters } = listing;

  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-2xl p-2" aria-hidden="true">
            <SlidersHorizontal className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Filters and sorting</CardTitle>
            <p className="text-muted-foreground text-sm">
              Narrow results by price or sort to find the best deals.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form action={routes.storefront.category(category.slug)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="sort" className="text-sm font-medium">
              Sort by
            </label>
            <select id="sort" name="sort" defaultValue={filters.sort} className={selectClassName}>
              {catalogSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="minPrice" className="text-sm font-medium">
                Min price
              </label>
              <Input id="minPrice" name="minPrice" type="number" min="0" defaultValue={filters.minPrice} placeholder="0" />
            </div>

            <div className="space-y-2">
              <label htmlFor="maxPrice" className="text-sm font-medium">
                Max price
              </label>
              <Input id="maxPrice" name="maxPrice" type="number" min="0" defaultValue={filters.maxPrice} placeholder="3000" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="availability" className="text-sm font-medium">
              Availability
            </label>
            <select id="availability" name="availability" defaultValue={filters.availability} className={selectClassName}>
              {availabilityFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="rating" className="text-sm font-medium">
              Rating
            </label>
            <select id="rating" name="rating" defaultValue={filters.rating} className={selectClassName}>
              {ratingFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="discount" className="text-sm font-medium">
              Discount
            </label>
            <select id="discount" name="discount" defaultValue={filters.discount} className={selectClassName}>
              {discountFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="attribute" className="text-sm font-medium">
              Variant-aware attributes
            </label>
            <Input
              id="attribute"
              name="attribute"
              defaultValue={filters.attribute}
              placeholder="Color / size / scent placeholder"
            />
            <p className="text-muted-foreground text-xs">
              This field is intentionally a scaffold. Future variant prompts can convert it into structured attribute filters.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Apply filters</Button>
            <Link href={routes.storefront.category(category.slug)} className={buttonVariants({ variant: "outline" })}>
              Reset
            </Link>
            {(filters.page ?? 1) > 1 && (
              <Link
                href={buildCategoryListingHref(category.slug, filters, {
                  page: Math.max(1, (filters.page ?? 1) - 1),
                })}
                className={buttonVariants({ variant: "ghost" })}
              >
                Previous page
              </Link>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
