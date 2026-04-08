# Cómo agregar un nuevo módulo

Guía paso a paso para agregar un módulo siguiendo la arquitectura del proyecto. El módulo de referencia es `src/post/`. Usa `comment`/`Comment` como ejemplo — reemplaza por el nombre de tu dominio.

---

## Estructura final

```
src/<module>/
├── components/
│   ├── <Module>List.astro
│   └── <Module>Detail.astro
├── queries/                              ← solo si usa GraphQL
│   └── get-<module>.query.ts
├── repositories/
│   ├── <module>.repository.ts            ← interfaz
│   ├── http-<module>.repository.ts       ← implementación REST
│   └── graphql-<module>.repository.ts    ← implementación GraphQL (opcional)
├── schemas/
│   ├── http-<module>.schema.ts
│   └── graphql-<module>.schema.ts        ← opcional
├── types/
│   ├── <module>.type.ts                  ← modelo de dominio + props de UI
│   ├── http-<module>.ts                  ← tipo inferido del schema HTTP
│   └── graphql-<module>.type.ts          ← tipos inferidos del schema GraphQL (opcional)
├── mappers.ts
├── validators.ts
├── services/
│   └── <module>.service.ts
├── container.ts
└── index.ts                              ← API pública del módulo
```

---

## Paso 1 — Tipos de dominio y de UI

`src/comment/types/comment.type.ts`

```typescript
// Modelo de dominio — forma interna que usa el módulo
export type Comment = {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
};

// Props de UI — lo que reciben los componentes
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

**Reglas:**
- `Comment` es el tipo de dominio. Solo lo usan mappers, validators y el servicio. No se exporta en el barrel.
- `CommentListItemProps` y `CommentDetailProps` son los únicos tipos que salen del módulo.

---

## Paso 2 — Schemas Zod

Uno por fuente de datos. Los tipos de infraestructura **siempre se infieren del schema**, nunca se escriben a mano.

**`src/comment/schemas/http-comment.schema.ts`**

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

**`src/comment/schemas/graphql-comment.schema.ts`** _(si aplica)_

```typescript
import { z } from "astro/zod";

export const GraphqlCommentSchema = z.object({
  id: z.string(),
  body: z.string(),
  email: z.string(),
  post: z.object({ id: z.string() }),
});

export const GraphqlCommentResponseSchema = z.object({
  comments: z.object({
    data: z.array(GraphqlCommentSchema),
  }),
});
```

---

## Paso 3 — Tipos de infraestructura

Inferidos directamente de los schemas.

**`src/comment/types/http-comment.ts`**

```typescript
import type { z } from "astro/zod";
import type { HttpCommentSchema } from "../schemas/http-comment.schema";

export type HttpComment = z.infer<typeof HttpCommentSchema>;
```

**`src/comment/types/graphql-comment.type.ts`** _(si aplica)_

```typescript
import type { z } from "astro/zod";
import type {
  GraphqlCommentSchema,
  GraphqlCommentResponseSchema,
} from "../schemas/graphql-comment.schema";

export type GraphqlComment = z.infer<typeof GraphqlCommentSchema>;
export type GraphqlGetCommentsResponse = z.infer<typeof GraphqlCommentResponseSchema>;
```

---

## Paso 4 — Mappers

Dos tipos en `mappers.ts`:
1. **Infra → dominio**: `fromHttpTo<Module>Mapper`, `fromGraphqlTo<Module>Mapper`
2. **Dominio → UI**: `toListItemMapper`, `toDetailMapper`

**`src/comment/mappers.ts`**

```typescript
import type { HttpComment } from "./types/http-comment";
import type { GraphqlComment } from "./types/graphql-comment.type";
import type { Comment, CommentListItemProps, CommentDetailProps } from "./types/comment.type";

// Infra → dominio
export const fromHttpToCommentMapper = (comment: HttpComment): Comment => ({
  id: comment.id,
  postId: comment.postId,
  name: comment.name,
  email: comment.email,
  body: comment.body,
});

export const fromGraphqlToCommentMapper = (comment: GraphqlComment): Comment => ({
  id: Number(comment.id),
  postId: Number(comment.post.id),
  name: comment.email, // ajustar según la API real
  email: comment.email,
  body: comment.body,
});

// Dominio → UI
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

**Reglas:**
- Funciones puras — sin efectos secundarios, sin llamadas a APIs.
- No se exportan en el barrel.

---

## Paso 5 — Validators

Validan la respuesta cruda y devuelven tipos de dominio. Usan schemas + mappers.

**`src/comment/validators.ts`**

```typescript
import type { z } from "astro/zod";
import { ZodError } from "@/shared";
import { HttpCommentResponseSchema } from "./schemas/http-comment.schema";
import { GraphqlCommentResponseSchema } from "./schemas/graphql-comment.schema";
import { fromHttpToCommentMapper, fromGraphqlToCommentMapper } from "./mappers";
import type { Comment } from "./types/comment.type";

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

  static validateGraphqlResponse(raw: unknown): Comment[] {
    const data = this.parseResponse(GraphqlCommentResponseSchema, raw);
    return data.comments.data.map(fromGraphqlToCommentMapper);
  }
}
```

---

## Paso 6 — Query GraphQL _(solo si aplica)_

**`src/comment/queries/get-comment.query.ts`**

```typescript
import { gql } from "graphql-request";

export const GET_COMMENTS = gql`
  query GetComments {
    comments {
      data {
        id
        body
        email
        post {
          id
        }
      }
    }
  }
`;
```

---

## Paso 7 — Interfaz del repositorio

**`src/comment/repositories/comment.repository.ts`**

```typescript
import type { Comment } from "../types/comment.type";

export interface CommentRepository {
  getAll: () => Promise<Comment[]>;
}
```

---

## Paso 8 — Implementaciones del repositorio

**`src/comment/repositories/http-comment.repository.ts`**

```typescript
import { httpClient } from "@/shared/client/http.client";
import { CommentValidators } from "../validators";
import type { Comment } from "../types/comment.type";
import type { CommentRepository } from "./comment.repository";

export class HttpCommentRepository implements CommentRepository {
  private readonly client = httpClient;

  getAll = async (): Promise<Comment[]> => {
    const response = await this.client.get("/comments");
    return CommentValidators.validateHttpResponse(response);
  };
}
```

**`src/comment/repositories/graphql-comment.repository.ts`** _(si aplica)_

```typescript
import { graphqlClient } from "@/shared/client/graphql.client";
import { GET_COMMENTS } from "../queries/get-comment.query";
import { CommentValidators } from "../validators";
import type { GraphqlGetCommentsResponse } from "../types/graphql-comment.type";
import type { Comment } from "../types/comment.type";
import type { CommentRepository } from "./comment.repository";

export class GraphqlCommentRepository implements CommentRepository {
  private readonly client = graphqlClient;

  getAll = async (): Promise<Comment[]> => {
    const response = await this.client.request<GraphqlGetCommentsResponse>(GET_COMMENTS);
    return CommentValidators.validateGraphqlResponse(response);
  };
}
```

**Reglas:**
- Los repositorios concretos solo se instancian en `container.ts`, nunca en otro lugar.
- Usan los clientes de `@/shared/client/`, nunca instancian `FetchClient` directamente.

---

## Paso 9 — Servicio

**`src/comment/services/comment.service.ts`**

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

**Reglas:**
- Depende de la **interfaz** `CommentRepository`, nunca de una clase concreta.
- Solo usa métodos del repositorio y mappers. No llama a clientes HTTP directamente.

---

## Paso 10 — Container

Único lugar donde se instancia el repositorio concreto. Para cambiar de fuente de datos, solo se cambia una línea.

**`src/comment/container.ts`**

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

const repository = new HttpCommentRepository(); // ← cambiar aquí para usar GraphQL
export const commentContainer = new CommentContainer(repository);
```

---

## Paso 11 — Componentes

Los componentes importan sus tipos desde el módulo con rutas relativas. No contienen lógica de negocio.

**`src/comment/components/CommentList.astro`**

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

**`src/comment/components/CommentDetail.astro`**

```astro
---
import type { CommentDetailProps } from "../types/comment.type";

type Props = {
  comment: CommentDetailProps;
};

const { comment } = Astro.props;
---

<main>
  <h1>{comment.name}</h1>
  <p>{comment.email}</p>
  <p>{comment.body}</p>
</main>
```

---

## Paso 12 — Barrel (API pública)

Expone solo lo que las páginas necesitan. Todo lo demás es interno al módulo.

**`src/comment/index.ts`**

```typescript
// services
export { commentContainer } from "./container";

// components
export { default as CommentList } from "./components/CommentList.astro";
export { default as CommentDetail } from "./components/CommentDetail.astro";

// types
export type { CommentListItemProps, CommentDetailProps } from "./types/comment.type";
```

**Qué NO exportar en el barrel:**

| Archivo | Razón |
|---|---|
| `mappers.ts` | Detalle de transformación interno |
| `validators.ts` | Detalle de validación interno |
| `schemas/` | Implementación de validación con Zod |
| `repositories/` | Implementaciones de infraestructura |
| Tipo `Comment` | Modelo de dominio interno |
| Tipos `HttpComment`, `GraphqlComment` | Tipos de infraestructura |

---

## Paso 13 — Páginas

Las páginas importan **únicamente** desde el barrel del módulo (`@/<module>`) y desde `@/shared`.

**`src/pages/comments/index.astro`**

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

**`src/pages/comments/[id].astro`**

```astro
---
import { RootLayout } from "@/shared";
import { commentContainer, CommentDetail, type CommentDetailProps } from "@/comment";

type Props = { comment: CommentDetailProps };

export async function getStaticPaths() {
  return await commentContainer.getCommentsDetailsStaticPaths();
}

const { comment } = Astro.props;
---

<RootLayout title={comment.name}>
  <CommentDetail comment={comment} />
</RootLayout>
```

---

## Checklist

- [ ] `types/<module>.type.ts` — modelo de dominio + props de UI
- [ ] `schemas/http-<module>.schema.ts` — schema Zod de la respuesta HTTP
- [ ] `schemas/graphql-<module>.schema.ts` — schema Zod GraphQL _(si aplica)_
- [ ] `types/http-<module>.ts` — tipo inferido del schema HTTP
- [ ] `types/graphql-<module>.type.ts` — tipos inferidos GraphQL _(si aplica)_
- [ ] `mappers.ts` — transformaciones infra→dominio y dominio→UI
- [ ] `validators.ts` — valida respuesta cruda antes de mapear
- [ ] `queries/get-<module>.query.ts` — query GraphQL _(si aplica)_
- [ ] `repositories/<module>.repository.ts` — interfaz
- [ ] `repositories/http-<module>.repository.ts` — implementación HTTP
- [ ] `repositories/graphql-<module>.repository.ts` — implementación GraphQL _(si aplica)_
- [ ] `services/<module>.service.ts` — lógica de orquestación
- [ ] `container.ts` — inyección de dependencias
- [ ] `index.ts` — barrel con API pública
- [ ] `components/<Module>List.astro` — componente de lista
- [ ] `components/<Module>Detail.astro` — componente de detalle
- [ ] Página de listado en `src/pages/`
- [ ] Página de detalle en `src/pages/`
