# Barrel Generator

Generate or update the `index.ts` barrel export file for any feature module.

## Trigger

- `/barrel` → infer module from current context or ask the user
- `/barrel src/shared` → generate barrel for `src/shared`
- `/barrel src/post` → generate barrel for `src/post`

## Steps

1. Identify the target module path (from argument, open file context, or ask)
2. Glob all files inside the module recursively
3. Read the files that match the export rules below
4. Determine what is public vs internal based on the rules
5. Write or update `<module>/index.ts`
6. Report to the user: what was exported and what was intentionally excluded

## Export Rules

### What TO export

| Source | Group | How to export |
|---|---|---|
| `container.ts` | `// services` | Named export of the singleton instance (e.g. `postContainer`) |
| `services/*.service.ts` | `// services` | Named exports — every exported `function` or `class` |
| `components/*.astro` | `// components` | Default re-export with a PascalCase alias matching the filename |
| `components/*.tsx` / `components/*.ts` | `// components` | Named or default re-export depending on the file |
| `lib/*.ts` | `// lib` | Named exports of reusable classes or functions (e.g. `FetchClient`) |
| `lib/utils.ts` | `// utils` | Named exports (e.g. `cn`) |
| `lib/errors/index.ts` | `// errors` | Named exports of custom error classes (e.g. `ZodError`, `HttpError`) |
| `types/*.type.ts` or `types/*.types.ts` | `// types` | Only `type` exports used as return types of public services or as component props |

### What NOT to export

| Source | Reason |
|---|---|
| `client/*.ts` | Infrastructure detail — these are preconfigured instances, not part of the public contract |
| `mappers.ts` | Internal transformation — consumers never call mappers directly |
| `schemas/**` | Validation internals — Zod schemas are not part of the public API |
| `validators.ts` | Internal validation logic — consumed only by repositories |
| `queries/**` | GraphQL query strings — infrastructure detail |
| Types only used internally (e.g. `HttpPost`, `GraphqlPost`) | Leaks implementation details |

## Naming Rules for Component Aliases

- Single component per file: use the filename as alias (`PostList.astro` → `PostList`)
- If two components would collide with a type name of the same name: append `Component` suffix (`PostDetail.astro` → `PostDetailComponent`)
- Always PascalCase

## Output format

Group exports by concern with a blank line between groups. Only include groups that have entries.

```ts
// services
export { postContainer } from "./container";

// components
export { default as PostList } from "./components/PostList.astro";
export { default as PostDetail } from "./components/PostDetail.astro";

// lib
export { FetchClient } from "./lib/fetch-client";

// utils
export { cn } from "./lib/utils";

// errors
export { ZodError, HttpError } from "./lib/errors";

// types
export type { PostListItemProps, PostDetailProps } from "./types/post.type";
```
