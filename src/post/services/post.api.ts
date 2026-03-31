import { ZodError } from "@/shared";
import { apiClient } from "@/shared/client/api.client";
import { ApiPostListSchema } from "../schemas/post.schema";
import type { ApiPost } from "../types/post.type";

export async function fetchPosts(): Promise<ApiPost[]> {
  const response = await apiClient.get("/posts");
  const raw = await response?.json();
  const { data, success, error } = ApiPostListSchema.safeParse(raw);

  if (!success) {
    throw ZodError.buildError({
      detail: ZodError.format(error, { asJson: true }),
      message: "Respuesta de API inválida.",
      from: "fetchPosts",
    });
  }

  return data;
}
