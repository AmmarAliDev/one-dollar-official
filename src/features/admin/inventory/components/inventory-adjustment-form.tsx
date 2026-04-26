"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { AdminInventoryItem } from "./admin-inventory-table";

type UpdateInventoryAction = (formData: FormData) => void | Promise<void>;

type InventoryAdjustmentFormProps = {
  item: AdminInventoryItem;
  action: UpdateInventoryAction;
  returnTo: string;
};

function SubmitInventoryAdjustmentButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving..." : "Update"}
    </Button>
  );
}

export function InventoryAdjustmentForm({ item, action, returnTo }: InventoryAdjustmentFormProps) {
  return (
    <form action={action} className="grid min-w-70 gap-2 md:min-w-90 md:grid-cols-[1fr_1fr_auto]">
      <input type="hidden" name="inventoryId" value={item.id} />
      <input type="hidden" name="expectedUpdatedAt" value={item.updatedAt} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <label className="sr-only" htmlFor={`adjustment-mode-${item.id}`}>
        Adjustment mode
      </label>
      <select
        id={`adjustment-mode-${item.id}`}
        name="adjustmentMode"
        defaultValue="set"
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <option value="set">Set to quantity</option>
        <option value="increase">Increase by</option>
        <option value="decrease">Decrease by</option>
      </select>

      <label className="sr-only" htmlFor={`adjustment-amount-${item.id}`}>
        Quantity amount
      </label>
      <Input
        id={`adjustment-amount-${item.id}`}
        name="amount"
        type="number"
        min={0}
        step={1}
        required
        placeholder="Quantity"
      />

      <SubmitInventoryAdjustmentButton />

      <label className="sr-only" htmlFor={`adjustment-reason-${item.id}`}>
        Reason
      </label>
      <Input
        id={`adjustment-reason-${item.id}`}
        name="reason"
        required
        maxLength={240}
        className="md:col-span-3"
        placeholder="Reason (e.g. cycle count correction)"
      />
    </form>
  );
}
