import { ZodError } from "@/shared";
import { HttpPostResponseSchema } from "./schemas/http-post.schema";
import type { Post } from "./types/post.type";
import type { z } from "astro/zod";
import { GraphqlPostResponseSchema } from "./schemas/graphql-post.schema";
import { fromHttpToPostMapper, fromGraphqlToPostMapper } from "./mappers";

export class PostValidators {
  private static parseResponse<T>(schema: z.ZodType<T>, raw: unknown) {
    const { data, success, error } = schema.safeParse(raw);

    if (!success) {
      throw ZodError.buildError({
        detail: ZodError.format(error, { asJson: true }),
        message: "Respuesta inválida.",
        from: "PostValidators",
      });
    }

    return data;
  }

  static validateHttpResponse(raw: unknown): Post[] {
    const data = this.parseResponse(HttpPostResponseSchema, raw);
    return data.map(fromHttpToPostMapper);
  }

  static validateGraphqlResponse(raw: unknown): Post[] {
    const data = this.parseResponse(GraphqlPostResponseSchema, raw);
    return data.posts.data.map(fromGraphqlToPostMapper);
  }
}
