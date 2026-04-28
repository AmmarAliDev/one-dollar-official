// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminSettingsForm } from "@/features/admin/settings/components/admin-settings-form";

afterEach(() => {
  cleanup();
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

describe("admin settings form", () => {
  it("renders first-pass settings sections", () => {
    render(
      <AdminSettingsForm
        action={vi.fn()}
        returnTo="/admin/settings"
        initialValues={{
          id: "default",
          storeName: "One Dollar",
          storeTagline: "",
          supportEmail: "support@onedollar.pk",
          supportPhone: "",
          supportWhatsapp: "",
          supportHours: "Mon-Sat, 9:00 AM to 6:00 PM",
          shippingOriginCity: "Karachi",
          shippingFlatRate: 250,
          shippingFreeThreshold: undefined,
          dispatchLeadTimeDays: 1,
          lowStockThreshold: 5,
          allowBackorders: false,
          updatedAt: new Date("2026-04-27T10:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByText(/Store identity basics/i)).toBeInTheDocument();
    expect(screen.getByText(/Support contact info/i)).toBeInTheDocument();
    expect(screen.getByText(/Shipping basics/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational defaults/i)).toBeInTheDocument();
  });

  it("submits expected form payload for settings save", async () => {
    const user = userEvent.setup();
    const actionMock = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminSettingsForm
        action={actionMock}
        returnTo="/admin/settings"
        initialValues={{
          id: "default",
          storeName: "One Dollar",
          storeTagline: "",
          supportEmail: "support@onedollar.pk",
          supportPhone: "",
          supportWhatsapp: "",
          supportHours: "Mon-Sat, 9:00 AM to 6:00 PM",
          shippingOriginCity: "Karachi",
          shippingFlatRate: 250,
          shippingFreeThreshold: undefined,
          dispatchLeadTimeDays: 1,
          lowStockThreshold: 5,
          allowBackorders: false,
          updatedAt: new Date("2026-04-27T10:00:00.000Z"),
        }}
      />,
    );

    await user.clear(screen.getByLabelText(/^Store name/i));
    await user.type(screen.getByLabelText(/^Store name/i), "One Dollar Store");
    await user.clear(screen.getByLabelText(/^Support email/i));
    await user.type(screen.getByLabelText(/^Support email/i), "help@onedollar.pk");
    await user.clear(screen.getByLabelText(/^Flat shipping fee/i));
    await user.type(screen.getByLabelText(/^Flat shipping fee/i), "300");
    await user.clear(screen.getByLabelText(/^Free-shipping threshold/i));
    await user.type(screen.getByLabelText(/^Free-shipping threshold/i), "4500");
    await user.click(screen.getByLabelText(/Allow backorders/i));

    await user.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1);
    });

    const formData = getSubmittedFormData(actionMock);
    expect(readFormData(formData)).toMatchObject({
      returnTo: "/admin/settings",
      storeName: "One Dollar Store",
      supportEmail: "help@onedollar.pk",
      shippingFlatRate: "300",
      shippingFreeThreshold: "4500",
    });
    expect(formData.get("allowBackorders")).toBe("on");
  });
});
