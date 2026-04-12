import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { auth } from "@/auth";
import { PageShell } from "@/components/layout/page-shell";
import { SectionErrorState } from "@/components/ui/section-error-state";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import {
  getCatalogCategory,
  getProductBySlug,
  getProductSlugsWithCategory,
  getRelatedProducts,
} from "@/features/catalog";
import { ProductImageGallery } from "@/features/catalog/components/product-image-gallery";
import { ProductPanel } from "@/features/catalog/components/product-panel";
import { ProductRelatedGrid } from "@/features/catalog/components/product-related-grid";
import { ProductReviews } from "@/features/catalog/components/product-reviews";
import { ProductSpecifications } from "@/features/catalog/components/product-specifications";
import { getWishlistSkusForUser } from "@/features/wishlist";

type ProductPageProps = {
  params: Promise<{ slug: string; productSlug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getProductSlugsWithCategory();

  return slugs.map(({ slug, categorySlug }) => ({ slug: categorySlug, productSlug: slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product || product.categorySlug !== slug) {
    return buildMetadata({ title: "Product", path: `/categories/${slug}/${productSlug}` });
  }

  return buildMetadata({
    title: product.name,
    path: routes.storefront.product(slug, productSlug),
    description: product.shortDescription,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, productSlug } = await params;
  const session = await auth();

  const [product, category, relatedProducts, wishlistSkus] = await Promise.all([
    getProductBySlug(productSlug),
    getCatalogCategory(slug),
    getRelatedProducts(slug, productSlug),
    session?.user?.id ? getWishlistSkusForUser(session.user.id) : Promise.resolve([]),
  ]);

  // Guard: product must exist and belong to this category
  if (!product || product.categorySlug !== slug) {
    notFound();
  }

  if (!category) {
    notFound();
  }

  return (
    <PageShell className="gap-14">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
          <li>
            <Link href={routes.storefront.home} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link href={routes.storefront.category(category.slug)} className="hover:text-foreground transition-colors">
              {category.name}
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Hero: gallery + product panel */}
      <section aria-label="Product overview" className="grid gap-10 lg:grid-cols-2">
        <ProductImageGallery images={product.images} productName={product.name} />
        <ProductPanel product={product} initialWishlistedSkus={wishlistSkus} />
      </section>

      {/* Specifications */}
      {product.specifications.length > 0 ? (
        <ProductSpecifications specifications={product.specifications} />
      ) : null}

      {/* Reviews */}
      <ProductReviews reviews={product.reviews} summary={product.reviewSummary} />

      {/* Related products */}
      {relatedProducts.length > 0 ? (
        <ProductRelatedGrid products={relatedProducts} />
      ) : (
        <SectionErrorState
          title="No related products"
          description="Check back later for more products in this category."
        />
      )}
    </PageShell>
  );
}
