import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Return Policy",
  path: "/return-policy",
  description: "Return policy placeholder for the storefront.",
});

export default function ReturnPolicyPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Policy"
      title="Return Policy"
      description="A placeholder for return eligibility, process, and expected handling times."
    />
  );
}
