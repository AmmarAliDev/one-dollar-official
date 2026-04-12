import { StaticPagePlaceholder } from "@/components/layout/static-page-placeholder";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Search",
  path: "/search",
  description: "Search page placeholder for the storefront.",
});

export default function SearchPage() {
  return (
    <StaticPagePlaceholder
      pageTag="Storefront"
      title="Search"
      description="A placeholder for the searchable product experience planned in Prompt 3.5."
    />
  );
}
