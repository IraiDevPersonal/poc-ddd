import { z } from "astro/zod";

export const ApiPostSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string().min(1),
  body: z.string().optional(),
});

export type ApiPost = z.infer<typeof ApiPostSchema>;
