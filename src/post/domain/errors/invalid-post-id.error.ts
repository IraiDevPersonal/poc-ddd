export class InvalidPostIdError extends Error {
  constructor(value: unknown) {
    super(`[PostId] Invalid id: "${value}". Must be a positive integer.`);
    this.name = "InvalidPostIdError";
  }
}
