import { PostId, UserId, Title } from "@post/domain/value-objects";

type PostProps = {
  id: number;
  userId: number;
  title: string;
  content?: string;
};

export class Post {
  readonly id: PostId;
  readonly userId: UserId;
  readonly title: Title;
  readonly content?: string;

  private constructor(props: PostProps) {
    this.id = PostId.create(props.id);
    this.userId = UserId.create(props.userId);
    this.title = Title.create(props.title);
    this.content = props.content;
  }

  static create(props: PostProps): Post {
    return new Post(props);
  }

  equals(other: Post): boolean {
    return this.id.equals(other.id);
  }
}
