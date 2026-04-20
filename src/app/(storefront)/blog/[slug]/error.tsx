"use client";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function BlogPostErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageShell>
      <ErrorState
        title="We could not load this article"
        description="Try loading this page again. If the issue continues, return to the blog listing."
        action={
          <Button type="button" variant="outline" onClick={reset}>
            Retry article load
          </Button>
        }
      />
    </PageShell>
  );
}
