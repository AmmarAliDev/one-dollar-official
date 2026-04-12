import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "About",
  path: "/about",
  description: "About page placeholder for the storefront.",
});

export default function AboutPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Company"
      title="About One Dollar"
      description="A placeholder for brand story, mission, and customer trust details."
    />
  );
}
