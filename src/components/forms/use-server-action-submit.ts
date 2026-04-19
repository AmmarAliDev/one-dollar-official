"use client";

import { useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { toUserMessage } from "@/lib/errors/error-messages";

/**
 * Small helper for client-side RHF forms that still submit through Next server actions.
 *
 * It preserves optimistic pending UI, clears stale root errors before submit,
 * and converts unexpected thrown errors into friendly form-level messages.
 */
type SubmitWithActionOptions = {
  onSuccess?: () => void;
};

export function useServerActionSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
) {
  const [isPending, startTransition] = useTransition();

  async function submitWithAction(
    action: (formData: FormData) => void | Promise<void>,
    formData: FormData,
    options?: SubmitWithActionOptions,
  ) {
    form.clearErrors("root");

    await new Promise<void>((resolve, reject) => {
      startTransition(() => {
        void Promise.resolve(action(formData))
          .then(() => {
            options?.onSuccess?.();
            resolve();
          })
          .catch((error) => {
            try {
              unstable_rethrow(error);
            } catch (redirectError) {
              reject(redirectError);
              return;
            }

            form.setError("root.serverError", {
              type: "server",
              message: toUserMessage(error),
            });
            resolve();
          });
      });
    });
  }

  return {
    isPending,
    submitWithAction,
  };
}
