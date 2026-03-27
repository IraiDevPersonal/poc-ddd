import { InvalidPostIdError } from "@post/domain/errors";

export class PostId {
  private constructor(readonly value: number) {}

  static create(value: unknown): PostId {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
      throw new InvalidPostIdError(value);
    }
    return new PostId(value);
  }

  equals(other: PostId): boolean {
    return this.value === other.value;
  }
}
