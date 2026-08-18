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

function isRelatedSearchUrl(input: string | URL | Request): boolean {
  return String(input).includes("/api/admin/products/related-search");
}

function relatedSearchResponse(products: Array<{ id: string; title: string; slug: string; categoryName: string | null }>) {
  return new Response(JSON.stringify({ products }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("AdminProductForm", () => {
  it("writes uploaded image URLs into the existing imageUrl payload fields", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (isRelatedSearchUrl(input)) {
        return relatedSearchResponse([]);
      }

      return new Response(
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
      );
    });

    const { container } = render(
      <AdminProductForm
        mode="create"
        action={actionMock}
        returnTo="/admin/products"
        submitLabel="Create product"
        categories={[{ id: "category-1", name: "Skincare", slug: "skincare", status: "PUBLISHED" }]}
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
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/uploads/images",
        expect.anything(),
      );
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
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (isRelatedSearchUrl(input)) {
        return relatedSearchResponse([]);
      }

      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    });

    render(
      <AdminProductForm
        mode="create"
        action={actionMock}
        returnTo="/admin/products"
        submitLabel="Create product"
        categories={[{ id: "category-1", name: "Skincare", slug: "skincare", status: "PUBLISHED" }]}
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
    expect(fetchMock).not.toHaveBeenCalledWith("/api/admin/uploads/images", expect.anything());
  }, 15_000);

  it("related products picker searches by query and category", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      if (isRelatedSearchUrl(input)) {
        const url = new URL(String(input), "http://localhost");
        const products =
          url.searchParams.get("q") === "wash"
            ? [{ id: "product-2", title: "Face Wash Foam", slug: "face-wash-foam", categoryName: "Skincare" }]
            : [];
        return relatedSearchResponse(products);
      }

      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    });

    render(
      <AdminProductForm
        mode="create"
        action={actionMock}
        returnTo="/admin/products"
        submitLabel="Create product"
        categories={[{ id: "category-1", name: "Skincare", slug: "skincare", status: "PUBLISHED" }]}
      />,
    );

    await fillRequiredProductFields(user);
    await user.type(screen.getByLabelText(/search related products/i), "wash");

    await waitFor(() => {
      const searchCalls = fetchMock.mock.calls.filter(([input]) => isRelatedSearchUrl(input));
      expect(
        searchCalls.some(
          ([input]) => new URL(String(input), "http://localhost").searchParams.get("q") === "wash",
        ),
      ).toBe(true);
    });

    await waitFor(() => {
      expect(screen.getByText("Face Wash Foam")).toBeInTheDocument();
    });

    const searchCalls = fetchMock.mock.calls.filter(([input]) => isRelatedSearchUrl(input));
    const searchCall = searchCalls.at(-1);
    expect(searchCall).toBeTruthy();
    const searchUrl = new URL(String(searchCall?.[0]), "http://localhost");
    expect(searchUrl.searchParams.get("q")).toBe("wash");
    expect(searchUrl.searchParams.get("categoryId")).toBe("category-1");

    await user.click(screen.getByText("Face Wash Foam"));
    await user.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    const payload = getSubmittedFormData(actionMock);
    expect(payload.getAll("relatedProductIds")).toEqual(["product-2"]);
  }, 15_000);
});
