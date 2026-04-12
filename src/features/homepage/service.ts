import { createLogger } from "@/lib/logger";

import { resolveHomepageSections } from "./resolver";
import type { HomepageContent, HomepageContentResult } from "./types";

const logger = createLogger("homepage.service");

export async function fetchHomepageContentFromCms(): Promise<HomepageContent | null> {
  logger.debug("CMS homepage fetch is not configured yet; using fallback content.");

  return null;
}

export async function getHomepageContent(): Promise<HomepageContentResult> {
  const cmsContent = await fetchHomepageContentFromCms();

  return resolveHomepageSections(cmsContent?.sections);
}
