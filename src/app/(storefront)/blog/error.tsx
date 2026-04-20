"use client";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function BlogErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageShell>
      <ErrorState
        title="We could not load the blog"
        description="Try loading the page again. If the issue continues, please return later."
        action={
          <Button type="button" variant="outline" onClick={reset}>
            Retry blog load
          </Button>
        }
      />
    </PageShell>
  );
}
