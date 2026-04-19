"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { DynamicFormField, useAppForm } from "@/components/forms";
import { Button, buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

const productFilterSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z.enum(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"]).default("ALL"),
  type: z.enum(["ALL", "SIMPLE", "VARIANT"]).default("ALL"),
});

type AdminProductFiltersFormProps = {
  query: string;
  status: "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";
  type: "ALL" | "SIMPLE" | "VARIANT";
};

type ProductFilterValues = z.infer<typeof productFilterSchema>;

function buildProductFilterHref(values: ProductFilterValues) {
  const params = new URLSearchParams();

  if (values.q.trim().length > 0) {
    params.set("q", values.q.trim());
  }

  if (values.status !== "ALL") {
    params.set("status", values.status);
  }

  if (values.type !== "ALL") {
    params.set("type", values.type);
  }

  const queryString = params.toString();
  return queryString ? `${routes.admin.products}?${queryString}` : routes.admin.products;
}

export function AdminProductFiltersForm({ query, status, type }: AdminProductFiltersFormProps) {
  const router = useRouter();
  const form = useAppForm<ProductFilterValues>({
    schema: productFilterSchema,
    defaultValues: {
      q: query,
      status,
      type,
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto] md:items-end"
      noValidate
      onSubmit={form.handleSubmit((values) => {
        router.push(buildProductFilterHref(values));
      })}
    >
      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "products-search",
          name: "q",
          type: "text",
          label: "Search",
          placeholder: "Title, slug, description, or SKU",
        }}
      />

      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "products-status",
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { value: "ALL", label: "All statuses" },
            { value: "DRAFT", label: "Draft" },
            { value: "PUBLISHED", label: "Published" },
            { value: "ARCHIVED", label: "Archived" },
          ],
        }}
      />

      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "products-type",
          name: "type",
          type: "select",
          label: "Product type",
          options: [
            { value: "ALL", label: "All products" },
            { value: "SIMPLE", label: "Simple" },
            { value: "VARIANT", label: "Variant-based" },
          ],
        }}
      />

      <div className="flex gap-2">
        <Button type="submit" variant="outline">
          Apply
        </Button>
        <Link href={routes.admin.products} className={buttonVariants({ variant: "ghost" })}>
          Reset
        </Link>
      </div>
    </form>
  );
}
