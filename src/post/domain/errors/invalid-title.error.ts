export class InvalidTitleError extends Error {
  constructor(reason: string) {
    super(`[Title] Invalid title: ${reason}`);
    this.name = "InvalidTitleError";
  }
}
