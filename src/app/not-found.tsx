import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { shouldRenderGuardedSurface } from "@/config/production-visibility";
import { routes } from "@/config/routes";

export default function NotFound() {
  const showAdminPlaceholderAction = shouldRenderGuardedSurface("notFoundAdminPlaceholderAction");

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-12 sm:px-6">
      <EmptyState
        title="Page not found"
        description="The page you requested could not be found or is not available in this environment."
        className="w-full"
        action={
          <div className="flex flex-wrap gap-3">
            <Link href={routes.storefront.home} className={buttonVariants()}>
              Go to storefront
            </Link>
            {showAdminPlaceholderAction ? (
              <Link href={routes.admin.dashboard} className={buttonVariants({ variant: "outline" })}>
                Visit admin
              </Link>
            ) : null}
          </div>
        }
      />
    </main>
  );
}
