"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

type AdminOrderSubmitButtonProps = Omit<ButtonProps, "type"> & {
  label: string;
  pendingLabel?: string;
};

export function AdminOrderSubmitButton({
  label,
  pendingLabel = "Saving...",
  disabled,
  ...props
}: AdminOrderSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-busy={pending} disabled={pending || disabled} {...props}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
