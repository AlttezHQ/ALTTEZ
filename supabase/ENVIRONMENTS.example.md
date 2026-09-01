# Inventario de ambientes Supabase (sin secretos)

Una referencia encontrada no se considera canónica por frecuencia o antigüedad.
La URL y su clave pública deben corresponder al mismo `project ref`. Este archivo
no registra claves, tokens, correos, conteos sensibles ni credenciales.

| Contexto | Fuente verificable | Project ref observado | Estado | Acción pendiente |
|---|---|---|---|---|
| Desarrollo local | `.env` ignorado por Git | `jqqzwcrfbtcyjiuacrjk` | Obsoleto: no resuelve DNS | Reconfigurar solo después de obtener la clave pública de `rwqq…` |
| Vercel Preview | Proyecto Vercel `alttez` | Sin ref compilado | P0: no configurado o no aplicado al build | Configurar después de ADR-TOR-001 y redesplegar |
| Vercel Production | Deployment `dpl_3Gqe2qHxCdLAf7FzHZEBG17nGj4V` | Sin ref compilado | P0: no configurado o no aplicado al build | Configurar después de ADR-TOR-001 y redesplegar |
| GitHub CI | `.github/workflows/ci.yml` | No declarado | Pendiente | Confirmar si el build usa un Environment de GitHub |
| GitHub keep-alive | Workflow y runs públicos | `rwqqdwlldbegkivqvtwk` | Conexión verificada; canónico de recuperación | Mantener sin ampliar permisos |
| Stack Supabase local | `supabase/config.toml` | No aplica (`alttez-project`) | Local | No confundir `project_id` local con un ref remoto |

## Criterios para certificar un ambiente

- control administrativo y responsable confirmados;
- correspondencia URL/clave pública comprobada sin revelar la clave;
- fingerprint de esquema e historial de migraciones;
- conteos sanitizados de entidades necesarias para Torneos;
- estado de Auth, Storage, Functions, grants y RLS;
- clasificación explícita como desarrollo, staging o producción;
- fecha, actor y evidencia reproducible de la revisión.

## Prohibiciones durante la auditoría

- No registrar ni copiar claves en documentación o artefactos.
- No exponer `service_role` o secret keys al cliente.
- No mutar proyectos remotos para identificarlos.
- No ejecutar la cadena actual de migraciones contra un remoto.

## Verificación del 2026-08-31

- El remoto Git es `AlttezHQ/ALTTEZ`.
- GitHub CLI tiene un token inválido, pero no fue necesario ampliarlo: la API
  pública mostró tres runs del keep-alive, todos exitosos. El workflow falla si
  el secret está vacío o si la consulta a `keep_alive` no devuelve HTTP 200.
- Vercel tiene el proyecto `alttez` enlazado a `AlttezHQ/ALTTEZ`. Su deployment
  de producción está `READY` y publica `https://alttez.vercel.app`.
- `/torneos` devuelve HTTP 200 y el HTML inicial muestra `Cargando entorno...`.
- Se descargaron todos los bundles JavaScript referenciados por esa respuesta.
  Ninguno contiene las refs conocidas ni un hostname `*.supabase.co`.
- Dado que el cliente usa accesos directos a `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, la ausencia en el bundle indica con alta
  confianza que las variables no estaban disponibles durante el build.

T007 queda cerrada como inventario. Esto no certifica el ambiente: producción
presenta una brecha P0 y no debe configurarse hasta completar T009–T012 sobre el
backend canónico.

## Decisión de recuperación

`rwqqdwlldbegkivqvtwk` es el ambiente canónico para reconstrucción y piloto.
`jqqzwcrfbtcyjiuacrjk` se descarta porque no resuelve DNS ni responde con su
clave pública local. Ninguna referencia contiene todavía un backend Torneos
certificado; la adopción de `rwqq…` no autoriza migraciones antes de T009–T012.
