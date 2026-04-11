import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-12 sm:px-6">
      <EmptyState
        title="This page does not exist yet"
        description="The visual foundation is in place, but the requested route has not been implemented in this phase."
        className="w-full"
        action={
          <div className="flex flex-wrap gap-3">
            <Link href={routes.storefront.home} className={buttonVariants()}>
              Go to storefront
            </Link>
            <Link href={routes.admin.dashboard} className={buttonVariants({ variant: "outline" })}>
              Visit admin placeholder
            </Link>
          </div>
        }
      />
    </main>
  );
}
