export class InvalidUserIdError extends Error {
  constructor(value: unknown) {
    super(`[UserId] Invalid id: "${value}". Must be a positive integer.`);
    this.name = "InvalidUserIdError";
  }
}
