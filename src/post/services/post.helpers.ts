import type { GetStaticPathsResult } from "@/shared";
import { getPostsDetails, type PostDetailProps } from "..";

type GetPostsDetailsStaticPaths = GetStaticPathsResult<{
  post: PostDetailProps;
}>[];

export async function getPostsDetailsStaticPaths(): Promise<GetPostsDetailsStaticPaths> {
  const posts = await getPostsDetails();
  return posts.map((post) => ({
    params: { id: post.postId.toString() },
    props: { post },
  }));
}
