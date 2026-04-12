import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { routes } from "@/config/routes";
import { AccountShell } from "@/features/account/components/account-shell";

const accountNavItems = [
  { href: routes.storefront.accountProfile, label: "Profile" },
  { href: routes.storefront.accountAddresses, label: "Addresses" },
  { href: routes.storefront.accountOrders, label: "Order history" },
  { href: routes.storefront.accountReviews, label: "Reviews" },
] as const;

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`${routes.auth.signIn}?from=${encodeURIComponent(routes.storefront.accountProfile)}`);
  }

  return (
    <AccountShell
      title="Your account"
      description="Manage personal details, shipping addresses, and your order activity from one place."
      navItems={accountNavItems}
    >
      {children}
    </AccountShell>
  );
}