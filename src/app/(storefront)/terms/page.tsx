import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Terms and Conditions",
  path: "/terms",
  description: "Terms and conditions placeholder for the storefront.",
});

export default function TermsPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Policy"
      title="Terms and Conditions"
      description="A placeholder for storefront usage terms, order conditions, and legal notes."
    />
  );
}
