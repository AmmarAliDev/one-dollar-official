import { MapPin } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { getPrismaClient } from "@/server/db";

export const metadata = buildMetadata({
  title: "Account Addresses",
  path: routes.storefront.accountAddresses,
  description: "Manage delivery addresses for checkout.",
});

export default async function AccountAddressesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <EmptyState
        icon={MapPin}
        title="Addresses unavailable"
        description="Please sign in again to manage your addresses."
      />
    );
  }

  const db = getPrismaClient();
  const addresses = await db.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  if (addresses.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No addresses yet"
        description="Saved addresses will appear here once checkout address management is implemented."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {addresses.map((address: any) => (
        <Card key={address.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{address.label || "Address"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>{address.street1}</p>
            {address.street2 ? <p>{address.street2}</p> : null}
            <p>
              {address.city}, {address.country}
            </p>
            {address.phone ? <p>Phone: {address.phone}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}