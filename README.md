# POC — Domain-Driven Design con Astro

Prueba de concepto que implementa principios de **Domain-Driven Design (DDD)** sobre una aplicación web moderna construida con Astro y TypeScript.

El dominio de ejemplo es un sistema de posts que consume datos desde APIs externas (REST y GraphQL), aplica validación de esquemas, mapea modelos de dominio y separa responsabilidades en capas bien definidas.

---

## Stack

| Capa            | Tecnología                       |
| :-------------- | :------------------------------- |
| Framework       | [Astro](https://astro.build) 6.1 |
| Lenguaje        | TypeScript                       |
| Estilos         | Tailwind CSS 4                   |
| Validación      | Zod                              |
| Cliente HTTP    | Fetch API (wrapper propio)       |
| Cliente GraphQL | graphql-request                  |
| Package manager | pnpm                             |
| Node            | >= 22.12.0                       |

---

## Arquitectura

El proyecto organiza el código en módulos por dominio. Cada módulo es auto-contenido y expone su API pública via `index.ts`.

```
src/
├── pages/
│   ├── index.astro          # Ruta /  → lista de posts
│   └── [id].astro           # Ruta /:id → detalle de post
│
├── post/                    # Módulo de dominio: Post
│   ├── components/          # Componentes de UI (PostList, PostDetail)
│   ├── repositories/        # Interfaz + implementaciones (HTTP, GraphQL)
│   ├── services/            # Lógica de negocio
│   ├── schemas/             # Schemas Zod por fuente de datos
│   ├── types/               # Tipos de dominio e infraestructura
│   ├── mappers.ts           # Transformación de modelos externos → dominio
│   ├── validators.ts        # Validación de respuestas de API
│   ├── container.ts         # Contenedor de inyección de dependencias
│   └── index.ts             # Exports públicos del módulo
│
└── shared/                  # Utilidades transversales
    ├── components/layouts/  # Layout raíz
    ├── client/              # Instancias de clientes HTTP y GraphQL
    ├── lib/                 # FetchClient, utilidades, errores custom
    └── types/               # Tipos comunes
```

### Patrones aplicados

- **Repository Pattern** — interfaz `PostRepository` con implementaciones intercambiables (`HttpPostRepository`, `GraphQLPostRepository`).
- **Service Layer** — `PostService` coordina la lógica de negocio dependiendo del repositorio abstracto.
- **Dependency Injection** — `PostContainer` inicializa y conecta dependencias.
- **Mapper Pattern** — `mappers.ts` transforma respuestas de APIs externas al modelo de dominio.
- **Schema Validation** — Zod valida en tiempo de ejecución las respuestas de las APIs antes de transformarlas.
- **Custom Errors** — `HttpError` y `ZodError` con contexto del origen del fallo.

### Path aliases

| Alias       | Directorio     |
| :---------- | :------------- |
| `@/*`       | `src/*`        |
| `@post/*`   | `src/post/*`   |
| `@shared/*` | `src/shared/*` |
| `@styles/*` | `src/styles/*` |

---

## Fuentes de datos

| Tipo    | URL                                  |
| :------ | :----------------------------------- |
| REST    | https://jsonplaceholder.typicode.com |
| GraphQL | https://graphqlzero.almansi.me/api   |

La implementación activa se configura en [src/post/container.ts](src/post/container.ts). Por defecto usa el repositorio HTTP.

---

## Documentación

| Archivo | Contenido |
| :--- | :--- |
| [docs/architecture.md](docs/architecture.md) | Capas, flujo de datos y reglas de dependencia |
| [docs/patterns.md](docs/patterns.md) | Patrones aplicados con ejemplos de código |
| [docs/how-to-add-module.md](docs/how-to-add-module.md) | Guía paso a paso para crear un nuevo módulo de dominio |
| [CLAUDE.md](CLAUDE.md) | Contexto para la IA: convenciones, reglas y qué evitar |

---

## Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando                | Acción                                            |
| :--------------------- | :------------------------------------------------ |
| `pnpm install`         | Instala dependencias                              |
| `pnpm dev`             | Inicia servidor de desarrollo en `localhost:4321` |
| `pnpm build`           | Genera el sitio estático en `./dist/`             |
| `pnpm preview`         | Vista previa del build de producción              |
| `pnpm astro -- --help` | Ayuda del CLI de Astro                            |
| `pnpm astro check`     | Valida el código TypeScript y Astro               |
