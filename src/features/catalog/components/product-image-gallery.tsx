"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { CatalogProductImageTone, ProductImage } from "../types";

const toneBg: Record<CatalogProductImageTone, string> = {
  sky: "from-sky-200 via-sky-100 to-white text-sky-950",
  emerald: "from-emerald-200 via-emerald-100 to-white text-emerald-950",
  amber: "from-amber-200 via-amber-100 to-white text-amber-950",
  rose: "from-rose-200 via-rose-100 to-white text-rose-950",
  slate: "from-slate-300 via-slate-100 to-white text-slate-950",
};

type ProductImageGalleryProps = {
  images: ProductImage[];
  productName: string;
};

/**
 * Renders the main image and thumbnail strip for a product detail page.
 *
 * When an image has a `url`, a real `<img>` is displayed.
 * When `url` is absent (legacy placeholder mode), the coloured gradient
 * with `label` text is rendered instead.
 */
export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const primary = images.find((img) => img.isPrimary) ?? images[0];
  const [activeId, setActiveId] = useState<string>(primary?.id ?? "");
  const active = images.find((img) => img.id === activeId) ?? primary;
  const isInitialAboveFoldImage = Boolean(primary && active?.id === primary.id);

  if (!active) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse">
      {/* Main image */}
      {active.url ? (
        <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
          <Image
            src={active.url}
            alt={active.label}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            loading={isInitialAboveFoldImage ? "eager" : "lazy"}
            fetchPriority={isInitialAboveFoldImage ? "high" : "auto"}
          />
        </div>
      ) : (
        <div
          role="img"
          aria-label={`${productName} - ${active.label}`}
          className={cn(
            "flex min-h-[320px] flex-1 items-end bg-gradient-to-br p-8 rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]",
            toneBg[active.tone],
          )}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] opacity-60">Product image</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{active.label}</p>
          </div>
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 ? (
        <div className="flex flex-row gap-2 sm:flex-col sm:w-20">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              aria-label={`View ${img.label}`}
              aria-pressed={img.id === activeId}
              className={cn(
                "aspect-square flex-1 overflow-hidden sm:flex-none sm:w-20 sm:h-20 rounded-lg border-2 transition-all",
                img.url ? "bg-muted" : cn("bg-gradient-to-br", toneBg[img.tone]),
                img.id === activeId
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/60 hover:border-primary/50",
              )}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.label}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
