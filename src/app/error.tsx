"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
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
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-start justify-center gap-4 px-4 py-12 sm:px-6">
      <p className="text-primary text-sm font-medium">Something needs attention</p>
      <h2 className="text-2xl font-semibold tracking-tight">We hit a recoverable error.</h2>
      <p className="text-muted-foreground">{toUserMessage(error)}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
