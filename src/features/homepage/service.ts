import { loadHomepageContentForStorefront } from "@/features/admin/homepage/service";
import { type CatalogProductCard,getCatalogCategories, getCatalogCategoryListing } from "@/features/catalog";
import { ONE_DOLLAR_CATEGORY_SLUG } from "@/features/catalog/one-dollar";
import { createLogger } from "@/lib/logger";

import { mapCatalogCategoriesToFeaturedCategoryItems } from "./featured-categories";
import { resolveHomepageFeaturedProducts } from "./featured-products";
import { resolveHomepageSections } from "./resolver";
import type {
  FeaturedCategoriesSection,
  FeaturedProductItem,
  FeaturedProductsSection,
  HomepageContent,
  HomepageContentResult,
  HomepageSection,
  OneDollarSection,
} from "./types";

const logger = createLogger("homepage.service");
/**
 * Maximum number of One Dollar products fetched from the catalog for the
 * homepage section. Matches HOMEPAGE_CAROUSEL_MAX_ITEMS so the carousel can
 * display the full set without server-side truncation.
 */
const HOMEPAGE_ONE_DOLLAR_PRODUCTS_LIMIT = 8;

function isFeaturedCategoriesSection(section: HomepageSection): section is FeaturedCategoriesSection {
  return section.kind === "featured-categories";
}

function isFeaturedProductsSection(section: HomepageSection): section is FeaturedProductsSection {
  return section.kind === "featured-products";
}

async function hydrateFeaturedCategorySections(sections: HomepageSection[]): Promise<HomepageSection[]> {
  const hasFeaturedCategoriesSection = sections.some(isFeaturedCategoriesSection);

  if (!hasFeaturedCategoriesSection) {
    return sections;
  }

  try {
    const catalogCategories = await getCatalogCategories();
    const categories = mapCatalogCategoriesToFeaturedCategoryItems(catalogCategories);

    if (categories.length === 0) {
      return sections;
    }

    return sections.map((section) => {
      if (!isFeaturedCategoriesSection(section)) {
        return section;
      }

      return {
        ...section,
        categories,
      };
    });
  } catch (error) {
    logger.error("Failed to hydrate homepage featured categories from catalog categories.", error);
    return sections;
  }
}

async function hydrateFeaturedProductsSections(sections: HomepageSection[]): Promise<HomepageSection[]> {
  const featuredProductsSections = sections.filter(isFeaturedProductsSection);

  if (featuredProductsSections.length === 0) {
    return sections;
  }

  const fallbackProducts = featuredProductsSections[0]?.products ?? [];
  const products = await resolveHomepageFeaturedProducts(fallbackProducts);

  return sections.map((section) => {
    if (!isFeaturedProductsSection(section)) {
      return section;
    }

    return {
      ...section,
      products,
    };
  });
}

function isOneDollarSection(section: HomepageSection): section is OneDollarSection {
  return section.kind === "one-dollar";
}

/**
 * Maps a CatalogProductCard to a FeaturedProductItem for use in the One Dollar
 * homepage section. Adds a "One Dollar" badge to surface the value proposition.
 */
function toOneDollarProductItem(card: CatalogProductCard): FeaturedProductItem {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    ...(card.description ? { description: card.description } : {}),
    href: card.href,
    price: card.price,
    ...(typeof card.compareAt === "number" ? { compareAt: card.compareAt } : {}),
    badge: "One Dollar",
    inventoryQuantity: card.inventoryQuantity,
    ...(card.imageUrl
      ? {
          images: [
            {
              url: card.imageUrl,
              alt: card.name,
              isPrimary: true,
            },
          ],
        }
      : {}),
  };
}

/**
 * Hydrates any `one-dollar` sections in the resolved list with live catalog
 * products. If the catalog fetch fails, the section renders its empty state
 * gracefully instead of breaking the page.
 */
async function hydrateOneDollarSections(sections: HomepageSection[]): Promise<HomepageSection[]> {
  const hasOneDollarSection = sections.some(isOneDollarSection);

  if (!hasOneDollarSection) {
    return sections;
  }

  try {
    const listing = await getCatalogCategoryListing({
      slug: ONE_DOLLAR_CATEGORY_SLUG,
      searchParams: {
        sort: "featured",
        page: "1",
        pageSize: String(HOMEPAGE_ONE_DOLLAR_PRODUCTS_LIMIT),
      },
    });

    const products: FeaturedProductItem[] = listing
      ? listing.products.slice(0, HOMEPAGE_ONE_DOLLAR_PRODUCTS_LIMIT).map(toOneDollarProductItem)
      : [];

    return sections.map((section) => {
      if (!isOneDollarSection(section)) {
        return section;
      }

      return { ...section, products };
    });
  } catch (error) {
    logger.error("Failed to hydrate One Dollar homepage section from catalog.", error);
    // Return sections unchanged so the component renders its placeholder state.
    return sections;
  }
}

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
  const resolved = resolveHomepageSections(cmsContent?.sections);
  const hydratedWithCategories = await hydrateFeaturedCategorySections(resolved.sections);
  const hydratedWithFeaturedProducts = await hydrateFeaturedProductsSections(hydratedWithCategories);
  const hydratedSections = await hydrateOneDollarSections(hydratedWithFeaturedProducts);

  return {
    ...resolved,
    sections: hydratedSections,
  };
}
