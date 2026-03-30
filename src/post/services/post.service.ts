import { fetchPosts } from "./post.api";
import { PostMapper } from "../mappers/post.mapper";
import type { PostDetail, PostListItem } from "../types/post.type";

export async function getPostList(): Promise<PostListItem[]> {
  const posts = await fetchPosts();
  return posts.map(PostMapper.toListItem);
}

export async function getPostDetails(): Promise<PostDetail[]> {
  const posts = await fetchPosts();
  return posts.map(PostMapper.toDetail);
}
