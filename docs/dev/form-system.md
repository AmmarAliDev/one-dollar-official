# Reusable Form System

## Purpose

The app now includes a shared client-side form foundation for both simple customer forms and moderately complex admin forms.

It is intentionally generic and lives outside any single feature so future auth, checkout, admin, and catalog workflows can reuse the same conventions.

## Core building blocks

- `src/components/forms/use-app-form.ts`
  - wraps React Hook Form with Zod resolver defaults
  - always uses `mode: "onChange"` and `reValidateMode: "onChange"`
- `src/components/forms/dynamic-form.tsx`
  - `DynamicForm` renders a form from a typed field config array
  - `SchemaForm` provides a shorter wrapper when a feature only needs schema + fields + submit handler
- `src/components/forms/form-field.tsx`
  - reusable field renderer with accessible label, description, and error wiring
- `src/components/forms/types.ts`
  - shared field config types for input, textarea, select, checkbox, switch, hidden, and custom fields
- `src/components/ui/select.tsx`, `textarea.tsx`, `checkbox.tsx`, `switch.tsx`
  - shared shadcn-style primitives for form controls

## Supported field types

- text
- email
- password
- number
- textarea
- select
- checkbox
- switch
- hidden
- custom render escape hatch

## Recommended usage

### Option 1: schema-driven form

Use this when the fields are mostly standard and the layout is straightforward.

```tsx
"use client";

import { z } from "zod";

import { SchemaForm, type DynamicFormFieldConfig } from "@/components/forms";

const profileSchema = z.object({
  displayName: z.string().min(2, "Please enter at least 2 characters."),
  email: z.email("Please enter a valid email address."),
  bio: z.string().max(300).optional(),
  marketingOptIn: z.boolean().default(false),
});

type ProfileValues = z.infer<typeof profileSchema>;

const fields: DynamicFormFieldConfig<ProfileValues>[] = [
  {
    name: "displayName",
    type: "text",
    label: "Display name",
    placeholder: "Ammar",
    required: true,
  },
  {
    name: "email",
    type: "email",
    label: "Email address",
    placeholder: "ammar@example.com",
    required: true,
  },
  {
    name: "bio",
    type: "textarea",
    label: "Bio",
    description: "Optional short profile summary.",
  },
  {
    name: "marketingOptIn",
    type: "switch",
    label: "Marketing updates",
    description: "Receive occasional product announcements.",
  },
];

export function ProfileForm() {
  return (
    <SchemaForm
      schema={profileSchema}
      fields={fields}
      submitLabel="Save changes"
      formOptions={{
        defaultValues: {
          displayName: "",
          email: "",
          bio: "",
          marketingOptIn: false,
        },
      }}
      onSubmit={async (values) => {
        // call API or server action adapter here
        console.log(values);
      }}
    />
  );
}
```

### Option 2: explicit composition

Use this when a feature needs custom layout or a one-off field arrangement.

```tsx
const form = useAppForm({
  schema: profileSchema,
  defaultValues: {
    displayName: "",
    email: "",
    bio: "",
    marketingOptIn: false,
  },
});

<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
  <DynamicFormField control={form.control} fieldConfig={fields[0]} />
  <DynamicFormField control={form.control} fieldConfig={fields[1]} />
</form>
```

## Conventions

- Prefer `useAppForm()` for all new interactive client forms.
- Homepage admin content editors now follow this pattern through the client wrappers in `src/features/admin/homepage/components`.
- Keep validation rules in Zod schemas close to the owning feature module.
- Use the shared dynamic field config for routine forms instead of repeating label/description/error markup.
- Use the `custom` field type only when the standard field set is not enough.
- Let the shared summary and field-level messages handle safe user-facing error copy.

## Intentional limitations

These are intentionally deferred so the abstraction stays maintainable:

- async remote validation helpers
- file upload fields
- date/time pickers
- opinionated multi-step wizard orchestration

Future prompts can add those on top of the current shared base without replacing the API.
