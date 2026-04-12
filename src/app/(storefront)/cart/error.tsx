"use client";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function CartErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageShell>
      <ErrorState
        title="We could not load your cart"
        description="Try reloading this page. If the issue continues, please return to shopping and try again."
        action={
          <Button type="button" variant="outline" onClick={reset}>
            Retry cart load
          </Button>
        }
      />
    </PageShell>
  );
}
