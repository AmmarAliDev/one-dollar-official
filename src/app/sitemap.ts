import type { MetadataRoute } from "next";

import { env } from "@/config/env";
import { siteConfig } from "@/config/site";

// Consider generating from db in real world if needed
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.appUrl.endsWith("/") ? env.appUrl.slice(0, -1) : env.appUrl;

  const routes = siteConfig.storefrontNav.map((route) => ({
    url: `${baseUrl}${route.href}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route.href === "/" ? 1.0 : 0.8,
  }));

  // Dynamic routes (products, categories, posts) would typically be
  // fetched here with their respective updated dates and priorities.
  // We provide the static structure for sitemap to be extended via ISR later.

  return [...routes];
}
