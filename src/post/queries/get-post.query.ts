import { gql } from "graphql-request";

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      data {
        id
        title
        body
        user {
          id
        }
      }
    }
  }
`;
