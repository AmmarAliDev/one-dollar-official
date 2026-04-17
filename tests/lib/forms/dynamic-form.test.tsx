// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { DynamicForm, type DynamicFormFieldConfig, useAppForm } from "@/components/forms";

const exampleSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters."),
  email: z.email("Please enter a valid email address."),
  age: z.number().min(18, "Age must be at least 18.").optional(),
  bio: z.string().trim().min(10, "Bio must be at least 10 characters."),
  role: z.enum(["viewer", "manager"]),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "You must accept the terms.",
  }),
  featured: z.boolean(),
  source: z.string(),
});

type ExampleFormValues = z.infer<typeof exampleSchema>;

const fields: DynamicFormFieldConfig<ExampleFormValues>[] = [
  {
    name: "name",
    type: "text",
    label: "Name",
    placeholder: "Jane Doe",
    required: true,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "jane@example.com",
    required: true,
  },
  {
    name: "age",
    type: "number",
    label: "Age",
    placeholder: "25",
    description: "Optional numeric field support.",
  },
  {
    name: "bio",
    type: "textarea",
    label: "Bio",
    placeholder: "Write a short bio",
    required: true,
  },
  {
    name: "role",
    type: "select",
    label: "Role",
    placeholder: "Choose a role",
    options: [
      { label: "Viewer", value: "viewer" },
      { label: "Manager", value: "manager" },
    ],
  },
  {
    name: "acceptTerms",
    type: "checkbox",
    label: "Accept terms",
    description: "Required before saving.",
    required: true,
  },
  {
    name: "featured",
    type: "switch",
    label: "Featured profile",
    description: "Optional switch field support.",
  },
  {
    name: "source",
    type: "hidden",
    defaultValue: "dashboard",
  },
];

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
});

function ExampleDynamicForm(props?: {
  onSubmit?: (values: ExampleFormValues) => Promise<void> | void;
}) {
  const form = useAppForm({
    schema: exampleSchema,
    defaultValues: {
      name: "",
      email: "",
      age: undefined,
      bio: "",
      role: "viewer",
      acceptTerms: false,
      featured: false,
      source: "dashboard",
    },
  });

  return (
    <DynamicForm
      form={form}
      fields={fields}
      onSubmit={async (values) => {
        await props?.onSubmit?.(values as ExampleFormValues);
      }}
      submitLabel="Save profile"
      formErrorTitle="Please fix the form issues"
    />
  );
}

describe("DynamicForm", () => {
  it("validates on change and renders field-level messages", async () => {
    const user = userEvent.setup();

    render(<ExampleDynamicForm />);

    await user.type(screen.getByLabelText(/name/i), "Al");

    await waitFor(() => {
      expect(screen.getAllByText("Name must be at least 3 characters.").length).toBeGreaterThan(0);
    });

    await user.type(screen.getByLabelText(/name/i), "i");

    await waitFor(() => {
      expect(screen.queryByText("Name must be at least 3 characters.")).toBeNull();
    });

    await user.type(screen.getByLabelText(/email/i), "bad-email");

    await waitFor(() => {
      expect(screen.getAllByText("Please enter a valid email address.").length).toBeGreaterThan(0);
    });
  });

  it("supports input, textarea, select, checkbox, switch, and hidden values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ExampleDynamicForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/age/i), "25");
    await user.type(screen.getByLabelText(/bio/i), "This bio is comfortably long enough.");

    await user.click(screen.getByRole("combobox", { name: /role/i }));
    await user.click(screen.getByRole("option", { name: "Manager" }));

    await user.click(screen.getByLabelText(/accept terms/i));
    await user.click(screen.getByLabelText(/featured profile/i));
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: "Alice",
      email: "alice@example.com",
      age: 25,
      bio: "This bio is comfortably long enough.",
      role: "manager",
      acceptTerms: true,
      featured: true,
      source: "dashboard",
    });
  });

  it("shows a friendly root error if submit fails", async () => {
    const user = userEvent.setup();

    render(
      <ExampleDynamicForm
        onSubmit={async () => {
          throw new Error("Save failed unexpectedly");
        }}
      />,
    );

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/bio/i), "This bio is comfortably long enough.");
    await user.click(screen.getByLabelText(/accept terms/i));
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(
        screen.getByText("Something went wrong on our side. Please try again in a moment."),
      ).toBeTruthy();
    });
  });
});
