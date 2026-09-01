# Plataforma analítica (`data`)

Esta carpeta no es el backend transaccional de Next.js. Aloja el pipeline
analítico desacoplado y no debe ser importada por `src/`.

| Carpeta | Responsabilidad |
|---|---|
| `airflow/` | Extracción, carga y orquestación |
| `dbt/` | Staging, marts, pruebas y documentación |
| `warehouse/` | Objetos base y configuración de Snowflake |

El pipeline consume eventos o snapshots del sistema operacional. Nunca debe
escribir estados de negocio de vuelta en Supabase.

Hasta contar con dependencias fijadas, CI de datos y evidencia de despliegue,
esta plataforma se considera diseñada pero no operativa.
