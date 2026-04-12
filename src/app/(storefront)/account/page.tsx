import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Account",
  path: "/account",
  description: "Account page placeholder for the storefront.",
});

export default function AccountPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Customer"
      title="Account"
      description="A placeholder for profile, addresses, and order history planned for Prompt 3.6."
    />
  );
}
