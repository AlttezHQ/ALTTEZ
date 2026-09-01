# Producto web (`src`)

Contiene la aplicación Next.js y sus pruebas. No contiene el esquema de base de
datos ni la infraestructura analítica.

| Carpeta | Propósito |
|---|---|
| `app/` | App Router, rutas y dominios operativos |
| `marketing/` | Landing, contenido público y experiencia comercial |
| `shared/` | Auth, clientes, servicios, hooks, UI y utilidades compartidas |
| `tests/` | Pruebas de dominio y servicios web |

Antes de crear una utilidad en `shared/`, comprueba que realmente tenga al menos
dos consumidores. Las reglas exclusivas de Torneos, CRM u otro dominio deben
permanecer cerca de ese dominio.
