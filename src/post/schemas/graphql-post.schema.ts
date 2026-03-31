import { z } from "astro/zod";

export const GraphqlPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  user: z.object({
    id: z.string(),
  }),
});

export const GraphqlPostResponseSchema = z.object({
  posts: z.object({
    data: z.array(GraphqlPostSchema),
  }),
});
