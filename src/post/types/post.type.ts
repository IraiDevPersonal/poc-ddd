import type { z } from "astro/zod";
import type { ApiPostSchema } from "../schemas/post.schema";

export type ApiPost = z.infer<typeof ApiPostSchema>;

export type PostListItem = {
  postId: number;
  title: string;
};

export type PostDetail = {
  postId: number;
  title: string;
  userId: number;
  content?: string;
};
