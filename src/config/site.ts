import type { RuntimeEnv } from "@/config/env";
import type { NavItem } from "@/types/app";

import { env } from "./env";
import { routes } from "./routes";

export const storefrontNav: NavItem[] = [
  {
    title: "Home",
    href: routes.storefront.home,
    description: "Storefront landing page.",
  },
  {
    title: "About",
    href: routes.storefront.about,
    description: "Company story and mission placeholder.",
  },
  {
    title: "Contact",
    href: routes.storefront.contact,
    description: "Customer contact page placeholder.",
  },
  {
    title: "Shipping Policy",
    href: routes.storefront.shippingPolicy,
    description: "Delivery policy placeholder.",
  },
  {
    title: "Returns",
    href: routes.storefront.returnPolicy,
    description: "Return policy placeholder.",
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
