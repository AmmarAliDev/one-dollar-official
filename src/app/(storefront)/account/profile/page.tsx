import { UserRound } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { getRoleLabel } from "@/lib/auth/rbac";

export const metadata = buildMetadata({
  title: "Account Profile",
  path: routes.storefront.accountProfile,
  description: "Manage your profile details.",
});

export default async function AccountProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <EmptyState
        icon={UserRound}
        title="Profile unavailable"
        description="Please sign in again to load your profile details."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Profile details</CardTitle>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Name</p>
          <p className="font-medium">{user.name ?? "Not set"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</p>
          <p className="font-medium">{user.email ?? "Not set"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Role</p>
          <p className="font-medium">{getRoleLabel(user.role)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Account ID</p>
          <p className="font-medium">{user.id}</p>
        </div>
      </CardContent>
    </Card>
  );
}