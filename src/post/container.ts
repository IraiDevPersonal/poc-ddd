import type { GetStaticPathsResult } from "@/shared";
import type { PostDetailProps, PostListItemProps } from "./types/post.type";
import { HttpPostRepository } from "./repositories/http-post.repository";
import { PostService } from "./services/post.service";
import type { PostRepository } from "./repositories/post.repository";

type GetPostsDetailsStaticPaths = GetStaticPathsResult<{
  post: PostDetailProps;
}>[];

export class PostContainer {
  private readonly service: PostService;

  constructor(repository: PostRepository) {
    this.service = new PostService(repository);
  }

  getPostsDetailsStaticPaths =
    async (): Promise<GetPostsDetailsStaticPaths> => {
      const posts = await this.service.getPostsDetails();

      return posts.map((post) => ({
        params: { id: post.postId.toString() },
        props: { post },
      }));
    };

  getPostsList = async (): Promise<PostListItemProps[]> => {
    return this.service.getPostsList();
  };
}

const repository = new HttpPostRepository(); // | new GraphQLPostRepository();
export const postContainer = new PostContainer(repository);
