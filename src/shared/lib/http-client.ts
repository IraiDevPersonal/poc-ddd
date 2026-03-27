type Options = RequestInit;

export class HttpClient {
  private readonly baseURL: string;
  private readonly client = fetch;

  constructor(baseUrl: string) {
    this.baseURL = baseUrl;
  }

  private buildHeaders = (headers?: HeadersInit): Headers => {
    return new Headers({
      "Content-Type": "application/json",
      ...headers,
    });
  };

  private buildUrl = (endpoint: string = ""): string => {
    if (endpoint) {
      const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      return `${this.baseURL}${normalized}`;
    }
    return this.baseURL;
  };

  async get(endpoint?: string, options?: Options): Promise<Response | null> {
    const response = await this.client(this.buildUrl(endpoint), {
      ...options,
      method: "GET",
      headers: this.buildHeaders(options?.headers),
    });

    if (!response.ok) {
      console.error(await response.json());
      return null;
    }

    return response;
  }
}
