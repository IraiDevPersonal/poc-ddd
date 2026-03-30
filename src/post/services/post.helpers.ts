import type { GetStaticPathsResult } from "@/shared";
import { getPostsDetails, type PostDetailProps } from "..";

export async function getPostsDetailsStaticPaths(): Promise<
  GetStaticPathsResult<{ post: PostDetailProps }>[]
> {
  const posts = await getPostsDetails();
  return posts.map((post) => ({
    params: { id: post.postId.toString() },
    props: { post },
  }));
}
