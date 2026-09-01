# Capacidades compartidas (`src/shared`)

Código reutilizado por más de un dominio.

| Carpeta | Responsabilidad |
|---|---|
| `auth/` | Contexto, sesión y componentes de autenticación |
| `lib/` | Clientes externos de bajo nivel |
| `services/` | Integraciones y persistencia transversal |
| `store/` | Estado global no asociado a una ruta activa |
| `ui/` | Componentes reutilizables |
| `hooks/` | Hooks transversales |
| `utils/` | Funciones puras compartidas |
| `types/` | Contratos comunes |
| `tokens/` | Tokens visuales y de movimiento |

`shared` no es un cajón general. No debe importar páginas ni componentes
internos desde `src/app`.
