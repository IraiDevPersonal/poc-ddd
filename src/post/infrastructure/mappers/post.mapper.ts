import { Post } from "@post/domain/models";
import { ApiPostSchema } from "@/post/infrastructure/schemas";
import { ZodError } from "@shared/lib/errors";
import {
  PostDetailItemPropsSchema,
  PostListItemPropsSchema,
  type PostDetailItemProps,
  type PostListItemProps,
} from "@/post/application/schemas";

export class PostMapper {
  static fromApiResponse(raw: unknown): Post {
    const { data, success, error } = ApiPostSchema.safeParse(raw);

    if (!success) {
      const errorMessage = ZodError.toString(error);
      throw new Error(
        `[PostMapper] API devolvió datos inválidos:\n${errorMessage}`,
      );
    }

    return Post.create({
      id: data.id,
      userId: data.userId,
      title: data.title,
      content: data.body,
    });
  }

  static toListItemProps(post: Post): PostListItemProps {
    return PostListItemPropsSchema.parse({
      postId: post.id.value,
      title: post.title.value,
    });
  }

  static toDetailItemProps(post: Post): PostDetailItemProps {
    return PostDetailItemPropsSchema.parse({
      postId: post.id.value,
      title: post.title.value,
      userId: post.userId.value,
      content: post.content,
    });
  }
}
