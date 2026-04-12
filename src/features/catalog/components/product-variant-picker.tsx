"use client";

import { cn } from "@/lib/utils";

import type { ProductVariantGroup, ProductVariantOption } from "../types";

type ProductVariantPickerProps = {
  variantGroups: ProductVariantGroup[];
  selectedOptionIds: Record<string, string>;
  onSelect: (groupId: string, optionId: string) => void;
};

function VariantOption({
  option,
  isSelected,
  onSelect,
}: {
  option: ProductVariantOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const outOfStock = option.inventoryQuantity <= 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={outOfStock}
      aria-pressed={isSelected}
      aria-label={`${option.label}${outOfStock ? " - out of stock" : ""}`}
      className={cn(
        "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : outOfStock
            ? "border-border/40 text-muted-foreground cursor-not-allowed opacity-50 line-through"
            : "border-border hover:border-primary/60 hover:bg-accent",
      )}
    >
      {option.label}
    </button>
  );
}

export function ProductVariantPicker({ variantGroups, selectedOptionIds, onSelect }: ProductVariantPickerProps) {
  if (variantGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {variantGroups.map((group) => (
        <div key={group.id} className="space-y-2">
          <p className="text-sm font-semibold">
            {group.name}
            {selectedOptionIds[group.id] ? (
              <span className="text-muted-foreground ml-2 font-normal">
                ({group.options.find((o) => o.id === selectedOptionIds[group.id])?.label})
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={`${group.name} options`}>
            {group.options.map((option) => (
              <VariantOption
                key={option.id}
                option={option}
                isSelected={selectedOptionIds[group.id] === option.id}
                onSelect={() => onSelect(group.id, option.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
