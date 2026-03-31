import type {
  ApiPost,
  PostDetailProps,
  PostListItemProps,
} from "../types/post.type";

export const toListItemMapper = (post: ApiPost): PostListItemProps => ({
  postId: post.id,
  title: post.title,
});

export const toDetailMapper = (post: ApiPost): PostDetailProps => ({
  ...toListItemMapper(post),
  userId: post.userId,
  content: post.body,
});
