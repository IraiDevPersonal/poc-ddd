import { HttpClient } from "@/shared/lib/http-client";

export const graphQLClient = new HttpClient(
  "https://jsonplaceholder.typicode.com",
);
