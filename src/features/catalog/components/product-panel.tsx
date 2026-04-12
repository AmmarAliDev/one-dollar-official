"use client";

import { useEffect, useState } from "react";

import { WishlistToggleButton } from "@/features/wishlist/components/wishlist-toggle-button";

import type { CatalogProductDetail, ProductVariantOption } from "../types";
import { ProductAddToCart } from "./product-add-to-cart";
import { ProductInfoBlock } from "./product-info-block";
import { ProductVariantPicker } from "./product-variant-picker";

type ProductPanelProps = {
  product: CatalogProductDetail;
  initialWishlistedSkus?: readonly string[];
};

function resolveActiveOption(
  product: CatalogProductDetail,
  selectedOptionIds: Record<string, string>,
): ProductVariantOption | null {
  if (product.variantGroups.length === 0) return null;

  const firstGroup = product.variantGroups[0];
  if (!firstGroup) return null;

  const selectedId = selectedOptionIds[firstGroup.id];

  return firstGroup.options.find((o) => o.id === selectedId) ?? null;
}

function buildDefaultSelections(product: CatalogProductDetail): Record<string, string> {
  const defaults: Record<string, string> = {};

  for (const group of product.variantGroups) {
    // Pre-select first in-stock option, otherwise first option
    const inStock = group.options.find((o) => o.inventoryQuantity > 0);
    const first = group.options[0];
    const chosen = inStock ?? first;

    if (chosen) {
      defaults[group.id] = chosen.id;
    }
  }

  return defaults;
}

export function ProductPanel({ product, initialWishlistedSkus = [] }: ProductPanelProps) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>(
    buildDefaultSelections(product),
  );

  useEffect(() => {
    setSelectedOptionIds(buildDefaultSelections(product));
  }, [product.id]);

  const activeOption = resolveActiveOption(product, selectedOptionIds);

  const effectivePrice = activeOption?.price ?? product.price;
  const effectiveCompareAt = activeOption?.compareAt ?? product.compareAt;
  const effectiveSku = activeOption?.sku ?? product.sku;
  const effectiveInventory = activeOption?.inventoryQuantity ?? product.inventoryQuantity;
  const effectiveOptionId = activeOption?.id;
  const isInitiallyWishlisted = Boolean(effectiveSku && initialWishlistedSkus.includes(effectiveSku));

  function handleSelect(groupId: string, optionId: string) {
    setSelectedOptionIds((prev) => ({ ...prev, [groupId]: optionId }));
  }

  return (
    <div className="space-y-6">
      <ProductInfoBlock
        product={product}
        effectivePrice={effectivePrice}
        {...(typeof effectiveCompareAt === "number" ? { effectiveCompareAt } : {})}
        effectiveSku={effectiveSku}
        effectiveInventory={effectiveInventory}
      />

      {product.variantGroups.length > 0 ? (
        <div className="border-t border-border/50 pt-5">
          <ProductVariantPicker
            variantGroups={product.variantGroups}
            selectedOptionIds={selectedOptionIds}
            onSelect={handleSelect}
          />
        </div>
      ) : null}

      <div className="border-t border-border/50 pt-5">
        <ProductAddToCart productName={product.name} isAvailable={effectiveInventory > 0} />
      </div>

      <WishlistToggleButton
        productSlug={product.slug}
        {...(effectiveOptionId ? { optionId: effectiveOptionId } : {})}
        sku={effectiveSku}
        productName={product.name}
        initiallyWishlisted={isInitiallyWishlisted}
      />
    </div>
  );
}
