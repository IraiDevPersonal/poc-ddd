import type { Post } from "@post/domain/models";

export interface PostRepository {
  getAll(): Promise<Post[]>;
}
