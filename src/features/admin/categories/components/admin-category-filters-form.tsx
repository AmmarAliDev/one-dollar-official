"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { DynamicFormField, useAppForm } from "@/components/forms";
import { Button, buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

const categoryFilterSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z.enum(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"]).default("ALL"),
});

type AdminCategoryFiltersFormProps = {
  query: string;
  status: "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type CategoryFilterValues = z.infer<typeof categoryFilterSchema>;

function buildCategoryFilterHref(values: CategoryFilterValues) {
  const params = new URLSearchParams();

  if (values.q.trim().length > 0) {
    params.set("q", values.q.trim());
  }

  if (values.status !== "ALL") {
    params.set("status", values.status);
  }

  const queryString = params.toString();
  return queryString ? `${routes.admin.categories}?${queryString}` : routes.admin.categories;
}

export function AdminCategoryFiltersForm({ query, status }: AdminCategoryFiltersFormProps) {
  const router = useRouter();
  const form = useAppForm<CategoryFilterValues>({
    schema: categoryFilterSchema,
    defaultValues: {
      q: query,
      status,
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end"
      noValidate
      onSubmit={form.handleSubmit((values) => {
        router.push(buildCategoryFilterHref(values));
        router.refresh();
      })}
    >
      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "categories-search",
          name: "q",
          type: "text",
          label: "Search",
          placeholder: "Name, slug, or description",
        }}
      />

      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "categories-status",
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

      <div className="flex gap-2">
        <Button type="submit" variant="outline">
          Apply
        </Button>
        <Link href={routes.admin.categories} className={buttonVariants({ variant: "ghost" })}>
          Reset
        </Link>
      </div>
    </form>
  );
}
