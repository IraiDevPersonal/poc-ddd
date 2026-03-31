import type { z } from "astro/zod";
import type { HttpPostSchema } from "../schemas/http-post.schema";

export type HttpPost = z.infer<typeof HttpPostSchema>;
