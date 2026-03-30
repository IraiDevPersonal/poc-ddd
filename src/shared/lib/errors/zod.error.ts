import { z, locales } from "astro/zod";

z.config(locales.es());

type ToErrorProps = {
  detail?: string;
  message: string;
  from: string;
};

type ToStringOptions = {
  asJson?: boolean;
};

type GetUniqueIssue = { path: string; message: string };

export class ZodError {
  private static getUniqueIssues(error: z.ZodError): GetUniqueIssue[] {
    const unique = new Map<string, string>();
    for (const i of error.issues) {
      const path = i.path.filter((s) => typeof s === "string").join(".");
      if (!unique.has(path)) unique.set(path, i.message);
    }

    return Array.from(unique.entries()).map(([path, message]) => ({
      path,
      message,
    }));
  }

  static format(error: z.ZodError, options: ToStringOptions = {}): string {
    const issues = this.getUniqueIssues(error);

    return options.asJson
      ? JSON.stringify(issues, null, 2)
      : issues.map((i) => `  ${i.path}: ${i.message}`).join("\n");
  }

  static is(error: unknown): error is z.ZodError {
    return error instanceof z.ZodError;
  }

  static buildError({ detail, message, from }: ToErrorProps): Error {
    const details = detail ? `\n\nDetails:\n${detail}` : "";
    return new Error(`[${from}]: ${message}${details}`);
  }
}
