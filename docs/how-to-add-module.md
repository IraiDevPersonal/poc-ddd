# Cómo agregar un nuevo módulo de dominio

Esta guía usa `comment` como ejemplo de nuevo dominio. Reemplaza `comment`/`Comment` por el nombre de tu dominio.

---

## Paso 1 — Crear la estructura de carpetas

```
src/comment/
├── components/
├── repositories/
├── services/
├── schemas/
├── types/
├── queries/          # solo si usarás GraphQL
├── mappers.ts
├── validators.ts
├── container.ts
└── index.ts
```

---

## Paso 2 — Definir los tipos de dominio

`src/comment/types/comment.type.ts`

```typescript
// Modelo de dominio (independiente de cualquier API)
export type Comment = {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
};

// Props para componentes de UI
export type CommentListItemProps = {
  commentId: number;
  name: string;
  email: string;
};

export type CommentDetailProps = {
  commentId: number;
  postId: number;
  name: string;
  email: string;
  body: string;
};
```

---

## Paso 3 — Crear el schema Zod y el tipo inferido

`src/comment/schemas/http-comment.schema.ts`

```typescript
import { z } from "astro/zod";

export const HttpCommentSchema = z.object({
  id: z.number(),
  postId: z.number(),
  name: z.string(),
  email: z.string().email(),
  body: z.string(),
});

export const HttpCommentResponseSchema = z.array(HttpCommentSchema);
```

`src/comment/types/http-comment.ts`

```typescript
import type { z } from "astro/zod";
import type { HttpCommentSchema } from "../schemas/http-comment.schema";

export type HttpComment = z.infer<typeof HttpCommentSchema>;
```

> Los tipos de infraestructura siempre se infieren del schema Zod. No los escribas a mano.

---

## Paso 4 — Crear los mappers

`src/comment/mappers.ts`

```typescript
import type { HttpComment } from "./types/http-comment";
import type { Comment, CommentListItemProps, CommentDetailProps } from "./types/comment.type";

// Infra → Dominio
export const fromHttpToCommentMapper = (comment: HttpComment): Comment => ({
  id: comment.id,
  postId: comment.postId,
  name: comment.name,
  email: comment.email,
  body: comment.body,
});

// Dominio → Props de UI
export const toListItemMapper = (comment: Comment): CommentListItemProps => ({
  commentId: comment.id,
  name: comment.name,
  email: comment.email,
});

export const toDetailMapper = (comment: Comment): CommentDetailProps => ({
  commentId: comment.id,
  postId: comment.postId,
  name: comment.name,
  email: comment.email,
  body: comment.body,
});
```

---

## Paso 5 — Crear los validators

`src/comment/validators.ts`

```typescript
import { ZodError } from "@/shared";
import { HttpCommentResponseSchema } from "./schemas/http-comment.schema";
import { fromHttpToCommentMapper } from "./mappers";
import type { Comment } from "./types/comment.type";
import type { z } from "astro/zod";

export class CommentValidators {
  private static parseResponse<T>(schema: z.ZodType<T>, raw: unknown) {
    const { data, success, error } = schema.safeParse(raw);

    if (!success) {
      throw ZodError.buildError({
        detail: ZodError.format(error, { asJson: true }),
        message: "Respuesta inválida.",
        from: "CommentValidators",
      });
    }

    return data;
  }

  static validateHttpResponse(raw: unknown): Comment[] {
    const data = this.parseResponse(HttpCommentResponseSchema, raw);
    return data.map(fromHttpToCommentMapper);
  }
}
```

---

## Paso 6 — Crear la interfaz del repositorio

`src/comment/repositories/comment.repository.ts`

```typescript
import type { Comment } from "../types/comment.type";

export interface CommentRepository {
  getAll: () => Promise<Comment[]>;
}
```

---

## Paso 7 — Implementar el repositorio

`src/comment/repositories/http-comment.repository.ts`

```typescript
import { apiClient } from "@/shared/client/api.client";
import { CommentValidators } from "../validators";
import type { Comment } from "../types/comment.type";
import type { CommentRepository } from "./comment.repository";

export class HttpCommentRepository implements CommentRepository {
  private readonly client = apiClient;

  getAll = async (): Promise<Comment[]> => {
    const response = await this.client.get("/comments");
    return CommentValidators.validateHttpResponse(response);
  };
}
```

---

## Paso 8 — Crear el servicio

`src/comment/services/comment.service.ts`

```typescript
import { toListItemMapper, toDetailMapper } from "../mappers";
import type { CommentListItemProps, CommentDetailProps } from "../types/comment.type";
import type { CommentRepository } from "../repositories/comment.repository";

export class CommentService {
  private readonly repository: CommentRepository;

  constructor(repository: CommentRepository) {
    this.repository = repository;
  }

  getCommentsList = async (): Promise<CommentListItemProps[]> => {
    const comments = await this.repository.getAll();
    return comments.map(toListItemMapper);
  };

  getCommentsDetails = async (): Promise<CommentDetailProps[]> => {
    const comments = await this.repository.getAll();
    return comments.map(toDetailMapper);
  };
}
```

---

## Paso 9 — Crear el container

`src/comment/container.ts`

```typescript
import type { GetStaticPathsResult } from "@/shared";
import type { CommentDetailProps, CommentListItemProps } from "./types/comment.type";
import { HttpCommentRepository } from "./repositories/http-comment.repository";
import { CommentService } from "./services/comment.service";
import type { CommentRepository } from "./repositories/comment.repository";

type GetCommentsDetailsStaticPaths = GetStaticPathsResult<{
  comment: CommentDetailProps;
}>[];

export class CommentContainer {
  private readonly service: CommentService;

  constructor(repository: CommentRepository) {
    this.service = new CommentService(repository);
  }

  getCommentsDetailsStaticPaths = async (): Promise<GetCommentsDetailsStaticPaths> => {
    const comments = await this.service.getCommentsDetails();
    return comments.map((comment) => ({
      params: { id: comment.commentId.toString() },
      props: { comment },
    }));
  };

  getCommentsList = async (): Promise<CommentListItemProps[]> => {
    return this.service.getCommentsList();
  };
}

const repository = new HttpCommentRepository();
export const commentContainer = new CommentContainer(repository);
```

---

## Paso 10 — Exponer la API pública del módulo

`src/comment/index.ts`

```typescript
export { commentContainer } from "./container";
export { default as CommentList } from "./components/CommentList.astro";
export type { CommentListItemProps, CommentDetailProps } from "./types/comment.type";
```

---

## Paso 11 — Crear los componentes

`src/comment/components/CommentList.astro`

```astro
---
import type { CommentListItemProps } from "../types/comment.type";

type Props = {
  comments: CommentListItemProps[];
};

const { comments } = Astro.props;
---

<ul>
  {comments.map((c) => (
    <li>
      <a href={`/comments/${c.commentId}`}>{c.name}</a>
    </li>
  ))}
</ul>
```

---

## Paso 12 — Crear las páginas

`src/pages/comments/index.astro`

```astro
---
import { RootLayout } from "@/shared";
import { commentContainer, CommentList } from "@/comment";

const comments = await commentContainer.getCommentsList();
---

<RootLayout title="Comments">
  <main class="container mx-auto">
    <CommentList comments={comments} />
  </main>
</RootLayout>
```

---

## Checklist

- [ ] `types/<module>.type.ts` — modelo de dominio + props de UI
- [ ] `schemas/http-<module>.schema.ts` — schema Zod de la respuesta HTTP
- [ ] `types/http-<module>.ts` — tipo inferido del schema
- [ ] `mappers.ts` — transformaciones infra→dominio y dominio→UI
- [ ] `validators.ts` — valida respuesta cruda antes de mapear
- [ ] `repositories/<module>.repository.ts` — interfaz
- [ ] `repositories/http-<module>.repository.ts` — implementación
- [ ] `services/<module>.service.ts` — lógica de negocio
- [ ] `container.ts` — inyección de dependencias + API pública
- [ ] `index.ts` — exports del módulo
- [ ] `components/` — componentes `.astro`
- [ ] `pages/` — rutas de Astro que usan el módulo
