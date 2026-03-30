export { getPostsList, getPostsDetails } from "./services/post.service";
export { default as PostList } from "./components/PostList.astro";
export { default as PostDetailComponent } from "./components/PostDetail.astro";
export type { PostListItemProps, PostDetailProps } from "./types/post.type";
