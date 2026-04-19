"use client";

import type { FieldPath, FieldValues } from "react-hook-form";

import type { DynamicFormFieldConfig } from "@/components/forms";
import { Input } from "@/components/ui/input";

type DateTimeFieldOptions<TFieldValues extends FieldValues> = {
  id: string;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  containerClassName?: string;
  controlClassName?: string;
};

export function toDateTimeLocalInputValue(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function buildDateTimeField<TFieldValues extends FieldValues>({
  id,
  name,
  label,
  description,
  containerClassName,
  controlClassName,
}: DateTimeFieldOptions<TFieldValues>): DynamicFormFieldConfig<TFieldValues> {
  return {
    id,
    name,
    type: "custom",
    label,
    description,
    containerClassName,
    render: ({ field, fieldState, inputId, describedBy, disabled }) => (
      <Input
        id={inputId}
        type="datetime-local"
        value={toDateTimeLocalInputValue(field.value as Date | string | null | undefined)}
        onChange={(event) => field.onChange(event.target.value)}
        onBlur={field.onBlur}
        aria-describedby={describedBy}
        aria-invalid={Boolean(fieldState.error)}
        disabled={disabled}
        className={controlClassName}
      />
    ),
  };
}
