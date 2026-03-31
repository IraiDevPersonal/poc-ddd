import { fetchPosts } from "./post.api";
import { toDetailMapper, toListItemMapper } from "../mappers/post.mapper";
import type { PostDetailProps, PostListItemProps } from "../types/post.type";

export async function getPostsList(): Promise<PostListItemProps[]> {
  const posts = await fetchPosts();
  return posts.map(toListItemMapper);
}

export async function getPostsDetails(): Promise<PostDetailProps[]> {
  const posts = await fetchPosts();
  return posts.map(toDetailMapper);
}
