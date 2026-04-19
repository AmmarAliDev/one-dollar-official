"use client";

import { type Control, Controller, type FieldValues } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { DynamicFormFieldConfig } from "./types";

type FormFieldShellProps = {
  inputId: string;
  label?: string | undefined;
  description?: string | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  containerClassName?: string | undefined;
  children: (ariaProps: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string | undefined;
  }) => React.ReactNode;
};

export function FormFieldShell({
  inputId,
  label,
  description,
  error,
  required,
  disabled,
  containerClassName,
  children,
}: FormFieldShellProps) {
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <Field
      className={containerClassName}
      data-invalid={Boolean(error)}
      data-disabled={Boolean(disabled)}
    >
      {label ? (
        <FieldLabel htmlFor={inputId}>
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </FieldLabel>
      ) : null}

      {children({
        id: inputId,
        "aria-invalid": Boolean(error),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      })}

      {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
      <FieldError
        {...(errorId ? { id: errorId } : {})}
        {...(error ? { errors: [{ message: error }] } : {})}
      />
    </Field>
  );
}

function getFieldId(name: string, explicitId?: string) {
  if (explicitId) {
    return explicitId;
  }

  return `field-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export type DynamicFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  fieldConfig: DynamicFormFieldConfig<TFieldValues>;
  disabled?: boolean;
};

export function DynamicFormField<TFieldValues extends FieldValues>({
  control,
  fieldConfig,
  disabled = false,
}: DynamicFormFieldProps<TFieldValues>) {
  const inputId = getFieldId(String(fieldConfig.name), fieldConfig.id);

  const controllerProps = {
    control,
    name: fieldConfig.name,
    ...(fieldConfig.defaultValue !== undefined
      ? { defaultValue: fieldConfig.defaultValue }
      : {}),
    ...(fieldConfig.rules ? { rules: fieldConfig.rules } : {}),
  };

  if (fieldConfig.type === "hidden") {
    return (
      <Controller
        {...controllerProps}
        render={({ field }) => (
          <input
            {...field}
            type="hidden"
            value={field.value == null ? "" : String(field.value)}
            disabled={disabled || fieldConfig.disabled}
          />
        )}
      />
    );
  }

  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState }) => {
        const isDisabled = disabled || Boolean(fieldConfig.disabled);
        const error = typeof fieldState.error?.message === "string" ? fieldState.error.message : undefined;

        if (fieldConfig.type === "checkbox" || fieldConfig.type === "switch") {
          const descriptionId = fieldConfig.description ? `${inputId}-description` : undefined;
          const errorId = error ? `${inputId}-error` : undefined;
          const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
          const BooleanControl = fieldConfig.type === "checkbox" ? Checkbox : Switch;

          return (
            <Field
              orientation="horizontal"
              className={fieldConfig.containerClassName}
              data-invalid={Boolean(error)}
              data-disabled={isDisabled}
            >
              <BooleanControl
                ref={field.ref}
                id={inputId}
                checked={Boolean(field.value)}
                onCheckedChange={(value) => field.onChange(Boolean(value))}
                onBlur={field.onBlur}
                disabled={isDisabled}
                aria-describedby={describedBy}
                aria-invalid={Boolean(error)}
              />

              <FieldContent>
                {fieldConfig.label ? (
                  <FieldLabel htmlFor={inputId} className="leading-5">
                    {fieldConfig.label}
                    {fieldConfig.required ? <span className="ml-1 text-destructive">*</span> : null}
                  </FieldLabel>
                ) : null}

                {fieldConfig.description ? (
                  <FieldDescription id={descriptionId}>{fieldConfig.description}</FieldDescription>
                ) : null}

                <FieldError
                  {...(errorId ? { id: errorId } : {})}
                  {...(error ? { errors: [{ message: error }] } : {})}
                />
              </FieldContent>
            </Field>
          );
        }

        return (
          <FormFieldShell
            inputId={inputId}
            label={fieldConfig.label}
            description={fieldConfig.description}
            error={error}
            required={fieldConfig.required}
            disabled={isDisabled}
            containerClassName={fieldConfig.containerClassName}
          >
            {(ariaProps) => {
              if (fieldConfig.type === "textarea") {
                return (
                  <Textarea
                    {...ariaProps}
                    ref={field.ref}
                    name={field.name}
                    value={typeof field.value === "string" ? field.value : ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={fieldConfig.placeholder}
                    autoComplete={fieldConfig.autoComplete}
                    disabled={isDisabled}
                    rows={fieldConfig.rows ?? 4}
                    className={fieldConfig.controlClassName}
                  />
                );
              }

              if (fieldConfig.type === "select") {
                return (
                  <Select
                    value={typeof field.value === "string" ? field.value : ""}
                    onValueChange={field.onChange}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        field.onBlur();
                      }
                    }}
                    disabled={isDisabled}
                    name={field.name}
                  >
                    <SelectTrigger
                      id={ariaProps.id}
                      aria-describedby={ariaProps["aria-describedby"]}
                      aria-invalid={ariaProps["aria-invalid"]}
                      onBlur={field.onBlur}
                      className={fieldConfig.controlClassName}
                    >
                      <SelectValue placeholder={fieldConfig.placeholder ?? "Select an option"} />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {fieldConfig.options.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled ?? false}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }

              if (fieldConfig.type === "custom") {
                const descriptionId = fieldConfig.description
                  ? `${inputId}-description`
                  : undefined;
                const errorId = error ? `${inputId}-error` : undefined;

                return fieldConfig.render({
                  field,
                  fieldState,
                  inputId,
                  descriptionId,
                  errorId,
                  describedBy: ariaProps["aria-describedby"],
                  disabled: isDisabled,
                });
              }

              return (
                <Input
                  {...ariaProps}
                  ref={field.ref}
                  type={fieldConfig.type}
                  name={field.name}
                  value={field.value == null ? "" : field.value}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    if (fieldConfig.type === "number") {
                      const rawValue = event.target.value;
                      const parsed = Number(rawValue);

                      if (rawValue === "" || Number.isNaN(parsed)) {
                        field.onChange(undefined);
                        return;
                      }

                      field.onChange(parsed);
                      return;
                    }

                    field.onChange(event);
                  }}
                  placeholder={fieldConfig.placeholder}
                  autoComplete={fieldConfig.autoComplete}
                  disabled={isDisabled}
                  inputMode={fieldConfig.inputMode}
                  min={fieldConfig.min}
                  max={fieldConfig.max}
                  step={fieldConfig.step}
                  className={fieldConfig.controlClassName}
                />
              );
            }}
          </FormFieldShell>
        );
      }}
    />
  );
}
