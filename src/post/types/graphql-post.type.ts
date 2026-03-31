import type { z } from "astro/zod";
import type {
  GraphqlPostResponseSchema,
  GraphqlPostSchema,
} from "../schemas/graphql-post.schema";

export type GraphqlPost = z.infer<typeof GraphqlPostSchema>;
export type GraphqlGetPostsResponse = z.infer<typeof GraphqlPostResponseSchema>;
