import type { ApiPost } from "./post.type";

export type PostRepository = {
  getAll: () => Promise<ApiPost[]>;
};
