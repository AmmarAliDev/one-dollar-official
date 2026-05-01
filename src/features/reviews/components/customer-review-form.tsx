"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { DynamicForm, type DynamicFormFieldConfig, useAppForm, useServerActionSubmit } from "@/components/forms";
import { useIsMobile } from "@/hooks/use-mobile";
import { z } from "zod";

import { submitCustomerReviewAction } from "../actions";
import { customerReviewSchema } from "../validation";

type CustomerReviewFormProps = {
  productId: string;
  returnTo: string;
  reviewNoticeCode?: "submitted" | "updated" | undefined;
  canSubmit: boolean;
  disabledReason?: string | undefined;
  existingReview?: {
    rating: number;
    title: string | null;
    body: string | null;
    statusLabel: string;
  } | null;
};

const customerReviewClientSchema = customerReviewSchema.extend({
  returnTo: z.string().trim().min(1, "Return path is required.").max(2048, "Return path is too long."),
});

type CustomerReviewFormValues = z.infer<typeof customerReviewClientSchema>;

function buildCustomerReviewFormData(values: CustomerReviewFormValues) {
  const formData = new FormData();
  formData.set("productId", values.productId);
  formData.set("returnTo", values.returnTo);
  formData.set("rating", String(values.rating));
  formData.set("title", values.title ?? "");
  formData.set("body", values.body);
  return formData;
}

const ratingOptions = [
  { value: 5, label: "5 - Excellent" },
  { value: 4, label: "4 - Good" },
  { value: 3, label: "3 - Average" },
  { value: 2, label: "2 - Poor" },
  { value: 1, label: "1 - Very poor" },
] as const;

/**
 * Customer-facing review form with mobile-responsive collapse behavior.
 *
 * Mobile: starts collapsed by default; a toggle button in the section header
 * expands or collapses the form body. After a successful submit the server
 * action redirects back to the page, which re-mounts this component — the
 * mobile auto-collapse fires again, leaving the form neatly closed.
 *
 * Desktop: always expanded; the toggle button is not rendered.
 */
export function CustomerReviewForm({
  productId,
  returnTo,
  reviewNoticeCode,
  canSubmit,
  disabledReason,
  existingReview,
}: CustomerReviewFormProps) {
  const form = useAppForm<CustomerReviewFormValues>({
    schema: customerReviewClientSchema,
    defaultValues: {
      productId,
      returnTo,
      rating: existingReview?.rating ?? 5,
      title: existingReview?.title ?? "",
      body: existingReview?.body ?? "",
    },
  });
  const { submitWithAction } = useServerActionSubmit(form);

  // Expansion state: true = visible, false = hidden.
  // Start expanded (safe for SSR and desktop). The effect below collapses
  // it once on the first mobile detection, mimicking a "default collapsed on
  // mobile" without requiring a server-side viewport signal.
  const [isExpanded, setIsExpanded] = useState(true);
  const hasAutoCollapsedRef = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Auto-collapse once on mobile. Using a ref prevents re-collapsing on
    // every re-render (e.g. when the user manually expands then resizes).
    
    if (isMobile && !hasAutoCollapsedRef.current) {
      setIsExpanded(false);
      hasAutoCollapsedRef.current = true;
    }
  }, [isMobile]);

  useEffect(() => {
    if (!reviewNoticeCode) {
      return;
    }

    form.reset({
      productId,
      returnTo,
      rating: 5,
      title: "",
      body: "",
    });
  }, [form, productId, returnTo, reviewNoticeCode]);

  function toggleExpanded() {
    setIsExpanded((prev) => !prev);
  }

  const fields: DynamicFormFieldConfig<CustomerReviewFormValues>[] = [
    {
      type: "hidden",
      name: "productId",
    },
    {
      type: "hidden",
      name: "returnTo",
    },
    {
      id: "customer-review-rating",
      type: "custom",
      name: "rating",
      label: "Rating",
      required: true,
      render: ({ field, describedBy, disabled, inputId }) => (
        <select
          id={inputId}
          name={field.name}
          ref={field.ref}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-[calc(var(--radius)-2px)] border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          value={Number(field.value)}
          onBlur={field.onBlur}
          onChange={(event) => field.onChange(Number(event.target.value))}
          aria-describedby={describedBy}
          aria-invalid={form.getFieldState("rating").invalid}
          required
          disabled={disabled}
        >
          {ratingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      id: "customer-review-title",
      type: "text",
      name: "title",
      label: "Title (optional)",
      placeholder: "Short summary",
    },
    {
      id: "customer-review-body",
      type: "textarea",
      name: "body",
      label: "Review",
      required: true,
      placeholder: "Tell other customers what you liked and what could be improved.",
      description: "Minimum 20 characters. Keep feedback respectful and relevant.",
    },
  ];

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
      {/* Header row: title + mobile toggle */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight">Write a review</h3>

        {/* Toggle button is only rendered on mobile viewports */}
        {isMobile ? (
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-controls="review-form-body"
            className="flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isExpanded ? (
              <>
                <span className="sr-only">Collapse</span>
                <ChevronUp className="h-4 w-4" aria-hidden />
              </>
            ) : (
              <>
                <span>Add review</span>
                <ChevronDown className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        ) : null}
      </div>

      {/* Collapsible body — always visible on desktop, toggled on mobile */}
      {isExpanded ? (
        <div id="review-form-body">
          <p className="mt-1 text-sm text-muted-foreground">
            {existingReview
              ? `You already reviewed this product (${existingReview.statusLabel}). Submitting changes will return it to moderation.`
              : "Share your experience. Reviews are moderated before appearing on the storefront."}
          </p>

          <DynamicForm<CustomerReviewFormValues>
            form={form}
            className="mt-4"
            fieldsClassName="gap-4"
            fields={fields}
            submitLabel="Submit review"
            submittingLabel="Submitting review..."
            showErrorSummary
            formErrorTitle="Please review your feedback"
            onSubmit={async (values) => {
              await submitWithAction(submitCustomerReviewAction, buildCustomerReviewFormData(values), {
                onSuccess: () => {
                  form.reset();
                },
              });
            }}
          />
        </div>
      ) : null}
    </section>
  );
}