// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentPropsWithoutRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clientSignOutMock = vi.hoisted(() => vi.fn());
const prepareSignOutActionMock = vi.hoisted(() => vi.fn());
const signOutActionMock = vi.hoisted(() => vi.fn());

vi.mock("next-auth/react", () => ({
  signOut: clientSignOutMock,
}));

vi.mock("@/features/auth/actions/sign-out", () => ({
  prepareSignOutAction: prepareSignOutActionMock,
  signOutAction: signOutActionMock,
}));

vi.mock("@/lib/notify", () => ({
  notify: {
    error: vi.fn(),
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ComponentPropsWithoutRef<"button">) => (
    <button {...props}>{children}</button>
  ),
}));

describe("SignOutButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    clientSignOutMock.mockResolvedValue(undefined);
    prepareSignOutActionMock.mockResolvedValue(undefined);
    signOutActionMock.mockResolvedValue(undefined);
  });

  it("uses client signOut after preparation so session UI can update immediately", async () => {
    const { SignOutButton } = await import("@/features/auth/components/sign-out-button");

    const { container } = render(<SignOutButton label="Sign out" />);

    const form = container.querySelector("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(prepareSignOutActionMock).toHaveBeenCalledTimes(1);
      expect(clientSignOutMock).toHaveBeenCalledWith({ redirectTo: "/" });
    });

    expect(signOutActionMock).not.toHaveBeenCalled();
  });

  it("falls back to server signOut action if client signOut fails", async () => {
    const { SignOutButton } = await import("@/features/auth/components/sign-out-button");

    clientSignOutMock.mockRejectedValueOnce(new Error("client sign-out failed"));

    const { container } = render(<SignOutButton label="Sign out" />);

    const form = container.querySelector("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(prepareSignOutActionMock).toHaveBeenCalledTimes(1);
      expect(clientSignOutMock).toHaveBeenCalledTimes(1);
      expect(signOutActionMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
