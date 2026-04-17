import type { HTMLAttributes, ReactNode } from "react";
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldPathValue,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";

export type DynamicFormOption = {
  label: string;
  value: string;
  disabled?: boolean | undefined;
};

type BaseDynamicFormFieldConfig<TFieldValues extends FieldValues> = {
  id?: string | undefined;
  name: FieldPath<TFieldValues>;
  label?: string | undefined;
  description?: string | undefined;
  placeholder?: string | undefined;
  defaultValue?: FieldPathValue<TFieldValues, FieldPath<TFieldValues>> | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  autoComplete?: string | undefined;
  containerClassName?: string | undefined;
  controlClassName?: string | undefined;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>> | undefined;
};

export type InputDynamicFormFieldConfig<TFieldValues extends FieldValues> =
  BaseDynamicFormFieldConfig<TFieldValues> & {
    type: "text" | "email" | "password" | "number" | "hidden";
    inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"] | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
  };

export type TextareaDynamicFormFieldConfig<TFieldValues extends FieldValues> =
  BaseDynamicFormFieldConfig<TFieldValues> & {
    type: "textarea";
    rows?: number | undefined;
  };

export type SelectDynamicFormFieldConfig<TFieldValues extends FieldValues> =
  BaseDynamicFormFieldConfig<TFieldValues> & {
    type: "select";
    options: DynamicFormOption[];
  };

export type CheckboxDynamicFormFieldConfig<TFieldValues extends FieldValues> =
  BaseDynamicFormFieldConfig<TFieldValues> & {
    type: "checkbox";
  };

export type SwitchDynamicFormFieldConfig<TFieldValues extends FieldValues> =
  BaseDynamicFormFieldConfig<TFieldValues> & {
    type: "switch";
  };

export type DynamicFormCustomRenderProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  fieldState: ControllerFieldState;
  inputId: string;
  descriptionId?: string | undefined;
  errorId?: string | undefined;
  describedBy?: string | undefined;
  disabled: boolean;
};

export type CustomDynamicFormFieldConfig<TFieldValues extends FieldValues> =
  BaseDynamicFormFieldConfig<TFieldValues> & {
    type: "custom";
    render: (props: DynamicFormCustomRenderProps<TFieldValues>) => ReactNode;
  };

export type DynamicFormFieldConfig<TFieldValues extends FieldValues> =
  | InputDynamicFormFieldConfig<TFieldValues>
  | TextareaDynamicFormFieldConfig<TFieldValues>
  | SelectDynamicFormFieldConfig<TFieldValues>
  | CheckboxDynamicFormFieldConfig<TFieldValues>
  | SwitchDynamicFormFieldConfig<TFieldValues>
  | CustomDynamicFormFieldConfig<TFieldValues>;
