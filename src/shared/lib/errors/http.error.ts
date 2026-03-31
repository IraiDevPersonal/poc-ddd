export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly response: Response,
  ) {
    super(`HTTP error ${status}: ${response.statusText}`);
    this.name = "HttpError";
  }
}
