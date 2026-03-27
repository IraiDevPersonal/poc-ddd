import { z, locales } from "astro/zod";

z.config(locales.es());

export class ZodError {
  static toString(error: z.ZodError): string {
    const issues = error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    return issues;
  }

  static isError(error: unknown): error is z.ZodError {
    return error instanceof z.ZodError;
  }
}
