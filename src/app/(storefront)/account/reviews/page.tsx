import { MessageSquareText } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { buildMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Your Reviews",
  path: routes.storefront.accountReviews,
  description: "Track and manage your product reviews.",
});

export default function AccountReviewsPage() {
  return (
    <EmptyState
      icon={MessageSquareText}
      title="Reviews are coming next"
      description="Review history and moderation status will appear here in a future prompt."
      eyebrow="Placeholder"
    />
  );
}