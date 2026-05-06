// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AdminBannerForm } from "@/features/admin/homepage/components/admin-banner-form";
import { AdminDealCampaignForm } from "@/features/admin/homepage/components/admin-deal-campaign-form";
import { AdminHomepageSectionForm } from "@/features/admin/homepage/components/admin-homepage-section-form";

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

function readFormData(formData: FormData) {
  return Object.fromEntries(Array.from(formData.entries()));
}

function getSubmittedFormData(actionMock: ReturnType<typeof vi.fn>) {
  const firstCall = actionMock.mock.calls[0];

  if (!firstCall) {
    throw new Error("Expected the form action to be called once before reading FormData.");
  }

  return firstCall[0] as FormData;
}

describe("admin homepage shared forms", () => {
  it("submits banner values through the shared RHF flow", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          url: "https://store.public.blob.vercel-storage.com/admin/banner/banner-123.png",
          pathname: "admin/banner/banner-123.png",
          size: 1024,
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
      <AdminBannerForm
        action={actionMock}
        submitLabel="Save banner"
        returnTo="/admin/homepage/banners"
      />,
    );

    await user.type(screen.getByLabelText(/^Title/i), "Weekend banner");
    const uploadInput = container.querySelector('input[type="file"]');
    if (!(uploadInput instanceof HTMLInputElement)) {
      throw new Error("Expected the banner upload file input to be rendered.");
    }
    await user.upload(uploadInput, new File(["banner"], "banner.png", { type: "image/png" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByLabelText(/Link target/i), "/categories");
    await user.clear(screen.getByLabelText(/^Order/i));
    await user.type(screen.getByLabelText(/^Order/i), "3");
    await user.type(screen.getByLabelText(/Start time/i), "2026-04-20T08:00");

    await user.click(screen.getByRole("button", { name: /save banner/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    const formData = getSubmittedFormData(actionMock);
    expect(readFormData(formData)).toMatchObject({
      returnTo: "/admin/homepage/banners",
      title: "Weekend banner",
      imageUrl: "https://store.public.blob.vercel-storage.com/admin/banner/banner-123.png",
      href: "/categories",
      position: "3",
      startAt: "2026-04-20T08:00",
    });
    expect(formData.get("active")).toBe("true");
  });

  it("submits campaign values and preserves the existing action payload shape", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminDealCampaignForm
        action={actionMock}
        submitLabel="Save campaign"
        returnTo="/admin/homepage/campaigns"
      />,
    );

    await user.type(screen.getByLabelText(/Campaign name/i), "Flash deal");
    await user.type(screen.getByLabelText(/Description/i), "Short supporting copy");
    await user.type(screen.getByLabelText(/Campaign price/i), "1499");
    await user.type(screen.getByLabelText(/Campaign compare-at/i), "1799");
    await user.type(screen.getByLabelText(/Start time/i), "2026-04-20T08:00");
    await user.type(screen.getByLabelText(/End time/i), "2026-04-21T08:00");

    await user.click(screen.getByRole("button", { name: /save campaign/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    const formData = getSubmittedFormData(actionMock);
    expect(readFormData(formData)).toMatchObject({
      returnTo: "/admin/homepage/campaigns",
      name: "Flash deal",
      description: "Short supporting copy",
      price: "1499",
      compareAt: "1799",
      startsAt: "2026-04-20T08:00",
      endsAt: "2026-04-21T08:00",
    });
    expect(formData.get("active")).toBe("true");
  });

  it("shows section validation feedback and submits JSON content safely", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminHomepageSectionForm
        action={actionMock}
        submitLabel="Save new section"
        returnTo="/admin/homepage/sections"
      />,
    );

    await user.type(screen.getByLabelText(/Internal key/i), "announcement-primary");
    await user.type(screen.getByLabelText(/Admin title/i), "Announcement bar");

    const contentField = screen.getByLabelText(/Content JSON/i);
    await user.clear(contentField);
    await user.type(contentField, "not-json");
    await user.click(screen.getByRole("button", { name: /save new section/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Section content must be a valid JSON object/i).length).toBeGreaterThan(0);
    });

    await user.clear(contentField);
    await user.paste('{"message":"Free delivery today","href":"/categories","label":"Browse deals"}');
    await user.click(screen.getByRole("button", { name: /save new section/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    const formData = getSubmittedFormData(actionMock);
    expect(readFormData(formData)).toMatchObject({
      returnTo: "/admin/homepage/sections",
      key: "announcement-primary",
      title: "Announcement bar",
      type: "announcement-bar",
      position: "0",
    });
    expect(JSON.parse(String(formData.get("content")))).toMatchObject({
      message: "Free delivery today",
      href: "/categories",
      label: "Browse deals",
    });
    expect(formData.get("active")).toBe("true");
  });
});
