"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { DynamicFormField, useAppForm } from "@/components/forms";
import { Button, buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

const ALL_PRODUCTS_VALUE = "ALL_PRODUCTS";

const reviewFilterSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z.enum(["ALL", "PENDING", "APPROVED", "REJECTED", "HIDDEN"]).default("ALL"),
  productId: z.string().trim().optional().default(ALL_PRODUCTS_VALUE),
});

type ReviewFilterValues = z.infer<typeof reviewFilterSchema>;

type AdminReviewFiltersFormProps = {
  query: string;
  status: "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  productId: string;
  productOptions: Array<{
    id: string;
    name: string;
    reviewCount: number;
  }>;
};

function buildReviewFilterHref(values: ReviewFilterValues) {
  const params = new URLSearchParams();

  if (values.q.trim().length > 0) {
    params.set("q", values.q.trim());
  }

  if (values.status !== "ALL") {
    params.set("status", values.status);
  }

  if (values.productId.trim().length > 0 && values.productId !== ALL_PRODUCTS_VALUE) {
    params.set("product", values.productId.trim());
  }

  const queryString = params.toString();
  return queryString ? `${routes.admin.reviews}?${queryString}` : routes.admin.reviews;
}

export function AdminReviewFiltersForm({ query, status, productId, productOptions }: AdminReviewFiltersFormProps) {
  const router = useRouter();
  const form = useAppForm<ReviewFilterValues>({
    schema: reviewFilterSchema,
    defaultValues: {
      q: query,
      status,
      productId: productId || ALL_PRODUCTS_VALUE,
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_180px_220px_auto] md:items-end"
      noValidate
      onSubmit={form.handleSubmit((values) => {
        router.push(buildReviewFilterHref(values));
      })}
    >
      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "reviews-search",
          name: "q",
          type: "text",
          label: "Search",
          placeholder: "Product, reviewer, title, or comment",
        }}
      />

      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "reviews-status",
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { value: "ALL", label: "All statuses" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "HIDDEN", label: "Hidden" },
          ],
        }}
      />

      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "reviews-product",
          name: "productId",
          type: "select",
          label: "Product",
          options: [
            { value: ALL_PRODUCTS_VALUE, label: "All products" },
            ...productOptions.map((product) => ({
              value: product.id,
              label: `${product.name} (${product.reviewCount})`,
            })),
          ],
        }}
      />

      <div className="flex gap-2">
        <Button type="submit" variant="outline">
          Apply
        </Button>
        <Link href={routes.admin.reviews} className={buttonVariants({ variant: "ghost" })}>
          Reset
        </Link>
      </div>
    </form>
  );
}
