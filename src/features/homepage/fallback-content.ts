import { routes } from "@/config/routes";

import type { HomepageSection } from "./types";

export const HOMEPAGE_FALLBACK_SECTIONS: HomepageSection[] = [
  {
    id: "fallback-hero",
    kind: "hero-banner",
    headline: "Everyday essentials, one clear deal at a time.",
    description:
      "The homepage is now section-based and ready for CMS/admin-driven updates without code deployments.",
    primaryCtaLabel: "Shop featured deals",
    primaryCtaHref: routes.storefront.search,
    secondaryCtaLabel: "Preview storefront shell",
    secondaryCtaHref: routes.storefront.preview,
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
        href: `${routes.storefront.search}?category=home-care`,
      },
      {
        id: "cat-grocery",
        title: "Grocery",
        description: "Pantry staples, snacks, and quick top-ups.",
        href: `${routes.storefront.search}?category=grocery`,
      },
      {
        id: "cat-personal-care",
        title: "Personal Care",
        description: "Daily hygiene and wellness picks.",
        href: `${routes.storefront.search}?category=personal-care`,
      },
    ],
  },
  {
    id: "fallback-featured-products",
    kind: "featured-products",
    title: "Featured products",
    description: "Placeholder product highlights until catalog modules are connected.",
    displayOrder: 30,
    products: [
      {
        id: "prod-detergent",
        name: "Ultra Wash Detergent 1kg",
        href: routes.storefront.preview,
        price: 899,
        compareAt: 1099,
        badge: "Top pick",
      },
      {
        id: "prod-olive-oil",
        name: "Olive Blend Cooking Oil 1L",
        href: routes.storefront.preview,
        price: 1299,
        compareAt: 1499,
      },
      {
        id: "prod-skin-care",
        name: "Hydra Care Face Wash",
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
    description: "Editorial slots can be wired once content tooling is connected.",
    placeholderMessage: "No published blog content yet. This area is reserved for CMS highlights.",
    displayOrder: 50,
    articles: [],
  },
];
