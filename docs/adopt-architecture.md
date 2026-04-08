# Adoptar esta arquitectura en un proyecto nuevo

Guía para implementar esta arquitectura en un proyecto Astro SSG desde cero. Cubre la estructura completa, las responsabilidades de cada capa y las reglas a seguir.

---

## Contexto

Esta arquitectura está diseñada para proyectos **Astro en modo SSG** que consumen datos desde una o más fuentes externas (REST, GraphQL o ambas). Organiza el código en módulos auto-contenidos por dominio con separación clara de responsabilidades.

**Cuándo aplicarla:**
- El proyecto tiene múltiples dominios (ej: `product`, `catalog`, `cart`)
- Se consumen APIs externas (REST y/o GraphQL)
- El equipo quiere una estructura predecible y escalable

**Cuándo NO aplicarla:**
- Proyecto de una sola página con un fetch simple
- Prototipo desechable

---

## Estructura completa

```
src/
├── shared/
│   ├── client/
│   │   ├── http.client.ts         ← instancia preconfigurada del cliente REST
│   │   └── graphql.client.ts      ← instancia preconfigurada del cliente GraphQL
│   ├── components/
│   │   └── layouts/
│   │       └── RootLayout.astro   ← layout base del proyecto
│   ├── lib/
│   │   ├── fetch-client.ts        ← clase HTTP genérica
│   │   ├── utils.ts               ← utilidades compartidas
│   │   └── errors/
│   │       ├── http.error.ts      ← error para respuestas HTTP fallidas
│   │       ├── zod.error.ts       ← utilidades para errores de validación Zod
│   │       └── index.ts
│   ├── types/
│   │   └── common.type.ts         ← tipos reutilizables entre módulos
│   └── index.ts                   ← barrel de shared
│
├── <module>/                      ← un directorio por dominio
│   ├── components/
│   │   ├── <Module>List.astro
│   │   └── <Module>Detail.astro
│   ├── queries/                   ← solo si usa GraphQL
│   │   └── get-<module>.query.ts
│   ├── repositories/
│   │   ├── <module>.repository.ts
│   │   ├── http-<module>.repository.ts
│   │   └── graphql-<module>.repository.ts
│   ├── schemas/
│   │   ├── http-<module>.schema.ts
│   │   └── graphql-<module>.schema.ts
│   ├── services/
│   │   └── <module>.service.ts
│   ├── types/
│   │   ├── <module>.type.ts
│   │   ├── http-<module>.ts
│   │   └── graphql-<module>.type.ts
│   ├── mappers.ts
│   ├── validators.ts
│   ├── container.ts
│   └── index.ts                   ← barrel del módulo
│
└── pages/
    ├── index.astro
    └── [id].astro
```

---

## Capa `shared`

Infraestructura y utilidades que cualquier módulo puede usar. **No importa nada de los módulos de dominio.**

### `shared/lib/fetch-client.ts`

Clase HTTP genérica basada en `fetch`. Recibe una `baseURL` en el constructor y expone un método `get<T>`. Si la respuesta no es `ok`, lanza un `HttpError` automáticamente.

### `shared/lib/errors/`

Dos clases de error personalizadas:

- **`HttpError`** — se lanza cuando una respuesta HTTP falla (`response.ok === false`). Guarda el `status` y el objeto `Response`.
- **`ZodError`** — utilidades estáticas para trabajar con errores de validación Zod:
  - Formatear los issues como texto o JSON, deduplicando por campo
  - Construir un `Error` nativo con contexto de origen (`from`), mensaje y detalle

### `shared/client/`

Instancias preconfiguradas de los clientes, listas para usar en los repositorios:

- `http.client.ts` — instancia de `FetchClient` con la `baseURL` del proyecto
- `graphql.client.ts` — instancia de `GraphQLClient` con la URL del endpoint GraphQL

Los módulos importan estas instancias directamente. Nunca instancian los clientes ellos mismos.

### `shared/types/common.type.ts`

Tipos genéricos reutilizables entre módulos, por ejemplo el tipo del resultado de `getStaticPaths`.

### `shared/index.ts`

Barrel que expone todo lo público de shared. Los módulos importan desde `@/shared`.

```
// components
export { default as RootLayout } from "./components/layouts/RootLayout.astro";

// lib
export { FetchClient } from "./lib/fetch-client";

// utils
export { cn } from "./lib/utils";

// errors
export { ZodError, HttpError } from "./lib/errors";

// types
export type { GetStaticPathsResult } from "./types/common.type";
```

---

## Capa de módulo

Cada dominio vive en su propio directorio en `src/`. La estructura interna es siempre la misma.

### `types/<module>.type.ts`

Tres tipos por módulo:

- **Tipo de dominio** (`Product`) — forma interna. Solo lo usan mappers, validators y el servicio.
- **Props de lista** (`ProductListItemProps`) — lo que recibe el componente de lista.
- **Props de detalle** (`ProductDetailProps`) — lo que recibe el componente de detalle.

Los tipos de dominio nunca se exportan fuera del módulo.

### `schemas/`

Un schema Zod por fuente de datos:

- `http-<module>.schema.ts` — modela exactamente la respuesta de la API REST
- `graphql-<module>.schema.ts` — modela exactamente la respuesta del endpoint GraphQL

Los schemas **nunca** se exportan en el barrel. Son un detalle de infraestructura.

### `types/http-<module>.ts` y `types/graphql-<module>.type.ts`

Tipos de infraestructura inferidos directamente de los schemas Zod con `z.infer<typeof Schema>`. **Nunca se escriben a mano.**

Tampoco se exportan en el barrel.

### `mappers.ts`

Funciones puras de transformación. Dos tipos:

- **Infra → dominio**: `fromHttpTo<Module>Mapper`, `fromGraphqlTo<Module>Mapper`
- **Dominio → UI**: `toListItemMapper`, `toDetailMapper`

Sin efectos secundarios, sin llamadas a APIs, sin estado. No se exportan en el barrel.

### `validators.ts`

Clase estática con métodos que reciben la respuesta cruda de la API (`unknown`), la validan con el schema Zod correspondiente y devuelven el tipo de dominio. Si la validación falla, lanzan un error con contexto usando `ZodError` de shared.

No se exporta en el barrel.

### `queries/get-<module>.query.ts` _(solo GraphQL)_

Contiene la query GraphQL usando `gql`. No se exporta en el barrel.

### `repositories/<module>.repository.ts`

Interfaz que define el contrato de acceso a datos. El servicio depende solo de esta interfaz, nunca de las implementaciones concretas.

```typescript
export interface ProductRepository {
  getAll: () => Promise<Product[]>;
}
```

### `repositories/http-<module>.repository.ts`

Implementación REST. Usa el cliente de `@/shared/client/http.client`, llama al endpoint y delega la validación al validator del módulo.

### `repositories/graphql-<module>.repository.ts` _(opcional)_

Implementación GraphQL. Usa el cliente de `@/shared/client/graphql.client`, ejecuta la query y delega la validación al validator del módulo.

### `services/<module>.service.ts`

Recibe el repositorio por constructor (siempre la interfaz, nunca la clase concreta). Llama al repositorio para obtener los datos y aplica los mappers para transformarlos a props de UI.

### `container.ts`

Único lugar donde se instancian los repositorios concretos. Une todas las piezas:

```
repositorio concreto → servicio → container → páginas
```

Exporta:
- La clase `<Module>Container` (para tipado si se necesita)
- Una instancia `<module>Container` lista para usar

Para cambiar de REST a GraphQL, solo se cambia la línea de instanciación del repositorio en este archivo.

### `index.ts` — barrel del módulo

API pública del módulo. Las páginas importan **únicamente** desde aquí.

```typescript
// services
export { productContainer } from "./container";

// components
export { default as ProductList } from "./components/ProductList.astro";
export { default as ProductDetail } from "./components/ProductDetail.astro";

// types
export type { ProductListItemProps, ProductDetailProps } from "./types/product.type";
```

**Qué no se exporta nunca:**
- Schemas, validators, mappers
- Repositorios concretos
- Tipo de dominio interno (`Product`)
- Tipos de infraestructura (`HttpProduct`, `GraphqlProduct`)

---

## Páginas

Las páginas son el punto de entrada. Solo orquestan: llaman al container y pasan datos a los componentes.

```astro
---
import { RootLayout } from "@/shared";
import { productContainer, ProductList } from "@/product";

const products = await productContainer.getProductsList();
---

<RootLayout title="Products">
  <ProductList products={products} />
</RootLayout>
```

Las páginas con rutas dinámicas usan el método del container que devuelve el resultado de `getStaticPaths`:

```astro
---
import { RootLayout } from "@/shared";
import { productContainer, ProductDetail, type ProductDetailProps } from "@/product";

type Props = { product: ProductDetailProps };

export async function getStaticPaths() {
  return await productContainer.getProductsDetailsStaticPaths();
}

const { product } = Astro.props;
---

<RootLayout title={product.name}>
  <ProductDetail product={product} />
</RootLayout>
```

---

## Path aliases

Configurar en `tsconfig.json`. Agregar un alias por cada módulo nuevo.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@product/*": ["./src/product/*"],
      "@catalog/*": ["./src/catalog/*"]
    }
  }
}
```

---

## Flujo de datos

```
página
  → container.getList()
    → service.getList()
      → repository.getAll()         ← interfaz
        → HttpRepository.getAll()   ← implementación concreta
          → cliente HTTP
          ← respuesta cruda
        → validators.validate(raw)
          → schema.safeParse(raw)   ← Zod
          → fromHttpToMapper(item)  ← infra → dominio
          ← Dominio[]
      → toListItemMapper(item)      ← dominio → UI
      ← UIProps[]
  → <ComponenteList props={data} />
```

---

## Reglas invariantes

| Regla | Descripción |
|---|---|
| Barrel obligatorio | Cada módulo tiene `index.ts`. Las páginas solo importan desde él. |
| Sin imports cruzados internos | Nunca `@/product/services/...` desde páginas u otros módulos. |
| Tipos infra inferidos de Zod | Nunca escribir tipos de API a mano. Usar `z.infer<typeof Schema>`. |
| Validación antes del mapper | Toda respuesta cruda pasa por `Validators` antes de ser mapeada. |
| Repositorios concretos solo en container | Solo `container.ts` instancia las clases concretas. |
| Servicio depende de interfaz | El servicio recibe la interfaz del repositorio, nunca la clase concreta. |
| Mappers son funciones puras | Sin efectos secundarios, sin llamadas a APIs. |
| `shared` no importa de módulos | `src/shared/` no importa nada de ningún módulo de dominio. |
| Rutas relativas solo dentro del módulo | Entre módulos distintos, siempre usar el alias. |

---

## Errores comunes

| Error | Corrección |
|---|---|
| Importar desde sub-ruta interna de otro módulo | Importar solo desde `@/<module>` |
| Escribir tipos de API a mano | Inferir con `z.infer<typeof Schema>` |
| Instanciar repositorio concreto en el servicio | Solo instanciar en `container.ts` |
| Poner lógica de negocio en el repositorio | El repositorio solo hace fetch + delegar al validator |
| Llamar al cliente HTTP desde el servicio | El servicio llama al repositorio, nunca al cliente directamente |
| Exportar tipos internos en el barrel | Solo exportar props de UI y el container |
