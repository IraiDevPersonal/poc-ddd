import type { GetStaticPathsResult } from "@/shared";
import { type PostDetailProps, type PostListItemProps } from "..";
import { ApiPostRepository } from "./repositories/api-post.repository";
import { PostService } from "./post.service";

type GetPostsDetailsStaticPaths = GetStaticPathsResult<{
  post: PostDetailProps;
}>[];

export async function getPostsDetailsStaticPaths(): Promise<GetPostsDetailsStaticPaths> {
  const repo = new ApiPostRepository();
  const postService = new PostService(repo);
  const posts = await postService.getPostsDetails();

  return posts.map((post) => ({
    params: { id: post.postId.toString() },
    props: { post },
  }));
}

export async function getPostsList(): Promise<PostListItemProps[]> {
  const repo = new ApiPostRepository();
  const postService = new PostService(repo);
  return await postService.getPostsList();
}
