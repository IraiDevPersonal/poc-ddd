import { graphqlClient } from "@/shared/client/graphql.client";
import { GET_POSTS } from "../queries/get-post.query";
import type { GraphqlGetPostsResponse } from "../types/graphql-post.type";
import type { Post } from "../types/post.type";
import { PostValidators } from "../validators";
import type { PostRepository } from "./post.repository";

export class GraphqlPostRepository implements PostRepository {
  private readonly client = graphqlClient;

  getAll = async (): Promise<Post[]> => {
    const response =
      await this.client.request<GraphqlGetPostsResponse>(GET_POSTS);
    return PostValidators.validateGraphqlResponse(response);
  };
}
