"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { InlineSpinner } from "@/components/ui/inline-spinner";
import { SectionErrorState } from "@/components/ui/section-error-state";
import { AppError } from "@/lib/errors/app-error";
import { toUserMessage } from "@/lib/errors/error-messages";

import { getReviewErrorMessage, getReviewNoticeMessage } from "../flash";
import { CustomerReviewForm } from "./customer-review-form";

type ProductReviewComposerProps = {
  productId: string;
  returnTo: string;
};

type ComposerContextPayload = {
  ok: true;
  context: {
    canSubmit: boolean;
    reason: "AUTH_REQUIRED" | "PURCHASE_REQUIRED" | null;
    existingReview: {
      rating: number;
      title: string | null;
      body: string | null;
      statusLabel: string;
    } | null;
  };
};

async function fetchComposerContext(productId: string) {
  const response = await fetch(`/api/reviews/composer-context?productId=${encodeURIComponent(productId)}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    throw new AppError("Failed to load customer review composer context.", "INTERNAL_ERROR", {
      userMessage: payload?.error ?? "We could not load review controls right now. Please try again.",
    });
  }

  return (await response.json()) as ComposerContextPayload;
}

export function ProductReviewComposer({ productId, returnTo }: ProductReviewComposerProps) {
  const [pending, setPending] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [context, setContext] = useState<ComposerContextPayload["context"] | null>(null);
  const searchParams = useSearchParams();
  const noticeCode = searchParams.get("reviewNotice");
  const reviewNoticeCode =
    noticeCode === "submitted" || noticeCode === "updated"
      ? noticeCode
      : undefined;
  const noticeMessage = getReviewNoticeMessage(noticeCode);
  const reviewErrorMessage = getReviewErrorMessage(searchParams.get("reviewError"));

  const loadComposerContext = useCallback(async () => {
    setPending(true);
    setErrorMessage(null);

    try {
      const payload = await fetchComposerContext(productId);
      setContext(payload.context);
    } catch (error) {
      setErrorMessage(toUserMessage(error));
    } finally {
      setPending(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadComposerContext();
  }, [loadComposerContext]);

  if (pending) {
    return (
      <section className="rounded-lg border border-border/70 bg-muted/20 p-5" aria-live="polite" aria-busy="true">
        <InlineSpinner label="Loading review options" />
      </section>
    );
  }

  if (errorMessage) {
    return (
      <SectionErrorState
        title="Review options are unavailable"
        description={errorMessage}
        retryLabel="Retry"
        onRetry={() => {
          void loadComposerContext();
        }}
      />
    );
  }

  const resolvedContext = context ?? {
    canSubmit: false,
    reason: "AUTH_REQUIRED" as const,
    existingReview: null,
  };

  return (
    <>
      {noticeMessage ? (
        <div role="status" className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900">
          {noticeMessage}
        </div>
      ) : null}

      {reviewErrorMessage ? (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {reviewErrorMessage}
        </div>
      ) : null}

      <CustomerReviewForm
        productId={productId}
        returnTo={returnTo}
        reviewNoticeCode={reviewNoticeCode}
        canSubmit={resolvedContext.canSubmit}
        disabledReason={
          resolvedContext.reason === "AUTH_REQUIRED"
            ? "Sign in to submit your review."
            : resolvedContext.reason === "PURCHASE_REQUIRED"
              ? "Reviews unlock after your delivered order for this product."
              : undefined
        }
        existingReview={resolvedContext.existingReview}
      />
    </>
  );
}
