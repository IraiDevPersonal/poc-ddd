import { z } from "astro/zod";
import { ZodError } from "@/shared/lib/errors";
import { ApiPostSchema } from "../schemas/post.schema";
import type { ApiPost, PostDetail, PostListItem } from "../types/post.type";

export class PostMapper {
  static fromApiResponse(raw: unknown): ApiPost[] {
    const { data, success, error } = z.array(ApiPostSchema).safeParse(raw);

    if (!success) {
      throw ZodError.buildError({
        detail: ZodError.format(error, { asJson: true }),
        message: "Respuesta de API inválida.",
        from: "PostMapper.fromApiResponse",
      });
    }

    return data;
  }

  static toListItem(post: ApiPost): PostListItem {
    return { postId: post.id, title: post.title };
  }

  static toDetail(post: ApiPost): PostDetail {
    return {
      postId: post.id,
      title: post.title,
      userId: post.userId,
      content: post.body,
    };
  }
}
