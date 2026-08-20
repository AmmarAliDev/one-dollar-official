import type { ReactNode } from "react";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { CatalogSearchCommandDialog } from "@/features/catalog/components/catalog-search-command-dialog";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <AppFooter />
      <CartDrawer />
      <CatalogSearchCommandDialog />
    </div>
  );
}
