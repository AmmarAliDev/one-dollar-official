"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { z } from "zod";

import { DynamicFormField, useAppForm } from "@/components/forms";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { routes } from "@/config/routes";

import { buildCategoryListingHref } from "../filters";
import type { CatalogCategoryListing } from "../types";
import {
  availabilityFilterOptions,
  catalogSortOptions,
  discountFilterOptions,
  ratingFilterOptions,
} from "../types";

function parseOptionalNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  const raw = `${value ?? ""}`.trim();
  if (raw.length === 0) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : value;
}

const categoryListingFilterSchema = z
  .object({
    sort: z.string().trim().default("featured"),
    minPrice: z.preprocess(parseOptionalNumber, z.number().min(0, "Minimum price cannot be negative.").optional()),
    maxPrice: z.preprocess(parseOptionalNumber, z.number().min(0, "Maximum price cannot be negative.").optional()),
    availability: z.string().trim().default("all"),
    rating: z.string().trim().default("all"),
    discount: z.string().trim().default("all"),
    attribute: z.string().trim().max(80, "Attribute filter must stay under 80 characters.").optional().default(""),
  })
  .superRefine((values, ctx) => {
    if (
      typeof values.minPrice === "number" &&
      typeof values.maxPrice === "number" &&
      values.maxPrice < values.minPrice
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPrice"],
        message: "Maximum price must be greater than or equal to minimum price.",
      });
    }
  });

type CategoryListingFilterValues = z.infer<typeof categoryListingFilterSchema>;

export function CategoryListingFilters({ listing }: { listing: CatalogCategoryListing }) {
  const { category, filters } = listing;
  const router = useRouter();

  const form = useAppForm<CategoryListingFilterValues>({
    schema: categoryListingFilterSchema,
    defaultValues: {
      sort: filters.sort,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      availability: filters.availability,
      rating: filters.rating,
      discount: filters.discount,
      attribute: filters.attribute,
    },
  });

  return (
    <Card className="border-border/70 shadow-(--shadow-soft)">
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
        <form
          className="space-y-5"
          noValidate
          onSubmit={form.handleSubmit((values) => {
            router.push(
              buildCategoryListingHref(category.slug, {
                ...filters,
                sort: values.sort as typeof filters.sort,
                minPrice: values.minPrice,
                maxPrice: values.maxPrice,
                availability: values.availability as typeof filters.availability,
                rating: values.rating as typeof filters.rating,
                discount: values.discount as typeof filters.discount,
                attribute: values.attribute ?? "",
                page: 1,
              }),
            );
          })}
        >
          <FormErrorSummary errors={form.formState.errors} title="Please review the selected filters" />

          <DynamicFormField
            control={form.control}
            fieldConfig={{
              id: "sort",
              name: "sort",
              type: "select",
              label: "Sort by",
              options: catalogSortOptions.map((option) => ({ value: option.value, label: option.label })),
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <DynamicFormField
              control={form.control}
              fieldConfig={{
                id: "minPrice",
                name: "minPrice",
                type: "number",
                label: "Min price",
                min: 0,
                placeholder: "0",
              }}
            />

            <DynamicFormField
              control={form.control}
              fieldConfig={{
                id: "maxPrice",
                name: "maxPrice",
                type: "number",
                label: "Max price",
                min: 0,
                placeholder: "3000",
              }}
            />
          </div>

          <DynamicFormField
            control={form.control}
            fieldConfig={{
              id: "availability",
              name: "availability",
              type: "select",
              label: "Availability",
              options: availabilityFilterOptions.map((option) => ({ value: option.value, label: option.label })),
            }}
          />

          <DynamicFormField
            control={form.control}
            fieldConfig={{
              id: "rating",
              name: "rating",
              type: "select",
              label: "Rating",
              options: ratingFilterOptions.map((option) => ({ value: option.value, label: option.label })),
            }}
          />

          <DynamicFormField
            control={form.control}
            fieldConfig={{
              id: "discount",
              name: "discount",
              type: "select",
              label: "Discount",
              options: discountFilterOptions.map((option) => ({ value: option.value, label: option.label })),
            }}
          />

          <DynamicFormField
            control={form.control}
            fieldConfig={{
              id: "attribute",
              name: "attribute",
              type: "text",
              label: "Variant-aware attributes",
              description: "This remains a lightweight scaffold until structured attribute filters are introduced.",
              placeholder: "Color / size / scent placeholder",
            }}
          />

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Apply filters</Button>
            <Link href={routes.storefront.category(category.slug)} className={buttonVariants({ variant: "outline" })}>
              Reset
            </Link>
            {(filters.page ?? 1) > 1 ? (
              <Link
                href={buildCategoryListingHref(category.slug, filters, {
                  page: Math.max(1, (filters.page ?? 1) - 1),
                })}
                className={buttonVariants({ variant: "ghost" })}
              >
                Previous page
              </Link>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
