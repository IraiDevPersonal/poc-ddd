# Patrones del proyecto

## 1. Repository Pattern

Define una interfaz que abstrae el acceso a datos. Los servicios dependen de la interfaz, no de implementaciones concretas.

**Interfaz** (`src/post/repositories/post.repository.ts`):
```typescript
export interface PostRepository {
  getAll: () => Promise<Post[]>;
}
```

**Implementación HTTP** (`src/post/repositories/http-post.repository.ts`):
```typescript
export class HttpPostRepository implements PostRepository {
  private readonly client = apiClient;

  getAll = async (): Promise<Post[]> => {
    const response = await this.client.get("/posts");
    return PostValidators.validateHttpResponse(response);
  };
}
```

**Implementación GraphQL** (`src/post/repositories/graphql-post.repository.ts`):
```typescript
export class GraphqlPostRepository implements PostRepository {
  private readonly client = graphqlClient;

  getAll = async (): Promise<Post[]> => {
    const response = await this.client.request<GraphqlGetPostsResponse>(GET_POSTS);
    return PostValidators.validateGraphqlResponse(response);
  };
}
```

Ambas implementan la misma interfaz. Se pueden intercambiar sin tocar el servicio.

---

## 2. Service Layer

El servicio coordina la lógica de negocio. Recibe el repositorio por constructor (inyección de dependencias) y mapea los modelos de dominio a props de presentación.

```typescript
export class PostService {
  private readonly repository: PostRepository;

  constructor(repository: PostRepository) {
    this.repository = repository;
  }

  getPostsList = async (): Promise<PostListItemProps[]> => {
    const apiPosts = await this.repository.getAll();
    return apiPosts.map(toListItemMapper);
  };

  getPostsDetails = async (): Promise<PostDetailProps[]> => {
    const apiPosts = await this.repository.getAll();
    return apiPosts.map(toDetailMapper);
  };
}
```

---

## 3. Dependency Injection Container

El container instancia las dependencias y expone la API pública del módulo. Es el único lugar donde se decide qué implementación concreta del repositorio se usa.

```typescript
export class PostContainer {
  private readonly service: PostService;

  constructor(repository: PostRepository) {
    this.service = new PostService(repository);
  }

  getPostsList = async (): Promise<PostListItemProps[]> => {
    return this.service.getPostsList();
  };

  getPostsDetailsStaticPaths = async (): Promise<...> => {
    const posts = await this.service.getPostsDetails();
    return posts.map((post) => ({
      params: { id: post.postId.toString() },
      props: { post },
    }));
  };
}

// Aquí se decide qué repositorio se usa
const repository = new HttpPostRepository(); // | new GraphQLPostRepository();
export const postContainer = new PostContainer(repository);
```

Para cambiar la fuente de datos solo se modifica esta última línea.

---

## 4. Mapper Pattern

Los mappers transforman entre modelos de distintas capas. Hay dos tipos:

**Infra → Dominio** (normalizan la respuesta de la API al modelo de dominio):
```typescript
export const fromHttpToPostMapper = (post: HttpPost): Post => ({
  id: post.id,
  userId: post.userId,
  title: post.title,
  body: post.body,
});

export const fromGraphqlToPostMapper = (post: GraphqlPost): Post => ({
  id: Number(post.id),        // GraphQL devuelve strings
  userId: Number(post.user.id),
  title: post.title,
  body: post.body,
});
```

**Dominio → Props de UI** (preparan los datos para los componentes):
```typescript
export const toListItemMapper = (post: Post): PostListItemProps => ({
  postId: post.id,
  title: post.title,
});

export const toDetailMapper = (post: Post): PostDetailProps => ({
  ...toListItemMapper(post),
  userId: post.userId,
  content: post.body,
});
```

---

## 5. Schema Validation con Zod

Los schemas modelan exactamente la forma de la respuesta de cada API. Los tipos de infraestructura se **infieren del schema**, no se escriben a mano.

**Schema** (`src/post/schemas/http-post.schema.ts`):
```typescript
export const HttpPostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string().min(1),
  body: z.string().optional(),
});

export const HttpPostResponseSchema = z.array(HttpPostSchema);
```

**Tipo inferido** (`src/post/types/http-post.ts`):
```typescript
export type HttpPost = z.infer<typeof HttpPostSchema>;
```

**Validación** (`src/post/validators.ts`):
```typescript
static validateHttpResponse(raw: unknown): Post[] {
  const { data, success, error } = HttpPostResponseSchema.safeParse(raw);

  if (!success) {
    throw ZodError.buildError({
      detail: ZodError.format(error, { asJson: true }),
      message: "Respuesta inválida.",
      from: "PostValidators",
    });
  }

  return data.map(fromHttpToPostMapper);
}
```

La validación ocurre antes del mapeo: si la API devuelve algo inesperado, falla rápido con un error descriptivo.

---

## 6. Custom Error Classes

Dos clases de error custom, ambas exportadas desde `@/shared`.

**HttpError** — errores de red o HTTP:
```typescript
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly response: Response,
  ) {
    super(`HTTP error ${status}: ${response.statusText}`);
    this.name = "HttpError";
  }
}
```

**ZodError** — errores de validación de schema:
```typescript
// Uso en validators
throw ZodError.buildError({
  detail: ZodError.format(error, { asJson: true }),
  message: "Respuesta inválida.",
  from: "PostValidators",   // indica el origen del error
});
```

`ZodError.format()` deduplica issues por path y las serializa. `asJson: true` las devuelve como JSON legible.

---

## 7. Module Public API (`index.ts`)

Cada módulo expone solo lo necesario a través de su `index.ts`. Las páginas importan exclusivamente desde este archivo.

```typescript
// src/post/index.ts
export { postContainer } from "./container";
export { default as PostList } from "./components/PostList.astro";
export { default as PostDetail } from "./components/PostDetail.astro";
export type { PostListItemProps, PostDetailProps } from "./types/post.type";
```

Uso desde una página:
```typescript
import { postContainer, PostList } from "@/post";
```

Nunca importar directamente de sub-rutas de otro módulo (e.g. `@/post/services/post.service`).

---

## 8. FetchClient genérico

`FetchClient` en `shared/lib/fetch-client.ts` es un wrapper sobre `fetch` que:
- Recibe una `baseURL` en el constructor
- Fusiona headers por defecto con los de cada llamada
- Lanza `HttpError` automáticamente si `response.ok` es falso
- Acepta un `parseResponse` custom por si se necesita algo distinto a `.json()`

```typescript
const client = new FetchClient("https://api.example.com", {
  defaultHeaders: { Authorization: "Bearer token" },
});

const data = await client.get<MyType>("/endpoint");
```
