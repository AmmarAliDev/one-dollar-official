// @vitest-environment jsdom

/**
 * Tests for CustomerReviewForm collapsible mobile behavior.
 *
 * Coverage:
 * - Default collapsed state on mobile
 * - Default expanded state on desktop
 * - Expand via toggle button on mobile
 * - Collapse via toggle button when already expanded on mobile
 * - Re-mount (simulating post-submit redirect) restores collapsed default on mobile
 * - Toggle button absent on desktop
 */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the server action — it redirects server-side, so we just need a no-op
vi.mock("@/features/reviews/actions", () => ({
  submitCustomerReviewAction: vi.fn(),
}));

// Mock useFormStatus so SubmitButton renders predictably without a form ancestor
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

// Mock useIsMobile so tests control mobile/desktop viewport independently
// of jsdom's window.innerWidth, making assertions deterministic.
const useIsMobileMock = vi.fn<() => boolean>();

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => useIsMobileMock(),
}));

const BASE_PROPS = {
  productId: "product-1",
  returnTo: "/categories/skincare/daily-face-wash",
  canSubmit: true,
  disabledReason: undefined,
  existingReview: null,
};

afterEach(() => {
  cleanup();
  vi.resetModules();
  vi.clearAllMocks();
});

describe("CustomerReviewForm – mobile collapse behavior", () => {
  beforeEach(() => {
    useIsMobileMock.mockReturnValue(true);
  });

  it("starts collapsed on mobile (form body hidden by default)", async () => {
    const { CustomerReviewForm } = await import(
      "@/features/reviews/components/customer-review-form"
    );

    render(<CustomerReviewForm {...BASE_PROPS} />);

    // The section heading is always visible
    expect(screen.getByRole("heading", { name: /write a review/i })).toBeInTheDocument();

    // Wait for effects to settle: useIsMobile returns true → toggle renders → auto-collapse fires
    const toggle = await screen.findByRole("button", { name: /add review/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    // Form fields must NOT be visible while collapsed
    expect(screen.queryByLabelText(/rating/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/review/i)).not.toBeInTheDocument();
  });

  it("expands the form when the toggle button is clicked", async () => {
    const user = userEvent.setup();
    const { CustomerReviewForm } = await import(
      "@/features/reviews/components/customer-review-form"
    );

    render(<CustomerReviewForm {...BASE_PROPS} />);

    // Wait for mobile auto-collapse to settle
    const toggle = await screen.findByRole("button", { name: /add review/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    // After expanding, button label becomes "Collapse" (sr-only text)
    await waitFor(() => {
      expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    // Form body should now be visible
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit review/i })).toBeInTheDocument();
  });

  it("collapses the form when the toggle is clicked again after expanding", async () => {
    const user = userEvent.setup();
    const { CustomerReviewForm } = await import(
      "@/features/reviews/components/customer-review-form"
    );

    render(<CustomerReviewForm {...BASE_PROPS} />);

    // Wait for mobile auto-collapse to settle
    const expandToggle = await screen.findByRole("button", { name: /add review/i });

    // Expand — button label becomes "Collapse" (sr-only) when expanded
    await user.click(expandToggle);
    const collapseToggle = await screen.findByRole("button", { name: /collapse/i });
    expect(collapseToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();

    // Collapse again
    await user.click(collapseToggle);
    await waitFor(() => {
      expect(screen.queryByLabelText(/rating/i)).not.toBeInTheDocument();
    });
    // Button reverts to "Add review" label
    const revertedToggle = await screen.findByRole("button", { name: /add review/i });
    expect(revertedToggle).toHaveAttribute("aria-expanded", "false");
  });

  it("restores collapsed default after re-mount (simulates post-submit redirect)", async () => {
    const { CustomerReviewForm } = await import(
      "@/features/reviews/components/customer-review-form"
    );

    const { unmount } = render(<CustomerReviewForm {...BASE_PROPS} />);

    // Wait for collapse to settle, then unmount (simulates server-action redirect)
    await screen.findByRole("button", { name: /add review/i });
    unmount();
    vi.resetModules();

    // Ensure mock is still active after module reset
    useIsMobileMock.mockReturnValue(true);

    const { CustomerReviewForm: CustomerReviewFormFresh } = await import(
      "@/features/reviews/components/customer-review-form"
    );

    render(<CustomerReviewFormFresh {...BASE_PROPS} />);

    // Fresh mount on mobile should be collapsed again
    const toggle = await screen.findByRole("button", { name: /add review/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText(/rating/i)).not.toBeInTheDocument();
  });
});

describe("CustomerReviewForm – desktop behavior", () => {
  beforeEach(() => {
    useIsMobileMock.mockReturnValue(false);
  });

  it("starts expanded on desktop (form body visible by default)", async () => {
    const { CustomerReviewForm } = await import(
      "@/features/reviews/components/customer-review-form"
    );

    render(<CustomerReviewForm {...BASE_PROPS} />);

    // All form fields should be immediately visible
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit review/i })).toBeInTheDocument();
  });

  it("does not render a toggle button on desktop", async () => {
    const { CustomerReviewForm } = await import(
      "@/features/reviews/components/customer-review-form"
    );

    render(<CustomerReviewForm {...BASE_PROPS} />);

    // The "Add review" toggle text is only present on mobile
    expect(screen.queryByRole("button", { name: /add review/i })).not.toBeInTheDocument();
    // No collapse toggle either
    expect(screen.queryByRole("button", { name: /collapse/i })).not.toBeInTheDocument();
  });
});

describe("CustomerReviewForm – canSubmit=false (locked state)", () => {
  it("renders the locked message on mobile without a form toggle", async () => {
    useIsMobileMock.mockReturnValue(true);
    const { CustomerReviewForm } = await import(
      "@/features/reviews/components/customer-review-form"
    );

    render(
      <CustomerReviewForm
        {...BASE_PROPS}
        canSubmit={false}
        disabledReason="Sign in to submit your review."
      />,
    );

    expect(screen.getByRole("heading", { name: /write a review/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to submit your review/i)).toBeInTheDocument();
    // No form fields
    expect(screen.queryByLabelText(/rating/i)).not.toBeInTheDocument();
    // No toggle button — the locked state is always visible
    expect(screen.queryByRole("button", { name: /add review/i })).not.toBeInTheDocument();
  });
});
