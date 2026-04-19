import { loadHomepageContentForStorefront } from "@/features/admin/homepage/service";
import { createLogger } from "@/lib/logger";

import { resolveHomepageSections } from "./resolver";
import type { HomepageContent, HomepageContentResult } from "./types";

const logger = createLogger("homepage.service");

export async function fetchHomepageContentFromCms(): Promise<HomepageContent | null> {
  try {
    const content = await loadHomepageContentForStorefront();

    if (!content || !content.sections?.length) {
      logger.debug("No admin-managed homepage content is available; using fallback content.");
      return null;
    }

    return content;
  } catch (error) {
    logger.error("Failed to load homepage content from admin-managed sources.", error);
    return null;
  }
}

export async function getHomepageContent(): Promise<HomepageContentResult> {
  const cmsContent = await fetchHomepageContentFromCms();

  return resolveHomepageSections(cmsContent?.sections);
}
