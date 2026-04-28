// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AdminProductForm } from "@/features/admin/products/components/admin-product-form";

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

async function fillRequiredProductFields(user: ReturnType<typeof userEvent.setup>) {
  const titleInput = document.getElementById("product-title");
  const slugInput = document.getElementById("product-slug");
  const skuInput = document.getElementById("product-sku");

  if (!(titleInput instanceof HTMLInputElement) || !(slugInput instanceof HTMLInputElement) || !(skuInput instanceof HTMLInputElement)) {
    throw new Error("Expected required product form fields to be rendered.");
  }

  await user.type(titleInput, "Daily Face Wash");
  await user.type(slugInput, "daily-face-wash");
  await user.type(skuInput, "FACE-WASH-001");
}

function getSubmittedFormData(actionMock: ReturnType<typeof vi.fn>) {
  const firstCall = actionMock.mock.calls[0];

  if (!firstCall) {
    throw new Error("Expected the form action to be called once before reading FormData.");
  }

  return firstCall[0] as FormData;
}

describe("AdminProductForm", () => {
  it("writes uploaded image URLs into the existing imageUrl payload fields", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          url: "https://store.public.blob.vercel-storage.com/admin/product/product-123.png",
          pathname: "admin/product/product-123.png",
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
      <AdminProductForm
        mode="create"
        action={actionMock}
        returnTo="/admin/products"
        submitLabel="Create product"
        categories={[{ id: "category-1", name: "Skincare", slug: "skincare", status: "PUBLISHED" }]}
        relatedProducts={[]}
      />,
    );

    await fillRequiredProductFields(user);
    await user.click(screen.getByRole("button", { name: /add image/i }));

    const fileInputs = container.querySelectorAll('input[type="file"]');
    const productImageUploadInput = fileInputs[0];
    if (!(productImageUploadInput instanceof HTMLInputElement)) {
      throw new Error("Expected the product image upload input to be rendered.");
    }

    await user.upload(productImageUploadInput, new File(["product"], "product.png", { type: "image/png" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    const payload = getSubmittedFormData(actionMock);
    expect(payload.getAll("imageUrl")).toEqual([
      "https://store.public.blob.vercel-storage.com/admin/product/product-123.png",
    ]);
    expect(payload.getAll("imageAlt")).toEqual([""]);
  }, 15_000);

  it("keeps backward compatibility for manually pasted image URLs", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(
      <AdminProductForm
        mode="create"
        action={actionMock}
        returnTo="/admin/products"
        submitLabel="Create product"
        categories={[{ id: "category-1", name: "Skincare", slug: "skincare", status: "PUBLISHED" }]}
        relatedProducts={[]}
      />,
    );

    await fillRequiredProductFields(user);
    await user.click(screen.getByRole("button", { name: /add image/i }));
    await user.type(screen.getByLabelText(/Image URL/i), "https://cdn.example.com/catalog/face-wash.jpg");

    await user.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    const payload = getSubmittedFormData(actionMock);
    expect(payload.getAll("imageUrl")).toEqual(["https://cdn.example.com/catalog/face-wash.jpg"]);
    expect(fetchMock).not.toHaveBeenCalled();
  }, 15_000);
});
