"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type FieldValues,
  type Resolver,
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import { type z, type ZodTypeAny } from "zod";

export type UseAppFormOptions<TFieldValues extends FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  "resolver" | "mode" | "reValidateMode"
> & {
  schema: z.ZodType<TFieldValues>;
};

/**
 * Shared app-wide form setup.
 *
 * - Uses Zod for validation
 * - Validates on change for immediate feedback
 * - Preserves strong typing for defaults and submit payloads
 */
export function useAppForm<TFieldValues extends FieldValues>(
  options: UseAppFormOptions<TFieldValues>,
): UseFormReturn<TFieldValues> {
  const { schema, ...formOptions } = options;

  return useForm<TFieldValues>({
    resolver: zodResolver(schema as never) as Resolver<TFieldValues>,
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    ...formOptions,
  });
}

export type InferFormValues<TSchema extends ZodTypeAny> = z.infer<TSchema> & FieldValues;
