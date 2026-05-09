"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

type CatalogSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  isLoading?: boolean;
};

export function CatalogSearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search products by name or category",
  isLoading = false,
}: CatalogSearchInputProps) {
  const hasValue = value.trim().length > 0;

  useEffect(() => {
    const input = document.getElementById("search-input");
    input?.focus();
  }, []);

  return (
    <div
      className="border-border bg-background flex items-center gap-2 rounded-xl border-2 p-2 shadow-(--shadow-soft) cursor-pointer"
      onClick={() => {
        const input = document.getElementById("search-input");
        input?.focus();
      }}
    >
      <div className="text-muted-foreground px-2" aria-hidden="true">
        <Search className="size-4" />
      </div>

      <Input
        id="search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return;
          }

          onSubmit?.();
        }}
        placeholder={placeholder}
        aria-label="Search products"
        className="h-10 border-none px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
