"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { cn } from "@/lib/utils";

type SignOutButtonProps = Omit<ButtonProps, "children" | "type"> & {
  label?: string;
  pendingLabel?: string;
  showIcon?: boolean;
  showText?: boolean;
  fullWidth?: boolean;
  formClassName?: string;
  onBeforeSubmit?: () => void;
};

type SubmitButtonProps = Omit<SignOutButtonProps, "formClassName" | "onBeforeSubmit">;

function SubmitButton({
  label = "Sign out",
  pendingLabel = "Signing out...",
  showIcon = true,
  fullWidth = false,
  showText = true,
  className,
  disabled,
  ...buttonProps
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-busy={pending}
      disabled={pending || disabled}
      className={cn(fullWidth ? "w-full" : undefined, className)}
      {...buttonProps}
    >
      {showIcon ? <LogOut className="size-4" aria-hidden="true" /> : null}
      {showText ? (pending ? pendingLabel : label) : null}
    </Button>
  );
}

/**
 * Shared sign-out submit control.
 *
 * Uses the CSRF-checked `signOutAction` server action through a normal form
 * submission so logout stays reliable in server, client, and progressively
 * enhanced navigation contexts.
 */
export function SignOutButton({ formClassName, onBeforeSubmit, ...buttonProps }: SignOutButtonProps) {
  return (
    <form
      action={signOutAction}
      className={formClassName}
      onSubmit={() => {
        if (!onBeforeSubmit) {
          return;
        }

        window.setTimeout(() => {
          onBeforeSubmit();
        }, 0);
      }}
    >
      <SubmitButton {...buttonProps} />
    </form>
  );
}
