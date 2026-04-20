import type { Metadata } from "next";

import { env } from "./env";
import { siteConfig } from "./site";

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  canonicalUrl?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  noIndex?: boolean;
};

function resolveMetadataUrl(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

export function buildMetadata(options: BuildMetadataOptions = {}): Metadata {
  const title = options.title ? `${options.title} | ${siteConfig.name}` : siteConfig.name;
  const description = options.description ?? siteConfig.description;
  const metadataBase = new URL(env.appUrl);
  const canonical = resolveMetadataUrl(options.canonicalUrl, options.path ?? "/");
  const openGraphTitle = options.openGraphTitle ?? title;
  const openGraphDescription = options.openGraphDescription ?? description;
  const openGraphImage = options.openGraphImage?.trim() || undefined;

  return {
    title,
    description,
    metadataBase,
    applicationName: siteConfig.name,
    alternates: {
      canonical,
    },
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      ...(openGraphImage
        ? {
            images: [
              {
                url: openGraphImage,
                alt: openGraphTitle,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: openGraphImage ? "summary_large_image" : "summary",
      title: openGraphTitle,
      description: openGraphDescription,
      ...(openGraphImage ? { images: [openGraphImage] } : {}),
    },
    robots: options.noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  };
}
