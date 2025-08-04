import z from "zod";

export const createReviewSchema = z.object({
    customerId: z.number(),
    workerId: z.number(),
    rating: z.number().min(1, {message: "Rating must be at least 1"}).max(5, {message: "Rating must be at most 5"}),
    comment: z.string().min(3, {message: "Comment must be at least 3 characters long"}).optional(),
});

export const updateReviewSchema = z.object({
    rating: z.number().min(1, {message: "Rating must be at least 1"}).max(5, {message: "Rating must be at most 5"}).optional(),
    comment: z.string().min(3, {message: "Comment must be at least 3 characters long"}).optional(),
});