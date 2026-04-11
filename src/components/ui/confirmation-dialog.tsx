"use client";

import { TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Button, type ButtonProps } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { InlineSpinner } from "./inline-spinner";

type ConfirmationDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  confirmVariant?: ButtonProps["variant"];
  onConfirm?: () => void | Promise<void>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(", ");

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getClientRects().length > 0,
  );
}

export function ConfirmationDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  triggerLabel,
  triggerVariant = "outline",
  confirmVariant = "default",
  onConfirm,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled,
  children,
  className,
}: ConfirmationDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const isSubmittingRef = useRef(isSubmitting);
  const titleId = useId();
  const descriptionId = useId();

  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialogElement = dialogRef.current;

    if (!dialogElement) {
      return;
    }

    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusableElements = getFocusableElements(dialogElement);
    const initialFocusTarget = focusableElements[0] ?? dialogElement;
    initialFocusTarget.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!isSubmittingRef.current) {
          event.preventDefault();
          setOpen(false);
        }

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentDialog = dialogRef.current;

      if (!currentDialog) {
        return;
      }

      const currentFocusableElements = getFocusableElements(currentDialog);

      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        currentDialog.focus();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement = currentFocusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        currentDialog.focus();
        return;
      }

      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !currentDialog.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      const restoreTarget = triggerRef.current ?? restoreFocusRef.current;
      restoreTarget?.focus();
    };
  }, [open, setOpen]);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm?.();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {triggerLabel ? (
        <Button
          ref={triggerRef}
          variant={triggerVariant}
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          {triggerLabel}
        </Button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close confirmation dialog"
            onClick={() => {
              if (!isSubmitting) {
                setOpen(false);
              }
            }}
          />

          <Card
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className={cn("relative z-10 w-full max-w-md", className)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-warning/15 text-warning rounded-2xl p-2.5" aria-hidden="true">
                  <TriangleAlert className="size-4" />
                </div>
                <Badge variant={confirmVariant === "destructive" ? "warning" : "secondary"}>
                  Confirmation required
                </Badge>
              </div>
              <CardTitle id={titleId}>{title}</CardTitle>
              <CardDescription id={descriptionId}>{description}</CardDescription>
            </CardHeader>

            {children ? <CardContent className="space-y-3 text-sm">{children}</CardContent> : null}

            <CardContent className="flex flex-col-reverse gap-2 pt-0 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                {cancelLabel}
              </Button>
              <Button variant={confirmVariant} onClick={() => void handleConfirm()} disabled={isSubmitting}>
                {isSubmitting ? <InlineSpinner size="sm" label="Working..." /> : confirmLabel}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
