type RuntimeEnv = {
  nodeEnv: "development" | "test" | "production";
  appUrl: string;
  defaultCity: string;
};

export const env: RuntimeEnv = {
  nodeEnv:
    (process.env.NODE_ENV as RuntimeEnv["nodeEnv"] | undefined) ??
    "development",
  appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
  defaultCity: process.env.NEXT_PUBLIC_DEFAULT_CITY?.trim() || "Karachi",
};

export function getRequiredServerEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to your local .env file before enabling sensitive integrations.`,
    );
  }

  return value;
}
