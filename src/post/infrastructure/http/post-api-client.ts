import { HttpClient } from "@/shared/lib/http-client";

export const postApiClient = new HttpClient(
  "https://jsonplaceholder.typicode.com",
);
