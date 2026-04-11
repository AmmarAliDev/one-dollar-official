import type { RuntimeEnv } from "@/config/env";
import type { NavItem } from "@/types/app";

import { env } from "./env";
import { routes } from "./routes";

export const primaryNav: NavItem[] = [
  {
    title: "Storefront",
    href: routes.storefront.home,
    description: "Customer-facing e-commerce experience.",
  },
  {
    title: "Admin",
    href: routes.admin.dashboard,
    description: "Back-office operations and content management.",
  },
  {
    title: "Auth",
    href: routes.auth.signIn,
    description: "Authentication entry points and future account flows.",
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
    primaryNav,
  } as const;
}

export const siteConfig = loadSiteConfig();
