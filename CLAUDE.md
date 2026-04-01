# CLAUDE.md — Guía para implementar funcionalidades en este proyecto

Este archivo da contexto al asistente IA sobre las convenciones, patrones y reglas del proyecto para que cualquier nueva implementación sea coherente con lo existente.

---

## Qué es este proyecto

POC de Domain-Driven Design (DDD) usando Astro (SSG) + TypeScript + Tailwind CSS. El dominio de ejemplo es `post`. Nuevas funcionalidades deben seguir exactamente la misma estructura.

---

## Documentación de referencia

Leer antes de implementar cualquier cosa:

- [docs/architecture.md](docs/architecture.md) — capas, flujo de datos, reglas de dependencia
- [docs/patterns.md](docs/patterns.md) — cada patrón con código real del proyecto
- [docs/how-to-add-module.md](docs/how-to-add-module.md) — guía paso a paso para nuevos módulos

---

## Módulo de referencia: `post`

El módulo `src/post/` es el modelo canónico. Ante cualquier duda sobre cómo estructurar algo, mirarlo primero.

Archivos clave:
- [src/post/container.ts](src/post/container.ts) — cómo se conectan las dependencias
- [src/post/services/post.service.ts](src/post/services/post.service.ts) — cómo se escribe un servicio
- [src/post/repositories/http-post.repository.ts](src/post/repositories/http-post.repository.ts) — cómo se implementa un repositorio
- [src/post/validators.ts](src/post/validators.ts) — cómo se valida y mapea una respuesta
- [src/post/mappers.ts](src/post/mappers.ts) — dos tipos de mappers: infra→dominio y dominio→UI
- [src/post/index.ts](src/post/index.ts) — qué exporta el módulo al exterior

---

## Reglas obligatorias

### Estructura de módulos
- Cada dominio vive en `src/<module>/` con la misma estructura que `src/post/`.
- El módulo solo es accesible desde fuera a través de su `index.ts`.
- Las páginas importan únicamente desde el alias del módulo (`@/post`, `@/comment`, etc.), nunca de sub-rutas internas.

### Tipos de infraestructura
- Los tipos que representan respuestas de API **siempre** se infieren del schema Zod con `z.infer<typeof Schema>`.
- No escribir tipos de infraestructura a mano.

```typescript
// CORRECTO
export type HttpPost = z.infer<typeof HttpPostSchema>;

// INCORRECTO
export type HttpPost = { id: number; userId: number; ... };
```

### Validación
- Toda respuesta de API pasa por el validador del módulo antes de ser mapeada.
- Si la validación falla, lanzar `ZodError.buildError(...)` con `from` indicando la clase origen.
- Nunca pasar la respuesta cruda directamente al mapper.

### Mappers
- Dos capas de mappers en `mappers.ts`:
  1. Infra → Dominio: `fromHttpTo<Domain>Mapper`, `fromGraphqlTo<Domain>Mapper`
  2. Dominio → Props de UI: `toListItemMapper`, `toDetailMapper`
- Los mappers son funciones puras. Sin efectos secundarios, sin llamadas a APIs.

### Repositorios
- El servicio depende **siempre** de la interfaz `<Module>Repository`, no de clases concretas.
- Las implementaciones concretas solo se instancian en `container.ts`.
- Para cambiar de fuente de datos, solo se cambia la línea de instanciación en `container.ts`.

### Servicios
- El servicio recibe el repositorio por constructor.
- Solo usa métodos del repositorio + mappers. No llama directamente a clientes HTTP.

### Errores
- Solo dos tipos de error custom en el proyecto: `HttpError` y `ZodError`.
- Ambos se importan desde `@/shared`.
- `HttpClient` lanza `HttpError` automáticamente si `response.ok === false`.

### Shared
- `src/shared/` no importa de ningún módulo de dominio.
- Si una utilidad es específica de un módulo, va en ese módulo, no en shared.

### Path aliases
- Usar siempre aliases entre módulos distintos.
- Rutas relativas solo dentro del mismo módulo.

| Alias | Uso |
| :--- | :--- |
| `@/*` | Acceso general a `src/` |
| `@post/*` | Acceso interno al módulo post |
| `@shared/*` | Utilidades compartidas |
| `@styles/*` | Estilos globales |

---

## Convenciones de nombres

| Elemento | Convención | Ejemplo |
| :--- | :--- | :--- |
| Interfaz de repositorio | `<Module>Repository` | `PostRepository` |
| Implementación HTTP | `Http<Module>Repository` | `HttpPostRepository` |
| Implementación GraphQL | `Graphql<Module>Repository` | `GraphqlPostRepository` |
| Servicio | `<Module>Service` | `PostService` |
| Container | `<Module>Container` | `PostContainer` |
| Instancia exportada | `<module>Container` (camelCase) | `postContainer` |
| Validadores | `<Module>Validators` | `PostValidators` |
| Schema HTTP | `Http<Module>Schema` / `Http<Module>ResponseSchema` | `HttpPostSchema` |
| Schema GraphQL | `Graphql<Module>Schema` / `Graphql<Module>ResponseSchema` | `GraphqlPostSchema` |
| Tipo de dominio | `<Module>` | `Post` |
| Tipo de UI (lista) | `<Module>ListItemProps` | `PostListItemProps` |
| Tipo de UI (detalle) | `<Module>DetailProps` | `PostDetailProps` |
| Tipo infra HTTP | `Http<Module>` | `HttpPost` |
| Tipo infra GraphQL | `Graphql<Module>` | `GraphqlPost` |
| Mapper infra→dominio | `fromHttpTo<Domain>Mapper` | `fromHttpToPostMapper` |
| Mapper dominio→UI lista | `toListItemMapper` | `toListItemMapper` |
| Mapper dominio→UI detalle | `toDetailMapper` | `toDetailMapper` |

---

## Flujo para agregar un nuevo módulo

Seguir el checklist completo en [docs/how-to-add-module.md](docs/how-to-add-module.md).

Orden recomendado:
1. Tipos de dominio
2. Schema Zod + tipo inferido
3. Mappers
4. Validators
5. Interfaz del repositorio
6. Implementación(es) del repositorio
7. Servicio
8. Container
9. `index.ts`
10. Componentes
11. Páginas

---

## Qué NO hacer

- No importar desde sub-rutas internas de otro módulo.
- No escribir tipos de infraestructura a mano si hay un schema Zod.
- No poner lógica de negocio en los repositorios.
- No poner llamadas HTTP en los servicios.
- No instanciar repositorios concretos fuera del container.
- No poner utilidades específicas de un módulo en `shared/`.
- No crear helpers o abstracciones para uso único.
- No agregar error handling para casos que no pueden ocurrir.
- No añadir features no pedidas al implementar algo.
