import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  thumbnailUrl: z.string().url().optional(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
