import type { CarouselOptions } from "@/components/ui/carousel";

// Scale card density with viewport width: fewer cards on small screens and more on larger screens.
export const FEATURED_CATEGORIES_CAROUSEL_ITEM_CLASS =
  "basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4";

export const FEATURED_CATEGORIES_CAROUSEL_OPTIONS: CarouselOptions = {
  align: "start",
};
