import { toDetailMapper, toListItemMapper } from "../mappers/post.mapper";
import type { PostDetailProps, PostListItemProps } from "../types/post.type";
import type { PostRepository } from "../types/post.repository";

export class PostService {
  private readonly repository: PostRepository;

  constructor(repository: PostRepository) {
    this.repository = repository;
  }

  getPostsList = async (): Promise<PostListItemProps[]> => {
    const apiPosts = await this.repository.getAll();
    return apiPosts.map(toListItemMapper);
  };

  getPostsDetails = async (): Promise<PostDetailProps[]> => {
    const apiPosts = await this.repository.getAll();
    return apiPosts.map(toDetailMapper);
  };
}
