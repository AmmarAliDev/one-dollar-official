export const reviewModerationStatuses = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"] as const;

export type ReviewModerationStatus = (typeof reviewModerationStatuses)[number];

export function isReviewModerationStatus(value: unknown): value is ReviewModerationStatus {
  return typeof value === "string" && reviewModerationStatuses.includes(value as ReviewModerationStatus);
}

export function isReviewVisibleOnStorefront(status: ReviewModerationStatus | null | undefined) {
  return status === "APPROVED";
}

export function getReviewStatusLabel(status: ReviewModerationStatus) {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "HIDDEN":
      return "Hidden";
    case "PENDING":
    default:
      return "Pending";
  }
}
