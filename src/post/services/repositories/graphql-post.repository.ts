import { ApiPostListSchema } from "@/post/schemas/post.schema";
import type { PostRepository } from "@/post/types/post.repository";
import type { ApiPost } from "@/post/types/post.type";
import { ZodError } from "@/shared";
import { graphQLClient } from "@/shared/client/graphql.client";

export class GraphQLPostRepository implements PostRepository {
  private readonly client = graphQLClient;

  getAll = async (): Promise<ApiPost[]> => {
    const response = await this.client.get("/posts");
    const { data, success, error } = ApiPostListSchema.safeParse(response);

    if (!success) {
      throw ZodError.buildError({
        detail: ZodError.format(error, { asJson: true }),
        message: "Respuesta de API inválida.",
        from: "fetchPosts",
      });
    }

    return data;
  };
}
