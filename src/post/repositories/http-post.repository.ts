import { httpClient } from "@/shared/client/http.client";
import type { Post } from "../types/post.type";
import { PostValidators } from "../validators";
import type { PostRepository } from "./post.repository";

export class HttpPostRepository implements PostRepository {
  private readonly client = httpClient;

  getAll = async (): Promise<Post[]> => {
    const response = await this.client.get("/posts");
    return PostValidators.validateHttpResponse(response);
  };
}
