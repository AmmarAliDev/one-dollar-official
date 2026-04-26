"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { DynamicFormField, useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

type AdminBlogFiltersFormProps = {
  query: string;
  status: "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type BlogFilterValues = {
  query: string;
  status: "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const blogFiltersSchema = z.object({
  query: z.string().default(""),
  status: z.enum(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"]).default("ALL"),
});

export function AdminBlogFiltersForm({ query, status }: AdminBlogFiltersFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const form = useAppForm<BlogFilterValues>({
    schema: blogFiltersSchema,
    defaultValues: {
      query,
      status,
    },
  });

  const preservedQueryParams = useMemo(() => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");

    next.delete("q");
    next.delete("status");
    next.delete("notice");
    next.delete("error");

    return next;
  }, [searchParams]);

  return (
    <form
      className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
      onSubmit={form.handleSubmit((values) => {
        const next = new URLSearchParams(preservedQueryParams);

        if (values.query.trim().length > 0) {
          next.set("q", values.query.trim());
        }

        if (values.status !== "ALL") {
          next.set("status", values.status);
        }

        const queryString = next.toString();
        router.push(queryString.length > 0 ? `${pathname}?${queryString}` : pathname);
      })}
    >
      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "blog-filter-query",
          name: "query",
          type: "text",
          label: "Search",
          placeholder: "Search by title, slug, or excerpt",
        }}
      />

      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "blog-filter-status",
          name: "status",
          type: "select",
          label: "Status",
          options: statusOptions.map((option) => ({
            value: option.value,
            label: option.label,
          })),
        }}
      />

      <div className="flex items-end gap-2">
        <Button type="submit">Apply</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset({
              query: "",
              status: "ALL",
            });
            const queryString = preservedQueryParams.toString();
            router.push(queryString.length > 0 ? `${pathname}?${queryString}` : pathname);
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
