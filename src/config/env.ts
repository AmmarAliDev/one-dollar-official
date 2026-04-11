import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";

const BOOLEAN_TRUE_VALUES = ["1", "true", "yes", "on"] as const;
const BOOLEAN_FALSE_VALUES = ["0", "false", "no", "off"] as const;

const booleanFromEnv = (defaultValue: boolean) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value, context) => {
      if (value === undefined || value.length === 0) {
        return defaultValue;
      }

      const normalized = value.toLowerCase();

      if (BOOLEAN_TRUE_VALUES.includes(normalized as (typeof BOOLEAN_TRUE_VALUES)[number])) {
        return true;
      }

      if (BOOLEAN_FALSE_VALUES.includes(normalized as (typeof BOOLEAN_FALSE_VALUES)[number])) {
        return false;
      }

      context.addIssue({
        code: "custom",
        message:
          'Expected a boolean-like value: "true", "false", "1", "0", "yes", "no", "on", or "off".',
      });

      return z.NEVER;
    });

export const publicEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .trim()
    .url("Provide a valid absolute URL, for example http://localhost:3000.")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_CITY: z
    .string()
    .trim()
    .min(1, "City name cannot be empty.")
    .default("Karachi"),
  NEXT_PUBLIC_ENABLE_ADMIN: booleanFromEnv(true),
  NEXT_PUBLIC_ENABLE_AUTH: booleanFromEnv(true),
});

export const serverEnvSchema = z.object({
  APP_SECRET: z.string().trim().min(1, "APP_SECRET cannot be empty.").optional(),

  // Auth.js v5 secret — required in any non-development environment.
  // Generate with: openssl rand -base64 32
  AUTH_SECRET: z
    .string()
    .trim()
    .min(32, "AUTH_SECRET must be at least 32 characters for security.")
    .optional(),

  // Google OAuth credentials — required when Google SSO is enabled.
  AUTH_GOOGLE_ID: z.string().trim().min(1, "AUTH_GOOGLE_ID cannot be empty.").optional(),
  AUTH_GOOGLE_SECRET: z.string().trim().min(1, "AUTH_GOOGLE_SECRET cannot be empty.").optional(),
});

type PublicEnvValues = z.infer<typeof publicEnvSchema>;
type ServerEnvValues = z.infer<typeof serverEnvSchema>;

export type EnvSource = Readonly<Record<string, string | undefined>>;
export type ServerEnvName = keyof ServerEnvValues;

export type RuntimeEnv = Readonly<{
  nodeEnv: PublicEnvValues["NODE_ENV"];
  appUrl: PublicEnvValues["NEXT_PUBLIC_APP_URL"];
  defaultCity: PublicEnvValues["NEXT_PUBLIC_DEFAULT_CITY"];
  enableAdminPreview: PublicEnvValues["NEXT_PUBLIC_ENABLE_ADMIN"];
  enableAuthPreview: PublicEnvValues["NEXT_PUBLIC_ENABLE_AUTH"];
}>;

function formatEnvErrors(scope: "public" | "server", error: z.ZodError) {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "unknown";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");

  return `Invalid ${scope} environment configuration:\n${details}`;
}

export function loadRuntimeEnv(rawEnv: EnvSource = process.env): RuntimeEnv {
  const result = publicEnvSchema.safeParse(rawEnv);

  if (!result.success) {
    throw new AppError(formatEnvErrors("public", result.error), "CONFIG_ERROR", {
      cause: result.error,
    });
  }

  const {
    NODE_ENV,
    NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEFAULT_CITY,
    NEXT_PUBLIC_ENABLE_ADMIN,
    NEXT_PUBLIC_ENABLE_AUTH,
  } = result.data;

  return {
    nodeEnv: NODE_ENV,
    appUrl: NEXT_PUBLIC_APP_URL,
    defaultCity: NEXT_PUBLIC_DEFAULT_CITY,
    enableAdminPreview: NEXT_PUBLIC_ENABLE_ADMIN,
    enableAuthPreview: NEXT_PUBLIC_ENABLE_AUTH,
  };
}

export function loadServerEnv(rawEnv: EnvSource = process.env): ServerEnvValues {
  const result = serverEnvSchema.safeParse(rawEnv);

  if (!result.success) {
    throw new AppError(formatEnvErrors("server", result.error), "CONFIG_ERROR", {
      cause: result.error,
    });
  }

  return result.data;
}

export function getRequiredServerEnv(name: ServerEnvName, rawEnv: EnvSource = process.env) {
  const serverEnv = loadServerEnv(rawEnv);
  const value = serverEnv[name];

  if (!value) {
    throw new AppError(
      `Missing required environment variable: ${name}. Add it to \`.env.local\` for local development or to your deployment secrets before enabling the related server integration.`,
      "CONFIG_ERROR",
    );
  }

  return value;
}

export const env = loadRuntimeEnv();
