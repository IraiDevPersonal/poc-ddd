// services
export {
  getPostsList,
  getPostsDetailsStaticPaths,
} from "./services/post.helper";

// components
export { default as PostList } from "./components/PostList.astro";
export { default as PostDetail } from "./components/PostDetail.astro";

// types
export type { PostListItemProps, PostDetailProps } from "./types/post.type";
