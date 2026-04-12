import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  path: "/privacy",
  description: "Privacy policy placeholder for the storefront.",
});

export default function PrivacyPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Policy"
      title="Privacy Policy"
      description="A placeholder for data collection, usage, and privacy rights messaging."
    />
  );
}
