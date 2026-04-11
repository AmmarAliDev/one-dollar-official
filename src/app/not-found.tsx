import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-start justify-center gap-4 px-4 py-12 sm:px-6">
      <p className="text-primary text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">This page does not exist yet.</h1>
      <p className="text-muted-foreground">
        The architecture is in place, but the requested route has not been implemented in this
        phase.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href={routes.storefront.home} className={buttonVariants()}>
          Go to storefront
        </Link>
        <Link href={routes.admin.dashboard} className={buttonVariants({ variant: "outline" })}>
          Visit admin placeholder
        </Link>
      </div>
    </div>
  );
}
