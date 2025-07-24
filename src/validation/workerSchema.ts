import z from "zod";

export const CreateworkerSchema = z.object({
    bio: z.string().min(3, {message: "bio must be at least 3 characters long"}).optional(),
    experience: z.number().min(0, {message: "experience must be at least 0"}).optional(),
    city: z.string().optional(),
    province: z.string().optional(),
});

export const UpdateworkerSchema = z.object({
    bio: z.string().min(3, {message: "bio must be at least 3 characters long"}).optional(),
    experience: z.number().min(0, {message: "experience must be at least 0"}).optional(),
    city: z.string().optional(),
    province: z.string().optional(),
});