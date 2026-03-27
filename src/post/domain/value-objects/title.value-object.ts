import { InvalidTitleError } from "@post/domain/errors";

const MAX_LENGTH = 200;

export class Title {
  private constructor(readonly value: string) {}

  static create(value: unknown): Title {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new InvalidTitleError("cannot be empty");
    }
    if (value.trim().length > MAX_LENGTH) {
      throw new InvalidTitleError(`cannot exceed ${MAX_LENGTH} characters`);
    }
    return new Title(value.trim());
  }

  equals(other: Title): boolean {
    return this.value === other.value;
  }
}
