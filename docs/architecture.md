# Arquitectura del proyecto

## Visión general

El proyecto implementa una arquitectura en capas inspirada en DDD (Domain-Driven Design), organizada en **módulos de dominio** auto-contenidos. Cada módulo agrupa todo lo necesario para su dominio: tipos, repositorios, servicios, validadores, mappers, componentes y un contenedor de dependencias.

El framework de renderizado es **Astro en modo SSG** (Static Site Generation): las páginas se pre-generan en build time, no hay servidor en runtime.

---

## Capas

```
┌─────────────────────────────────────────────┐
│                 Presentation                │
│         pages/ + module/components/         │
├─────────────────────────────────────────────┤
│               Application                  │
│         module/container.ts                 │
│         module/services/                    │
├─────────────────────────────────────────────┤
│                  Domain                     │
│  module/types/  │  module/repositories/     │
│                 │  (interface)              │
├─────────────────────────────────────────────┤
│              Infrastructure                 │
│  module/repositories/ (implementaciones)    │
│  module/schemas/  │  module/validators.ts   │
│  module/mappers.ts                          │
├─────────────────────────────────────────────┤
│                  Shared                     │
│   shared/lib/  │  shared/client/            │
│   shared/components/  │  shared/types/      │
└─────────────────────────────────────────────┘
```

### Presentation
- **`src/pages/`** — Rutas de Astro. Solo orquestan: llaman al container y pasan props a componentes.
- **`src/<module>/components/`** — Componentes `.astro` del módulo. Reciben props tipadas, no tienen lógica de negocio.

### Application
- **`src/<module>/container.ts`** — Punto de entrada público del módulo. Instancia dependencias y expone métodos de alto nivel listos para usar desde las páginas.
- **`src/<module>/services/`** — Coordinan operaciones de negocio. Dependen de la interfaz del repositorio, no de implementaciones concretas.

### Domain
- **`src/<module>/types/`** — Tipos del modelo de dominio (e.g. `Post`, `PostListItemProps`, `PostDetailProps`). Son independientes de cualquier API o framework.
- **`src/<module>/repositories/post.repository.ts`** — Interfaz que define el contrato de acceso a datos.

### Infrastructure
- **`src/<module>/repositories/`** — Implementaciones concretas (HTTP, GraphQL). Conocen los detalles de la API externa.
- **`src/<module>/schemas/`** — Schemas Zod que modelan la forma exacta de la respuesta de cada API.
- **`src/<module>/validators.ts`** — Valida respuestas crudas de la API usando los schemas y lanza errores tipados si fallan.
- **`src/<module>/mappers.ts`** — Transforma modelos de infraestructura (e.g. `HttpPost`) al modelo de dominio (`Post`) y de dominio a props de presentación.

### Shared
- **`src/shared/lib/fetch-client.ts`** — Clase `FetchClient` genérica con manejo de errores HTTP.
- **`src/shared/lib/errors/`** — Clases de error custom: `HttpError` y `ZodError`.
- **`src/shared/client/`** — Instancias preconfiguradas de clientes (`apiClient`, `graphqlClient`).
- **`src/shared/components/`** — Componentes reutilizables entre módulos (e.g. `RootLayout`).
- **`src/shared/types/`** — Tipos comunes (e.g. `GetStaticPathsResult`).

---

## Estructura de un módulo de dominio

```
src/<module>/
├── components/          # Componentes .astro del módulo
├── repositories/
│   ├── <module>.repository.ts          # Interfaz (contrato)
│   ├── http-<module>.repository.ts     # Implementación REST
│   └── graphql-<module>.repository.ts  # Implementación GraphQL
├── services/
│   └── <module>.service.ts
├── schemas/
│   ├── http-<module>.schema.ts
│   └── graphql-<module>.schema.ts
├── types/
│   ├── <module>.type.ts                # Modelo de dominio + props de UI
│   ├── http-<module>.ts                # Tipo inferido del schema HTTP
│   └── graphql-<module>.type.ts        # Tipos inferidos del schema GraphQL
├── queries/                            # (solo si usa GraphQL)
│   └── get-<module>.query.ts
├── mappers.ts
├── validators.ts
├── container.ts
└── index.ts             # Exports públicos del módulo
```

---

## Flujo de datos (en build time)

```
pages/index.astro
  → postContainer.getPostsList()
    → PostService.getPostsList()
      → PostRepository.getAll()           ← interfaz
        → HttpPostRepository.getAll()     ← implementación concreta
          → FetchClient.get("/posts")
          ← raw JSON response
        → PostValidators.validateHttpResponse(raw)
          → HttpPostResponseSchema.safeParse(raw)  ← Zod
          → fromHttpToPostMapper(httpPost)          ← mapper infra → dominio
          ← Post[]
      → toListItemMapper(post)             ← mapper dominio → props UI
      ← PostListItemProps[]
  → <PostList posts={posts} />
```

---

## Path aliases

Definidos en `tsconfig.json`. Usar siempre alias, nunca rutas relativas entre módulos distintos.

| Alias | Resuelve a |
| :--- | :--- |
| `@/*` | `src/*` |
| `@post/*` | `src/post/*` |
| `@shared/*` | `src/shared/*` |
| `@styles/*` | `src/styles/*` |

Dentro del mismo módulo sí se usan rutas relativas (e.g. `../mappers`, `./post.repository`).

---

## Reglas de dependencia entre capas

- Las páginas solo importan desde `index.ts` del módulo (`@/post`).
- Los servicios solo conocen la interfaz del repositorio, nunca las implementaciones.
- Los repositorios usan clientes de `@/shared/client/`.
- `shared/` no importa de ningún módulo de dominio.
- Los tipos de infraestructura (e.g. `HttpPost`) se infieren del schema Zod y no se duplican a mano.
