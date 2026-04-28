import { LoadingState } from "@/components/ui/loading-state";

export default function AccountReviewsLoading() {
  return (
    <LoadingState
      title="Loading your reviews"
      description="Please wait while we prepare your review history."
    />
  );
}
