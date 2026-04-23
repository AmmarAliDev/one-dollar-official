import { z } from "zod";

import { reviewModerationStatuses } from "@/lib/reviews/moderation";

export const adminReviewModerationSchema = z.object({
  reviewId: z.string().trim().min(1, "Review id is required.").max(191),
  nextStatus: z.enum(reviewModerationStatuses),
  reason: z.string().trim().max(500).optional(),
});

export type AdminReviewModerationInput = z.infer<typeof adminReviewModerationSchema>;

export function validateAdminReviewModerationInput(input: unknown) {
  return adminReviewModerationSchema.safeParse(input);
}
