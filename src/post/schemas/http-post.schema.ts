import { z } from "astro/zod";

export const HttpPostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string().min(1),
  body: z.string().optional(),
});

export const HttpPostResponseSchema = z.array(HttpPostSchema);
