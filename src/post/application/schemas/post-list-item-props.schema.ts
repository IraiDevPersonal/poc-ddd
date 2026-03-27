import { z } from "astro/zod";

export const PostListItemPropsSchema = z.object({
  postId: z.number().min(1),
  title: z.string().min(1),
});

export type PostListItemProps = z.infer<typeof PostListItemPropsSchema>;
