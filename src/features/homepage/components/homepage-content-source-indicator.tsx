import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/ui/page-container";

type HomepageContentSourceIndicatorProps = {
  source: "cms" | "fallback";
};

export function HomepageContentSourceIndicator({ source }: HomepageContentSourceIndicatorProps) {
  if (source === "cms") {
    return null;
  }

  return (
    <PageContainer as="section" className="pt-6">
      <Badge variant="outline">Using fallback homepage content until CMS data is available.</Badge>
    </PageContainer>
  );
}
