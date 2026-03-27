import type { PostListItemProps } from "@/post/application/schemas";
import type { PostRepository } from "@/post/domain/repositories";
import { PostMapper } from "@/post/infrastructure/mappers";

export class GetAllPostsAsListUseCase {
  constructor(private repo: PostRepository) {}

  execute = async (): Promise<PostListItemProps[]> => {
    const posts = await this.repo.getAll();
    return posts.map(PostMapper.toListItemProps);
  };
}
