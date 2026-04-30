/**
 * Returns a safe, renderable storefront image URL or undefined.
 *
 * Accepted values:
 * - Root-relative paths (`/images/product.jpg`)
 * - Absolute HTTP(S) URLs
 *
 * Rejected values include empty strings and unsupported protocols
 * like `javascript:` / `data:` to avoid unsafe or broken rendering.
 */
export function normalizeCatalogImageUrl(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const candidate = value.trim();

  if (!candidate) {
    return undefined;
  }

  if (candidate.startsWith("/")) {
    return candidate;
  }

  try {
    const parsedUrl = new URL(candidate);

    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return candidate;
    }

    return undefined;
  } catch {
    return undefined;
  }
}
