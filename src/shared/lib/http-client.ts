import { HttpError } from "./errors";

type HttpClientConfig = {
  defaultHeaders?: HeadersInit;
};

type RequestOptions = {
  headers?: HeadersInit;
} & Omit<RequestInit, "method" | "headers">;

type GetOptions<T> = {
  parseResponse?: (response: Response) => Promise<T>;
} & RequestOptions;

export class HttpClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Headers;

  constructor(baseUrl: string, config?: HttpClientConfig) {
    this.baseURL = baseUrl;
    this.defaultHeaders = new Headers(config?.defaultHeaders);
  }

  private buildHeaders(headers?: HeadersInit): Headers {
    const merged = new Headers(this.defaultHeaders);
    if (headers) {
      new Headers(headers).forEach((value, key) => merged.set(key, value));
    }
    return merged;
  }

  private buildUrl(endpoint: string = ""): string {
    if (endpoint) {
      const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      return `${this.baseURL}${normalized}`;
    }
    return this.baseURL;
  }

  async get<T = unknown>(
    endpoint?: string,
    options?: GetOptions<T>,
  ): Promise<T> {
    const { parseResponse, ...fetchOptions } = options ?? {};

    const response = await fetch(this.buildUrl(endpoint), {
      ...fetchOptions,
      method: "GET",
      headers: this.buildHeaders(options?.headers),
    });

    if (!response.ok) {
      throw new HttpError(response.status, response);
    }

    if (parseResponse) {
      return parseResponse(response);
    }

    return response.json() as Promise<T>;
  }
}
