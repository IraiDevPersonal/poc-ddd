import type { GraphqlPost } from "./types/graphql-post.type";
import type {
  PostDetailProps,
  PostListItemProps,
  Post,
} from "./types/post.type";
import type { HttpPost } from "./types/http-post";

export const toListItemMapper = (post: Post): PostListItemProps => ({
  postId: post.id,
  title: post.title,
});

export const toDetailMapper = (post: Post): PostDetailProps => ({
  ...toListItemMapper(post),
  userId: post.userId,
  content: post.body,
});

export const fromHttpToPostMapper = (post: HttpPost): Post => ({
  id: post.id,
  userId: post.userId,
  title: post.title,
  body: post.body,
});

export const fromGraphqlToPostMapper = (post: GraphqlPost): Post => ({
  id: Number(post.id),
  userId: Number(post.user.id),
  title: post.title,
  body: post.body,
});
