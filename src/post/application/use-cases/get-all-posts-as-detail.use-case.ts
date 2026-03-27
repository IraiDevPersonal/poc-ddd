import type { PostDetailItemProps } from "@/post/application/schemas";
import type { PostRepository } from "@/post/domain/repositories";
import { PostMapper } from "@/post/infrastructure/mappers";

export class GetAllPostsAsDetailUseCase {
  constructor(private repo: PostRepository) {}

  execute = async (): Promise<PostDetailItemProps[]> => {
    const posts = await this.repo.getAll();
    return posts.map(PostMapper.toDetailItemProps);
  };
}
