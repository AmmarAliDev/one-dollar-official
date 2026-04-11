"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { toUserMessage } from "@/lib/errors/error-messages";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary triggered", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-12 sm:px-6">
      <ErrorState
        title="We hit a recoverable error"
        description={toUserMessage(error)}
        action={<Button onClick={() => reset()}>Try again</Button>}
        className="w-full"
      />
    </div>
  );
}
