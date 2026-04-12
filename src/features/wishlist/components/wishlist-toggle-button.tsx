"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useSession } from "@/lib/auth/client";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

type WishlistToggleButtonProps = {
  productSlug: string;
  optionId?: string | undefined;
  sku: string;
  productName: string;
  initiallyWishlisted?: boolean;
};

export function WishlistToggleButton({
  productSlug,
  optionId,
  sku,
  productName,
  initiallyWishlisted = false,
}: WishlistToggleButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();

  const [pending, setPending] = useState(false);
  const [wishlisted, setWishlisted] = useState(initiallyWishlisted);

  async function handleToggle() {
    if (pending || status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      notify.info("Sign in required", "Please sign in to save products to your wishlist.");
      router.push(`${routes.auth.signIn}?from=${encodeURIComponent(pathname || routes.storefront.wishlist)}`);
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/wishlist/items", {
        method: wishlisted ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug,
          ...(optionId ? { optionId } : {}),
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorPayload?.error ?? "Wishlist request failed.");
      }

      const nextValue = !wishlisted;
      setWishlisted(nextValue);
      notify.success(nextValue ? `${productName} saved` : `${productName} removed`, "Wishlist updated.");
      router.refresh();
    } catch (error) {
      notify.error("Could not update wishlist", error instanceof Error ? error.message : undefined);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={wishlisted ? "secondary" : "outline"}
      size="lg"
      className="w-full"
      onClick={handleToggle}
      disabled={status === "loading" || pending || !sku}
      aria-busy={pending}
      aria-pressed={wishlisted}
    >
      <Heart className={cn("size-4", wishlisted && "fill-current")} aria-hidden="true" />
      {pending ? "Updating..." : wishlisted ? "Saved to wishlist" : "Save to wishlist"}
    </Button>
  );
}