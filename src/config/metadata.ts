import type { Metadata } from "next";

import { env } from "./env";
import { siteConfig } from "./site";

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
};

export function buildMetadata(options: BuildMetadataOptions = {}): Metadata {
  const title = options.title ? `${options.title} | ${siteConfig.name}` : siteConfig.name;
  const description = options.description ?? siteConfig.description;
  const metadataBase = new URL(env.appUrl);

  return {
    title,
    description,
    metadataBase,
    applicationName: siteConfig.name,
    alternates: {
      canonical: options.path ?? "/",
    },
    openGraph: {
      title,
      description,
      url: options.path ?? "/",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
