import type { NavItem } from "@/types/app";

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

export const siteConfig = {
  name: "One Dollar",
  shortName: "One Dollar",
  description:
    "Production-ready Karachi-first e-commerce foundation built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui patterns.",
  locale: "en-PK",
  country: "Pakistan",
  defaultCity: "Karachi",
  supportEmail: "support@onedollar.local",
  primaryNav,
} as const;
