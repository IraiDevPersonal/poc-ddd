import { HttpClient } from "../lib/http-client";

export const postClient = new HttpClient(
  "https://jsonplaceholder.typicode.com",
);
