import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Contact",
  path: "/contact",
  description: "Contact page placeholder for the storefront.",
});

export default function ContactPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Support"
      title="Contact Us"
      description="A placeholder page for customer support channels and contact form details."
    />
  );
}
