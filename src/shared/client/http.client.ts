import { FetchClient } from "../lib/fetch-client";

export const httpClient = new FetchClient(
  "https://jsonplaceholder.typicode.com",
);
