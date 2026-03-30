# Barrel Generator

Generate or update the `index.ts` barrel export file for any feature module.

## Trigger

- `/barrel` → infer module from current context or ask the user
- `/barrel src/catalog` → generate barrel for `src/catalog`
- `/barrel src/product` → generate barrel for `src/product`

## Steps

1. Identify the target module path (from argument, open file context, or ask)
2. Glob all files inside the module recursively
3. Read the files that match the export rules below
4. Determine what is public vs internal based on the rules
5. Write or update `<module>/index.ts`
6. Report to the user: what was exported and what was intentionally excluded

## Export Rules

### What TO export

| Source | How to export |
|---|---|
| `services/*.service.ts` | Named exports — every exported `function` or `class` |
| `components/*.astro` | Default re-export with a PascalCase alias matching the filename (e.g. `ProductCard.astro` → `export { default as ProductCard }`) |
| `components/*.tsx` / `*.ts` | Named or default re-export depending on the file |
| `types/*.type.ts` or `types/*.types.ts` | Only `type` exports used as return types of public services or as component props |

### What NOT to export

| Source | Reason |
|---|---|
| `services/*.api.ts` | Internal HTTP layer — not part of the public contract |
| `services/*.client.ts` | Infrastructure detail |
| `mappers/**` | Internal transformation — consumers never call mappers directly |
| `schemas/**` | Validation internals — Zod schemas are not part of the public API |
| Types only used internally (e.g. `ApiPost`) | Leaks implementation details |

## Naming Rules for Component Aliases

- Single component per file: use the filename as alias (`PostList.astro` → `PostList`)
- If two components would collide with a type name of the same name: append `Component` suffix (`PostDetail.astro` → `PostDetailComponent`)
- Always PascalCase

## Output format

Group exports by concern with a blank line between groups:

```ts
// services
export { getProductList, getProductById } from "./services/product.service";

// components
export { default as ProductCard } from "./components/ProductCard.astro";
export { default as ProductDetail } from "./components/ProductDetail.astro";

// types
export type { Product, ProductListItem } from "./types/product.type";
```
