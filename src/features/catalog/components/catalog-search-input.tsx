"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Input } from "@/components/ui/input";

type CatalogSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
};

export function CatalogSearchInput({
  value,
  onChange,
  placeholder = "Search products by name, category, or keyword",
  isLoading = false,
}: CatalogSearchInputProps) {
  const hasValue = value.trim().length > 0;

  return (
    <div className="border-border/70 bg-card/90 flex items-center gap-2 rounded-xl border p-2 shadow-[var(--shadow-soft)]">
      <div className="text-muted-foreground px-2" aria-hidden="true">
        <Search className="size-4" />
      </div>

      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="h-10 border-none px-0 shadow-none focus-visible:ring-0"
      />

      {isLoading ? (
        <span className="text-muted-foreground px-2" role="status" aria-label="Searching">
          <InlineSpinner />
        </span>
      ) : null}

      {hasValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
