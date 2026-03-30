import type { z } from "astro/zod";
import type { ApiPostSchema } from "../schemas/post.schema";

export type ApiPost = z.infer<typeof ApiPostSchema>;

export type PostListItemProps = {
  postId: number;
  title: string;
};

export type PostDetailProps = {
  postId: number;
  title: string;
  userId: number;
  content?: string;
};
