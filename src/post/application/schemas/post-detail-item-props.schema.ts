import { z } from "astro/zod";

export const PostDetailItemPropsSchema = z.object({
  postId: z.number().min(1),
  title: z.string().min(1),
  userId: z.number().min(1),
  content: z.string().optional().default("No content..."),
});

export type PostDetailItemProps = z.infer<typeof PostDetailItemPropsSchema>;
