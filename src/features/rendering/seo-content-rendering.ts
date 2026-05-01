export const SEO_CONTENT_REVALIDATE_SECONDS = 900;

export type CategoryStaticParam = { slug: string };

export type ProductSlugWithCategory = {
  slug: string;
  categorySlug: string | null | undefined;
};

export type ProductStaticParam = {
  slug: string;
  productSlug: string;
};

export function toCategoryStaticParams(slugs: readonly string[]): CategoryStaticParam[] {
  return slugs.map((slug) => ({ slug }));
}

export function toProductStaticParams(
  products: readonly ProductSlugWithCategory[],
): ProductStaticParam[] {
  return products.flatMap((product) => {
    const categorySlug = product.categorySlug?.trim();

    if (!categorySlug) {
      return [];
    }

    return [{ slug: categorySlug, productSlug: product.slug }];
  });
}

export function toBlogStaticParams(slugs: readonly string[]): CategoryStaticParam[] {
  return slugs.map((slug) => ({ slug }));
}
