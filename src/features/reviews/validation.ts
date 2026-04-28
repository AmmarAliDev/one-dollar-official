import { z } from "zod";

export const customerReviewSchema = z.object({
  productId: z.string().trim().min(1, "Product id is required.").max(191),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1 star.").max(5, "Rating cannot exceed 5 stars."),
  title: z.string().trim().max(120, "Review title must be 120 characters or fewer.").optional(),
  body: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters so your feedback is meaningful.")
    .max(2000, "Review details must be 2000 characters or fewer."),
});

export type CustomerReviewInput = z.infer<typeof customerReviewSchema>;

export function validateCustomerReviewInput(input: unknown) {
  return customerReviewSchema.safeParse(input);
}