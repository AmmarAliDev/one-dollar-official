// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { useAppForm, useServerActionSubmit } from "@/components/forms";
import { AdminCategoryForm } from "@/features/admin/categories/components/admin-category-form";

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal(
    "PointerEvent",
    class PointerEventMock extends MouseEvent {},
  );

  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AdminCategoryForm", () => {
  it("does not turn a redirect-style success into a server error", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockRejectedValue({
      digest: "NEXT_REDIRECT;push;/admin/categories?notice=created;307;",
    });

    function RedirectHarness() {
      const form = useAppForm({
        schema: z.object({
          name: z.string().min(1),
        }),
        defaultValues: {
          name: "Home Care",
        },
      });
      const { submitWithAction } = useServerActionSubmit(form);

      return (
        <div>
          <button
            type="button"
            onClick={() => {
              const formData = new FormData();
              formData.set("name", "Home Care");
              void submitWithAction(actionMock, formData).catch(() => undefined);
            }}
          >
            Trigger redirect
          </button>

          {form.formState.errors.root?.serverError?.message ? (
            <p>{form.formState.errors.root.serverError.message}</p>
          ) : null}
        </div>
      );
    }

    render(<RedirectHarness />);

    await user.click(screen.getByRole("button", { name: /trigger redirect/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText(/something went wrong on our side/i)).toBeNull();
  });

  it("validates on change and preserves the existing category action payload", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          url: "https://store.public.blob.vercel-storage.com/admin/seo/category-og-123.png",
          pathname: "admin/seo/category-og-123.png",
          size: 2048,
          contentType: "image/png",
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const { container } = render(
      <AdminCategoryForm
        action={actionMock}
        submitLabel="Create category"
        returnTo="/admin/categories"
      />,
    );

    await user.type(screen.getByLabelText(/slug/i), "Home Care");

    await waitFor(() => {
      expect(screen.getAllByText(/single hyphens/i).length).toBeGreaterThan(0);
    });

    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), "Home Care");
    await user.clear(screen.getByLabelText(/slug/i));
    await user.type(screen.getByLabelText(/slug/i), "home-care");

    const uploadInput = container.querySelector('input[type="file"]');
    if (!(uploadInput instanceof HTMLInputElement)) {
      throw new Error("Expected the shared SEO upload input to be rendered.");
    }
    await user.upload(uploadInput, new File(["og"], "category-og.png", { type: "image/png" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("button", { name: /create category/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    const payload = actionMock.mock.calls[0]?.[0];

    expect(payload).toBeInstanceOf(FormData);
    expect(payload.get("name")).toBe("Home Care");
    expect(payload.get("slug")).toBe("home-care");
    expect(payload.get("status")).toBe("DRAFT");
    expect(payload.get("returnTo")).toBe("/admin/categories");
    expect(payload.get("seoImageUrl")).toBe("https://store.public.blob.vercel-storage.com/admin/seo/category-og-123.png");
  });
});
