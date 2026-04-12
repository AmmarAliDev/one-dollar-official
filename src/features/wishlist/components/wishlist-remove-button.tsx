"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";

type WishlistRemoveButtonProps = {
  sku: string;
  productName: string;
};

export function WishlistRemoveButton({ sku, productName }: WishlistRemoveButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    if (pending) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/wishlist/items", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sku }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Wishlist remove request failed.");
        }

        notify.success(`${productName} removed`, "Wishlist updated.");
        router.refresh();
      } catch (error) {
        notify.error("Could not remove wishlist item", error instanceof Error ? error.message : undefined);
      }
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={handleRemove} aria-busy={pending}>
      <Trash2 className="size-4" aria-hidden="true" />
      {pending ? "Removing..." : "Remove"}
    </Button>
  );
}