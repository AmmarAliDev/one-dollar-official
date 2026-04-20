import { env } from "@/config/env";

/**
 * Resolves an absolute canonical URL from a given path or external URL.
 */
export function resolveCanonicalUrl(pathOrUrl: string = "/"): string {
  if (!pathOrUrl || pathOrUrl.trim() === "") {
    pathOrUrl = "/";
  }

  // If it's already an absolute URL (http/https), return it directly
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  // Ensure path starts with a slash
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;

  // Remove trailing slashes for consistency
  const canonicalPath = cleanPath === "/" 
    ? "" 
    : cleanPath.endsWith("/") 
      ? cleanPath.slice(0, -1) 
      : cleanPath;

  // Combine with appUrl (which should not have a trailing slash)
  const appBaseUrl = env.appUrl.endsWith("/") ? env.appUrl.slice(0, -1) : env.appUrl;

  return `${appBaseUrl}${canonicalPath}`;
}

/**
 * Generates a clean, URL-safe SEO slug from a given string.
 */
export function generateSlug(text: string): string {
  if (!text) return "";

  return text
    .normalize("NFD") // split accented characters into their base chars + diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric characters except spaces and hyphens
    .replace(/[\s-]+/g, "-") // replace spaces and multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // strip leading and trailing hyphens
}

/**
 * Validates if a string is a properly formatted SEO slug.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.trim() === "") return false;
  
  // Only lowercase alphanumeric and single hyphens allowed, no leading/trailing hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
