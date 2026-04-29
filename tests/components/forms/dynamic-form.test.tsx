// @vitest-environment jsdom

import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { DynamicForm } from "@/components/forms/dynamic-form";
import { useAppForm } from "@/components/forms/use-app-form";

// Lightweight wrapper that exposes the form via DynamicForm so we can test props.
const testSchema = z.object({ name: z.string().min(1, "Name is required") });
type TestValues = z.infer<typeof testSchema>;

function TestForm({
  onSubmit,
  resetOnSuccess,
}: {
  onSubmit: (values: TestValues) => Promise<void> | void;
  resetOnSuccess?: boolean;
}) {
  const form = useAppForm<TestValues>({ schema: testSchema, defaultValues: { name: "" } });

  return (
    <DynamicForm
      form={form}
      fields={[{ name: "name", type: "text", label: "Name", required: true }]}
      onSubmit={onSubmit}
      submitLabel="Save"
      {...(resetOnSuccess !== undefined ? { resetOnSuccess } : {})}
    />
  );
}

describe("DynamicForm resetOnSuccess", () => {
  afterEach(() => {
    cleanup();
  });

  it("does NOT reset form values after success when resetOnSuccess is false (default)", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TestForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));

    // Values should persist when resetOnSuccess is not set.
    expect(screen.getByLabelText(/name/i)).toHaveValue("Alice");
  });

  it("resets form values after success when resetOnSuccess is true", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TestForm onSubmit={handleSubmit} resetOnSuccess />);

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));

    // After success, the field should be cleared back to the default value.
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue("");
    });
  });

  it("does NOT reset form values when the submit handler throws", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockRejectedValue(new Error("server error"));

    render(<TestForm onSubmit={handleSubmit} resetOnSuccess />);

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));

    // A failed submit must not reset the form — the user needs to see their input.
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue("Alice");
    });
  });
});
