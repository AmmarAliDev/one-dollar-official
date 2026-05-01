import { env, type RuntimeEnv } from "@/config/env";
import { shouldRenderGuardedSurface } from "@/config/production-visibility";
import { routes } from "@/config/routes";
import { ONE_DOLLAR_CATEGORY_SLUG, ONE_DOLLAR_MAX_PRICE_PKR } from "@/features/catalog/one-dollar";

import type { HomepageSection } from "./types";

function shouldShowHomepagePreviewArtifacts(runtimeEnv: RuntimeEnv) {
  return shouldRenderGuardedSurface("homepagePreviewCta", runtimeEnv);
}

export function buildHomepageFallbackSections(runtimeEnv: RuntimeEnv = env): HomepageSection[] {
  const showPreviewArtifacts = shouldShowHomepagePreviewArtifacts(runtimeEnv);

  return [
    {
      id: "fallback-hero",
      kind: "hero-banner",
      headline: "Everyday essentials, one clear deal at a time.",
      description:
        "The homepage is now section-based and ready for CMS/admin-driven updates without code deployments.",
      primaryCtaLabel: "Browse categories",
      primaryCtaHref: routes.storefront.categories,
      ...(showPreviewArtifacts ? { secondaryCta: { label: "Preview storefront shell", href: routes.storefront.preview } } : {}),
      eyebrow: "CMS-ready homepage foundation",
      displayOrder: 10,
    },
    {
      id: "fallback-featured-categories",
      kind: "featured-categories",
      title: "Featured categories",
      description: "Initial sections can be managed later from admin campaigns and homepage settings.",
      displayOrder: 20,
      categories: [
        {
          id: "cat-home-care",
          title: "Home Care",
          description: "Cleaning and household essentials for weekly restocks.",
          href: routes.storefront.category("home-care"),
        },
        {
          id: "cat-grocery",
          title: "Grocery",
          description: "Pantry staples, snacks, and quick top-ups.",
          href: routes.storefront.category("grocery"),
        },
        {
          id: "cat-personal-care",
          title: "Personal Care",
          description: "Daily hygiene and wellness picks.",
          href: routes.storefront.category("personal-care"),
        },
      ],
    },
    {
      // One Dollar section: products are hydrated at runtime from the catalog.
      // This fallback defines the section shell; real products are injected by
      // hydrateOneDollarSection() in the homepage service.
      id: "fallback-one-dollar",
      kind: "one-dollar",
      title: "One Dollar deals",
      description: `Products priced at PKR ${ONE_DOLLAR_MAX_PRICE_PKR} or less — the best value picks across all categories.`,
      displayOrder: 25,
      products: [],
      ctaLabel: "View all One Dollar deals",
      ctaHref: routes.storefront.category(ONE_DOLLAR_CATEGORY_SLUG),
      placeholderMessage: "No One Dollar products are available right now. Check back soon for fresh picks.",
    },
    {
      id: "fallback-featured-products",
      kind: "featured-products",
      title: "Featured products",
      description: "A rotating set of featured products from the current catalog.",
      displayOrder: 30,
      products: [
        {
          id: "prod-detergent",
          name: "Ultra Wash Detergent 1kg",
          description: "Powerful cleaning formula for everyday laundry.",
          href: routes.storefront.preview,
          price: 899,
          compareAt: 1099,
          badge: "Top pick",
        },
        {
          id: "prod-olive-oil",
          name: "Olive Blend Cooking Oil 1L",
          description: "Premium blend ideal for frying and salads.",
          href: routes.storefront.preview,
          price: 1299,
          compareAt: 1499,
        },
        {
          id: "prod-skin-care",
          name: "Hydra Care Face Wash",
          description: "Gentle daily cleanser for all skin types.",
          href: routes.storefront.preview,
          price: 699,
        },
      ],
    },
    {
      id: "fallback-deal-spotlight",
      kind: "deal-spotlight",
      title: "Deal spotlight",
      description: "Campaign-ready banner block for short-term promotions managed from admin.",
      dealLabel: "48-hour flash deal",
      price: 1599,
      compareAt: 1999,
      ctaLabel: "View deal",
      ctaHref: routes.storefront.preview,
      displayOrder: 40,
    },
    {
      id: "fallback-blog-highlights",
      kind: "blog-highlights",
      title: "Blog highlights",
      description: "Latest published stories and practical buying guides.",
      placeholderMessage: "No published blog highlights are available right now.",
      displayOrder: 50,
      articles: [],
    },
  ];
}

export const HOMEPAGE_FALLBACK_SECTIONS: HomepageSection[] = buildHomepageFallbackSections();
