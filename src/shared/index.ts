// components
export { default as RootLayout } from "./components/layouts/RootLayout.astro";

// lib
export { FetchClient } from "./lib/fetch-client";

// utils
export { cn } from "./lib/utils";

// errors
export { ZodError, HttpError } from "./lib/errors";

// types
export type { GetStaticPathsResult } from "./types/common.type";
