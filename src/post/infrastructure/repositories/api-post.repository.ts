import type { Post } from "@/post/domain/models/post";
import type { PostRepository } from "@/post/domain/repositories/post.repository";
import { PostMapper } from "../mappers/post.mapper";
import { postApiClient } from "../http";

export class ApiPostRepository implements PostRepository {
  private readonly postApiClient = postApiClient;

  getAll = async (): Promise<Post[]> => {
    const response = await this.postApiClient.get("/posts");
    if (!response) return [];
    const data = (await response.json()) as unknown[];
    return data.map(PostMapper.fromApiResponse);
  };
}
