"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { DynamicFormField, useAppForm } from "@/components/forms";
import { Button, buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

const orderFilterSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z.enum(["ALL", "PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"]).default("ALL"),
});

type AdminOrderFiltersFormProps = {
  query: string;
  status: "ALL" | "PENDING" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
};

type OrderFilterValues = z.infer<typeof orderFilterSchema>;

function buildOrderFilterHref(values: OrderFilterValues) {
  const params = new URLSearchParams();

  if (values.q.trim().length > 0) {
    params.set("q", values.q.trim());
  }

  if (values.status !== "ALL") {
    params.set("status", values.status);
  }

  const queryString = params.toString();
  return queryString ? `${routes.admin.orders}?${queryString}` : routes.admin.orders;
}

export function AdminOrderFiltersForm({ query, status }: AdminOrderFiltersFormProps) {
  const router = useRouter();
  const form = useAppForm<OrderFilterValues>({
    schema: orderFilterSchema,
    defaultValues: {
      q: query,
      status,
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end"
      noValidate
      onSubmit={form.handleSubmit((values) => {
        router.push(buildOrderFilterHref(values));
      })}
    >
      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "orders-search",
          name: "q",
          type: "text",
          label: "Search",
          placeholder: "Order number, customer name, email, or phone",
        }}
      />

      <DynamicFormField
        control={form.control}
        fieldConfig={{
          id: "orders-status",
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { value: "ALL", label: "All statuses" },
            { value: "PENDING", label: "Pending" },
            { value: "CONFIRMED", label: "Confirmed" },
            { value: "PACKED", label: "Packed" },
            { value: "SHIPPED", label: "Shipped" },
            { value: "DELIVERED", label: "Delivered" },
            { value: "CANCELLED", label: "Cancelled" },
          ],
        }}
      />

      <div className="flex gap-2">
        <Button type="submit" variant="outline">
          Apply
        </Button>
        <Link href={routes.admin.orders} className={buttonVariants({ variant: "ghost" })}>
          Reset
        </Link>
      </div>
    </form>
  );
}
