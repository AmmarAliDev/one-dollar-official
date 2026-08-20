import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { buildMetadata } from "@/config/metadata";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { CatalogSearchCommandDialog } from "@/features/catalog/components/catalog-search-command-dialog";
import { getHomepageContent, renderHomepageSection } from "@/features/homepage";
import { HomepageContentSourceIndicator } from "@/features/homepage/components/homepage-content-source-indicator";

export const metadata = buildMetadata({
  title: "Home",
  path: "/",
  description: "Section-based homepage foundation with CMS-ready rendering and fallback support.",
});

export default async function HomePage() {
  const homepageContent = await getHomepageContent();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main id="main-content" className="flex-1">
        <HomepageContentSourceIndicator source={homepageContent.source} />
        {homepageContent.sections.map(renderHomepageSection)}
      </main>

      <AppFooter />
      <CartDrawer />
      <CatalogSearchCommandDialog />
    </div>
  );
}
