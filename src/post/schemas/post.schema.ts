import { z } from "astro/zod";

export const ApiPostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string().min(1),
  body: z.string().optional(),
});

export const ApiPostListSchema = z.array(ApiPostSchema);
