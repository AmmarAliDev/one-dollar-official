// NextAuth session and JWT type augmentation for this project.
// Adds `id` and `role` fields to the session user so downstream code can
// rely on typed access without repeated null-checking.
// Reference: https://authjs.dev/getting-started/typescript

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** Database user ID (UUID). */
      id: string;
      /** Role key from the Role table (e.g. "CUSTOMER", "SUPER_ADMIN"). */
      role: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Database user ID propagated into the JWT payload. */
    id?: string;
    /** Role key propagated into the JWT payload for fast access. */
    role?: string | null;
  }
}
