import { z, type ZodError, type ZodTypeAny } from "zod";

export const emailAddressSchema = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .pipe(z.email("Please enter a valid email address."));

export const optionalDisplayNameSchema = z
  .string()
  .trim()
  .max(100, "Name must be at most 100 characters.")
  .refine((value) => value.length === 0 || value.length >= 2, {
    message: "Name must be at least 2 characters.",
  });

export function createPasswordSchema(minLength = 8, maxLength = 72) {
  return z
    .string()
    .min(minLength, `Password must be at least ${minLength} characters.`)
    .max(maxLength, "Password is too long.");
}

function dedupeMessages(messages: string[]): string[] {
  return [...new Set(messages.map((message) => message.trim()).filter(Boolean))];
}

export function getZodIssueMessages(error: ZodError): string[] {
  const flattened = z.flattenError(error);
  const fieldMessages = Object.values(flattened.fieldErrors).flatMap((messages) =>
    Array.isArray(messages)
      ? messages.filter((message): message is string => typeof message === "string")
      : [],
  );

  return dedupeMessages([...flattened.formErrors, ...fieldMessages]);
}

export function getZodFieldErrors(error: ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors;
}

export function validateWithSchema<TSchema extends ZodTypeAny>(schema: TSchema, input: unknown) {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return {
      success: true as const,
      data: parsed.data as z.infer<TSchema>,
    };
  }

  return {
    success: false as const,
    error: parsed.error,
    errors: getZodIssueMessages(parsed.error),
    fieldErrors: getZodFieldErrors(parsed.error),
  };
}
