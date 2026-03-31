import type { Post } from "../types/post.type";

export interface PostRepository {
  getAll: () => Promise<Post[]>;
}
