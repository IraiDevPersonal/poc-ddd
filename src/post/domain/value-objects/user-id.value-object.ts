import { InvalidUserIdError } from "@post/domain/errors";

export class UserId {
  private constructor(readonly value: number) {}

  static create(value: unknown): UserId {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
      throw new InvalidUserIdError(value);
    }
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
