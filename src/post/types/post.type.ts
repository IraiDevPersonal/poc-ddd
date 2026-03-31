export type Post = {
  id: number;
  userId: number;
  title: string;
  body?: string;
};

export type PostListItemProps = {
  postId: number;
  title: string;
};

export type PostDetailProps = {
  postId: number;
  title: string;
  userId: number;
  content?: string;
};
