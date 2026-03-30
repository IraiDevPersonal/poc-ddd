import { z } from "astro/zod";
import { ZodError } from "@/shared/lib/errors";
import { ApiPostSchema } from "../schemas/post.schema";
import type {
  ApiPost,
  PostDetailProps,
  PostListItemProps,
} from "../types/post.type";
import type { GetStaticPathsResult } from "@/shared";

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

  static toListItem(post: ApiPost): PostListItemProps {
    return { postId: post.id, title: post.title };
  }

  static toDetail(post: ApiPost): PostDetailProps {
    return {
      postId: post.id,
      title: post.title,
      userId: post.userId,
      content: post.body,
    };
  }
}
