import { apiClient } from "@/shared/client/api.client";
import { PostMapper } from "../mappers/post.mapper";
import type { ApiPost } from "../types/post.type";

export async function fetchPosts(): Promise<ApiPost[]> {
  const response = await apiClient.get("/posts");
  if (!response) return [];

  const raw = await response.json();
  return PostMapper.fromApiResponse(raw);
}
