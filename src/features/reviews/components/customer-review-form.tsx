"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { submitCustomerReviewAction } from "../actions";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Submitting review..." : "Submit review"}
    </Button>
  );
}

type CustomerReviewFormProps = {
  productId: string;
  returnTo: string;
  canSubmit: boolean;
  disabledReason?: string | undefined;
  existingReview?: {
    rating: number;
    title: string | null;
    body: string | null;
    statusLabel: string;
  } | null;
};

export function CustomerReviewForm({
  productId,
  returnTo,
  canSubmit,
  disabledReason,
  existingReview,
}: CustomerReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 5);

  if (!canSubmit) {
    return (
      <section className="rounded-lg border border-border/70 bg-muted/20 p-5">
        <h3 className="text-base font-semibold tracking-tight">Write a review</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {disabledReason ?? "Reviews are available after your delivered purchase."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border/70 bg-muted/20 p-5">
      <h3 className="text-base font-semibold tracking-tight">Write a review</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {existingReview
          ? `You already reviewed this product (${existingReview.statusLabel}). Submitting changes will return it to moderation.`
          : "Share your experience. Reviews are moderated before appearing on the storefront."}
      </p>

      <form action={submitCustomerReviewAction} className="mt-4 space-y-4">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="returnTo" value={returnTo} />

        <div className="space-y-2">
          <label htmlFor="customer-review-rating" className="text-sm font-medium">
            Rating
          </label>
          <select
            id="customer-review-rating"
            name="rating"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-[calc(var(--radius)-2px)] border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            required
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Average</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Very poor</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="customer-review-title" className="text-sm font-medium">
            Title (optional)
          </label>
          <Input
            id="customer-review-title"
            name="title"
            maxLength={120}
            placeholder="Short summary"
            defaultValue={existingReview?.title ?? ""}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="customer-review-body" className="text-sm font-medium">
            Review
          </label>
          <Textarea
            id="customer-review-body"
            name="body"
            required
            minLength={20}
            maxLength={2000}
            placeholder="Tell other customers what you liked and what could be improved."
            defaultValue={existingReview?.body ?? ""}
          />
          <p className="text-xs text-muted-foreground">Minimum 20 characters. Keep feedback respectful and relevant.</p>
        </div>

        <SubmitButton />
      </form>
    </section>
  );
}