import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Shipping Policy",
  path: "/shipping-policy",
  description: "Shipping policy placeholder for the storefront.",
});

export default function ShippingPolicyPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Policy"
      title="Shipping Policy"
      description="A placeholder for shipping timelines, Karachi-only delivery scope, and charges."
    />
  );
}
