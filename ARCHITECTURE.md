# Arquitectura del repositorio ALTTEZ

Este documento indica dónde vive cada responsabilidad y evita reorganizaciones
que rompan las convenciones de Next.js, Supabase o las herramientas de datos.

## Mapa de alto nivel

```text
ALTTEZ
├── src/                 Producto web Next.js
│   ├── app/             Rutas y dominios operativos
│   ├── marketing/       Experiencia pública y comercial
│   ├── shared/          Capacidades transversales reutilizables
│   └── tests/           Pruebas del producto web y dominio
├── supabase/            Backend transaccional
│   ├── migrations/      Historia y baseline de Postgres
│   └── functions/       Edge Functions
├── data/                Plataforma analítica desacoplada
│   ├── airflow/         Orquestación ELT
│   ├── dbt/             Transformaciones y calidad
│   └── warehouse/       Provisionamiento de Snowflake
├── public/              Activos servidos públicamente
└── .github/             CI, seguridad y automatización
```

## Por qué no usamos `frontend/` y `backend/`

`src/app` es una convención de Next.js App Router y `supabase/` es una raíz
reconocida por la CLI de Supabase. Moverlas introduciría cambios en Vercel, CI,
imports y tooling sin aportar una frontera arquitectónica nueva. `data/` tampoco
es el backend de la aplicación: es una plataforma analítica con ciclo de vida
independiente.

Las fronteras correctas son:

- Producto web: `src/`.
- Backend transaccional: `supabase/`.
- Analítica: `data/`.
- Automatización: `.github/`.

## Regla para ubicar código nuevo

1. Una ruta, layout o pantalla entra en `src/app/<dominio>/`.
2. Una regla exclusiva de un dominio entra en su `domain/`, `utils/`,
   `selectors/` o `mappers/` local.
3. Un acceso a datos exclusivo del dominio entra en `services/` dentro del
   dominio.
4. Una capacidad usada por varios dominios entra en `src/shared/`.
5. SQL transaccional, RLS, grants, vistas y RPC entran en `supabase/`.
6. Airflow, dbt y Snowflake entran exclusivamente en `data/`.
7. Logs, capturas y diagnósticos entran en `artifacts/` y no se versionan.

## Dependencias permitidas

```text
src/app/<dominio> ──> src/shared
src/marketing     ──> src/shared
src/*/services    ──> Supabase Data API / Auth
data/             ──> outbox o fuentes analíticas
```

No se permiten estas dependencias:

- `src/shared` importando pantallas de `src/app`.
- Un dominio importando componentes internos de otro dominio sin contrato.
- El frontend importando archivos desde `data/` o `supabase/migrations/`.
- El pipeline analítico escribiendo directamente en el estado operacional.

## Dominios actuales de `src/app`

| Grupo | Carpetas principales | Responsabilidad |
|---|---|---|
| Identidad | `auth`, `launcher`, `interno` | Sesión, acceso y selección de producto |
| CRM deportivo | `dashboard`, `club`, `roster`, `training`, `scheduling`, `competition`, `finance`, `analytics` | Operación diaria del club |
| Torneos | `torneos`, `t` | Administración competitiva y portal público |
| Comercial | `proposals`, `propuesta`, `propuestas`, `crm` | Operación y publicación de propuestas |
| Sitio público | `contacto`, `precios`, `privacidad`, `producto`, `quienes-somos`, `servicios`, `journal` | Descubrimiento y contenido de marca |

## Política de reorganización

La reorganización será incremental. Antes de mover código se debe:

1. Identificar consumidores con `rg`.
2. Definir la frontera y el responsable de destino.
3. Mover una sola capacidad por cambio.
4. Actualizar imports y documentación.
5. Ejecutar pruebas dirigidas, lint y build.

No se harán movimientos masivos de carpetas como tarea cosmética.
