"use client";

import type { FormHTMLAttributes, ReactNode } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { FieldValues, SubmitErrorHandler, SubmitHandler, UseFormReturn } from "react-hook-form";
import { type z, type ZodTypeAny } from "zod";

import { Button } from "@/components/ui/button";
import { FormErrorSummary } from "@/components/ui/form-error-summary";
import { toUserMessage } from "@/lib/errors/error-messages";
import { cn } from "@/lib/utils";

import { DynamicFormField } from "./form-field";
import type { DynamicFormFieldConfig } from "./types";
import { type InferFormValues, useAppForm, type UseAppFormOptions } from "./use-app-form";

export type DynamicFormProps<TFieldValues extends FieldValues> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  form: UseFormReturn<TFieldValues>;
  fields: DynamicFormFieldConfig<TFieldValues>[];
  onSubmit: SubmitHandler<TFieldValues>;
  onInvalid?: SubmitErrorHandler<TFieldValues>;
  actions?: ReactNode;
  submitLabel?: string;
  submittingLabel?: string;
  showErrorSummary?: boolean;
  formErrorTitle?: string;
  fieldsClassName?: string;
};

export function DynamicForm<TFieldValues extends FieldValues>({
  form,
  fields,
  onSubmit,
  onInvalid,
  actions,
  submitLabel,
  submittingLabel = "Saving...",
  showErrorSummary = true,
  formErrorTitle,
  className,
  fieldsClassName,
  ...formProps
}: DynamicFormProps<TFieldValues>) {
  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      noValidate
      className={cn("space-y-6", className)}
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await onSubmit(values);
        } catch (error) {
          if (isRedirectError(error)) {
            throw error;
          }

          form.setError("root.serverError", {
            type: "server",
            message: toUserMessage(error),
          });
        }
      }, onInvalid)}
      {...formProps}
    >
      {showErrorSummary ? (
        <FormErrorSummary
          errors={form.formState.errors}
          title={formErrorTitle ?? "Please review the highlighted fields"}
        />
      ) : null}

      <fieldset disabled={isSubmitting} className={cn("grid gap-4", fieldsClassName)}>
        {fields.map((fieldConfig) => (
          <DynamicFormField
            key={`${String(fieldConfig.name)}-${fieldConfig.type}`}
            control={form.control}
            fieldConfig={fieldConfig}
            disabled={isSubmitting}
          />
        ))}
      </fieldset>

      {actions ??
        (submitLabel ? (
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>
        ) : null)}
    </form>
  );
}

export type SchemaFormProps<TSchema extends ZodTypeAny> = Omit<
  DynamicFormProps<InferFormValues<TSchema>>,
  "form"
> & {
  schema: TSchema;
  formOptions?: Omit<UseAppFormOptions<InferFormValues<TSchema>>, "schema">;
};

export function SchemaForm<TSchema extends ZodTypeAny>({
  schema,
  formOptions,
  ...props
}: SchemaFormProps<TSchema>) {
  const form = useAppForm<InferFormValues<TSchema>>({
    schema: schema as z.ZodType<InferFormValues<TSchema>>,
    ...(formOptions ?? {}),
  });

  return <DynamicForm<InferFormValues<TSchema>> form={form} {...props} />;
}
