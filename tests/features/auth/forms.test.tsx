// @vitest-environment jsdom

import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dispatchMock = vi.fn();
const useActionStateMock = vi.fn();

vi.mock("@/features/auth/actions/sign-in", () => ({
  signInAction: vi.fn(),
}));

vi.mock("@/features/auth/actions/sign-up", () => ({
  signUpAction: vi.fn(),
}));

vi.mock("@/features/auth/actions/forgot-password", () => ({
  forgotPasswordAction: vi.fn(),
  forgotPasswordSuccessMessage: "If an account exists for that address, we've sent a reset link.",
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");

  return {
    ...actual,
    useActionState: (...args: Parameters<typeof useActionStateMock>) => useActionStateMock(...args),
  };
});

describe("auth form migration", () => {
  beforeEach(() => {
    dispatchMock.mockReset();
    useActionStateMock.mockReset();
    useActionStateMock.mockReturnValue([null, dispatchMock, false]);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows sign-in validation feedback on change and submits the existing payload shape", async () => {
    const user = userEvent.setup();
    const { SignInForm } = await import("@/features/auth/components/sign-in-form");

    render(<SignInForm redirectTo="/account" />);

    await user.type(screen.getByLabelText(/email address/i), "bad-email");

    await waitFor(() => {
      expect(screen.getAllByText(/valid email address/i).length).toBeGreaterThan(0);
    });

    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/email address/i), "ammar@example.com");
    await user.type(screen.getByLabelText(/^password/i), "supersecret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    const payload = dispatchMock.mock.calls[0]?.[0];

    expect(payload).toBeInstanceOf(FormData);
    expect(payload.get("email")).toBe("ammar@example.com");
    expect(payload.get("password")).toBe("supersecret123");
    expect(payload.get("redirectTo")).toBe("/account");
  });

  it("shows sign-up validation feedback on change and preserves the original submit fields", async () => {
    const user = userEvent.setup();
    const { SignUpForm } = await import("@/features/auth/components/sign-up-form");

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/email address/i), "bad-email");

    await waitFor(() => {
      expect(screen.getAllByText(/valid email address/i).length).toBeGreaterThan(0);
    });

    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/full name/i), "Ammar Khan");
    await user.type(screen.getByLabelText(/email address/i), "ammar@example.com");
    await user.type(screen.getByLabelText(/^password/i), "supersecret123");
    await user.type(screen.getByLabelText(/confirm password/i), "supersecret123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    const payload = dispatchMock.mock.calls[0]?.[0];

    expect(payload).toBeInstanceOf(FormData);
    expect(payload.get("name")).toBe("Ammar Khan");
    expect(payload.get("email")).toBe("ammar@example.com");
    expect(payload.get("password")).toBe("supersecret123");
    expect(payload.get("confirmPassword")).toBe("supersecret123");
  });

  it("forgot-password: resets the email field after the action reports success", async () => {
    const user = userEvent.setup();
    const { ForgotPasswordForm } = await import("@/features/auth/components/forgot-password-form");

    // Initial state — no result yet.
    useActionStateMock.mockReturnValue([null, dispatchMock, false]);
    const { rerender } = render(<ForgotPasswordForm />);

    // Type an email address.
    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("test@example.com");

    // Simulate the server action returning a success state (e.g. after dispatch).
    useActionStateMock.mockReturnValue([
      { success: true, message: "If an account exists for that address, we've sent a reset link." },
      dispatchMock,
      false,
    ]);
    rerender(<ForgotPasswordForm />);

    // The useEffect should reset the form — the email field should be cleared.
    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toHaveValue("");
    });
  });

  it("forgot-password: disables the submit button after a successful submission", async () => {
    const { ForgotPasswordForm } = await import("@/features/auth/components/forgot-password-form");

    useActionStateMock.mockReturnValue([
      { success: true, message: "If an account exists for that address, we've sent a reset link." },
      dispatchMock,
      false,
    ]);

    render(<ForgotPasswordForm />);

    expect(screen.getByRole("button", { name: /send reset link/i })).toBeDisabled();
  });

  it("forgot-password: shows the success message after a successful submission", async () => {
    const { ForgotPasswordForm } = await import("@/features/auth/components/forgot-password-form");

    const message = "If an account exists for that address, we've sent a reset link.";

    useActionStateMock.mockReturnValue([{ success: true, message }, dispatchMock, false]);

    render(<ForgotPasswordForm />);

    expect(screen.getByRole("status")).toHaveTextContent(message);
  });
});
