<!-- BEGIN:nextjs-agent-rules -->
# Guía de Desarrollo para Agentes de IA en Alttez

Este archivo define las reglas de desarrollo, estructura y comandos del proyecto Alttez. Es de lectura obligatoria para cualquier agente antes de programar o realizar cambios.

## 1. Stack Tecnológico

El proyecto está en proceso de transición hacia un stack basado en:
- **Framework:** Next.js (v16.2.6 - App Router) y React (v19.2.4).
  - *Nota:* Esta versión de Next.js posee cambios disruptivos respecto a Next.js 13/14. Consulta la documentación oficial local si encuentras incompatibilidades.
- **Estilos:** Tailwind CSS v4 y Vanilla CSS (`src/index.css`).
- **Base de Datos & Auth:** Supabase (`@supabase/supabase-js`).
- **Analítica de Datos (Pipeline):** Ubicada en la carpeta `data/` (Airflow, dbt y scripts para Snowflake).

---

## 2. Estructura de Directorios

El código principal reside en `src/`:
- `src/app/`: Enrutamiento y páginas de Next.js (App Router).
- `src/components/`: Componentes React globales reutilizables.
- `src/marketing/`: Vistas y datos referentes a la landing page y marketing.
- `src/shared/`: Clientes de API, Hooks y layouts compartidos (e.g., cliente de Supabase, layouts de Auth).
- `data/`: Scripts del pipeline de analítica de datos (DBT y dags de Airflow). **No borrar ni ignorar**, es un desarrollo activo.

---

## 3. Comandos Útiles

- **Iniciar Servidor de Desarrollo:** `npm run dev` o `npm run dev:local` (para hostname 127.0.0.1).
- **Compilar para Producción:** `npm run build`
- **Ejecutar Linter:** `npm run lint`

---

## 4. Reglas Críticas del Proyecto (Leyes del Agente)

### A. Seguridad y Privacidad
- **Variables de Entorno:** Nunca commitear archivos `.env` ni credenciales de desarrollo. Utilizar `.env.example` como plantilla con valores ficticios.
- **Documentación Interna:** La carpeta `docs/` contiene análisis financieros e informes de infraestructura y ha sido añadida al `.gitignore` para mantenerse local. **No debe forzarse su rastreo.**

### B. Limpieza del Espacio de Trabajo
- **Archivos Temporales:** No generes archivos `.txt` de logs de depuración (como `debug_match_*.txt` o `page_dump_*.txt`) en la raíz del proyecto.
- Si requieres escribir logs de depuración o capturas de pantalla, hazlo exclusivamente dentro de la carpeta `artifacts/`, la cual está configurada para ser ignorada por Git.

### C. Buenas Prácticas de Código
- Mantener los componentes pequeños, modulares y reutilizables.
- Utilizar TypeScript para los nuevos archivos de la carpeta `src/app/`.
- No alterar ni borrar código de `data/` a menos que sea solicitado explícitamente para tareas de analítica.
<!-- END:nextjs-agent-rules -->
