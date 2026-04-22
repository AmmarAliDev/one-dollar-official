"use client";

import { useActionState, useTransition } from "react";

import { DynamicFormField, useAppForm } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { signUpAction, type SignUpActionState } from "@/features/auth/actions/sign-up";
import { testIds } from "@/lib/test-selectors";
import { type SignUpInput, signUpValidator } from "@/features/auth/validators";

export function SignUpForm() {
  const [state, dispatch, isPending] = useActionState<SignUpActionState | null, FormData>(
    signUpAction,
    null,
  );
  const [, startTransition] = useTransition();

  const errors = state?.errors ?? [];

  const form = useAppForm<SignUpInput>({
    schema: signUpValidator,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form
      className="space-y-4"
      noValidate
      data-testid={testIds.auth.signUpForm}
      onSubmit={form.handleSubmit((values) => {
        const formData = new FormData();
        formData.set("name", values.name ?? "");
        formData.set("email", values.email);
        formData.set("password", values.password);
        formData.set("confirmPassword", values.confirmPassword);

        startTransition(() => {
          dispatch(formData);
        });
      })}
    >
      <FormErrorSummary errors={form.formState.errors} title="Please review your account details" />

      {errors.length > 0 ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 text-destructive rounded-[calc(var(--radius)-2px)] border px-4 py-3 text-sm"
        >
          {errors.map((error, index) => (
            <p key={`${error}-${index}`}>{error}</p>
          ))}
        </div>
      ) : null}

      <DynamicFormField
        control={form.control}
        disabled={isPending}
        fieldConfig={{
          id: "sign-up-name",
          name: "name",
          type: "text",
          label: "Full name",
          description: "Optional",
          autoComplete: "name",
          placeholder: "Your name",
        }}
      />

      <DynamicFormField
        control={form.control}
        disabled={isPending}
        fieldConfig={{
          id: "sign-up-email",
          name: "email",
          type: "email",
          label: "Email address",
          autoComplete: "email",
          placeholder: "you@example.com",
          required: true,
        }}
      />

      <DynamicFormField
        control={form.control}
        disabled={isPending}
        fieldConfig={{
          id: "sign-up-password",
          name: "password",
          type: "password",
          label: "Password",
          autoComplete: "new-password",
          placeholder: "At least 8 characters",
          required: true,
        }}
      />

      <DynamicFormField
        control={form.control}
        disabled={isPending}
        fieldConfig={{
          id: "sign-up-confirm",
          name: "confirmPassword",
          type: "password",
          label: "Confirm password",
          autoComplete: "new-password",
          placeholder: "Repeat password",
          required: true,
        }}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        data-testid={testIds.auth.signUpSubmit}
      >
        {isPending ? <InlineSpinner /> : null}
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
