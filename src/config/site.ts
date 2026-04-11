import type { RuntimeEnv } from "@/config/env";
import type { NavItem } from "@/types/app";

import { env } from "./env";
import { routes } from "./routes";

export const storefrontNav: NavItem[] = [
  {
    title: "Preview",
    href: routes.storefront.preview,
    description: "Customer-facing shell preview.",
  },
  {
    title: "Why One Dollar",
    href: `${routes.storefront.home}#why-one-dollar`,
    description: "Brand promise and delivery positioning.",
  },
  {
    title: "UI Foundation",
    href: `${routes.storefront.home}#ui-foundation`,
    description: "Design system and loading state showcase.",
  },
];

export const adminNav: NavItem[] = [
  {
    title: "Overview",
    href: routes.admin.dashboard,
    description: "Dashboard and daily ops snapshot.",
  },
  {
    title: "Catalog",
    href: `${routes.admin.dashboard}#catalog`,
    description: "Product and inventory tools placeholder.",
  },
  {
    title: "Orders",
    href: `${routes.admin.dashboard}#orders`,
    description: "Fulfillment and status workflow placeholder.",
  },
  {
    title: "Content",
    href: `${routes.admin.dashboard}#content`,
    description: "Homepage and SEO controls placeholder.",
  },
];

export function loadSiteConfig(runtimeEnv: RuntimeEnv = env) {
  return {
    name: "One Dollar",
    shortName: "One Dollar",
    description:
      "Production-ready Karachi-first e-commerce foundation built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui patterns.",
    locale: "en-PK",
    country: "Pakistan",
    defaultCity: runtimeEnv.defaultCity,
    supportEmail: "support@onedollar.local",
    primaryNav: storefrontNav,
    storefrontNav,
    adminNav,
  } as const;
}

export const siteConfig = loadSiteConfig();
