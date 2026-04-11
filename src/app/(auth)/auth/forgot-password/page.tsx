import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Forgot Password",
  path: "/auth/forgot-password",
  description: "Placeholder: password reset is coming soon.",
});

/**
 * Forgot-password page — placeholder.
 *
 * DEFERRED: Email-based password reset requires a transactional email provider
 * (Resend / Postmark) and a secure token-rotation flow. This will be
 * implemented in Prompt 4.4 (Email notifications) alongside the notification
 * infrastructure.
 *
 * Planned flow:
 *  1. User submits email → generate a time-limited reset token (JWT or DB row).
 *  2. Send email with reset link (token in URL, expires 1 hour).
 *  3. User opens link → validates token → sets new password → invalidates token.
 */
export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <CardDescription>
          Password reset via email is coming soon. For now, please contact support or sign in with
          Google if you registered with a Google account.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <Link href={routes.auth.signIn} className={buttonVariants({ variant: "outline" })}>
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
