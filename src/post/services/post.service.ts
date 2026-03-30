import { fetchPosts } from "./post.api";
import { PostMapper } from "../mappers/post.mapper";
import type { PostDetailProps, PostListItemProps } from "../types/post.type";

export async function getPostsList(): Promise<PostListItemProps[]> {
  const posts = await fetchPosts();
  return posts.map(PostMapper.toListItem);
}

export async function getPostsDetails(): Promise<PostDetailProps[]> {
  const posts = await fetchPosts();
  return posts.map(PostMapper.toDetail);
}
