import { HOMEPAGE_CAROUSEL_OPTIONS } from "./homepage-carousel-config";

/**
 * Featured categories use a denser card layout than products at large viewports.
 *
 * Keep mobile through `lg` aligned with shared homepage carousel behavior,
 * then hold `xl` and `2xl` at 4-up to preserve label readability.
 */
export const FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS =
  "basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:!basis-1/4 2xl:!basis-1/4";

/** Embla options shared with other homepage carousel sections. */
export const FEATURED_CATEGORIES_CAROUSEL_OPTIONS = HOMEPAGE_CAROUSEL_OPTIONS;
