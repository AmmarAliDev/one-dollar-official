"use client";

import { useActionState, useEffect, useTransition } from "react";
import Link from "next/link";

import { DynamicFormField, useAppForm } from "@/components/forms";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { routes } from "@/config/routes";
import { resetPasswordAction, type ResetPasswordActionState } from "@/features/auth/actions/reset-password";
import { type ResetPasswordInput, resetPasswordValidator } from "@/features/auth/validators";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, dispatch, isPending] = useActionState<ResetPasswordActionState | null, FormData>(
    resetPasswordAction,
    null,
  );
  const [, startTransition] = useTransition();

  const form = useAppForm<ResetPasswordInput>({
    schema: resetPasswordValidator,
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const errors = state?.errors ?? [];
  const hasResetSucceeded = Boolean(state?.success);

  // Clear password fields after successful reset to avoid retaining
  // sensitive values in mounted input state.
  useEffect(() => {
    if (state?.success) {
      form.reset();
    }
  }, [state, form]);

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit((values) => {
        const formData = new FormData();
        formData.set("token", values.token);
        formData.set("password", values.password);
        formData.set("confirmPassword", values.confirmPassword);

        startTransition(() => {
          dispatch(formData);
        });
      })}
    >
      <FormErrorSummary errors={form.formState.errors} title="Please review your new password" />

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

      {hasResetSucceeded ? (
        <div className="space-y-3 rounded-[calc(var(--radius)-2px)] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
          <p>Your password has been reset successfully.</p>
          <Link href={routes.auth.signIn} className={buttonVariants({ size: "sm", variant: "outline" })}>
            Continue to sign in
          </Link>
        </div>
      ) : null}

      <DynamicFormField
        control={form.control}
        disabled={isPending || hasResetSucceeded}
        fieldConfig={{
          name: "token",
          type: "hidden",
        }}
      />

      <DynamicFormField
        control={form.control}
        disabled={isPending || hasResetSucceeded}
        fieldConfig={{
          id: "reset-password",
          name: "password",
          type: "password",
          label: "New password",
          autoComplete: "new-password",
          placeholder: "At least 8 characters",
          required: true,
        }}
      />

      <DynamicFormField
        control={form.control}
        disabled={isPending || hasResetSucceeded}
        fieldConfig={{
          id: "reset-password-confirm",
          name: "confirmPassword",
          type: "password",
          label: "Confirm new password",
          autoComplete: "new-password",
          placeholder: "Repeat password",
          required: true,
        }}
      />

      <Button type="submit" className="w-full" disabled={isPending || hasResetSucceeded}>
        {isPending ? <InlineSpinner /> : null}
        {isPending ? "Resetting password…" : "Reset password"}
      </Button>
    </form>
  );
}
