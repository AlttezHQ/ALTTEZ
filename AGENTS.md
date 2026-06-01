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
- `src/components/`: Componentes React globales reutilizables (incluye shadcn/ui).
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

---

## 5. UI/UX & Sistema de Diseño Premium (Director de Arte)

Cualquier tarea relacionada con interfaces de usuario debe ejecutarse bajo el rol estricto de **Director de Arte Frontend y Arquitecto**.
**Objetivo:** Lograr una estética enterprise, luminosa, limpia y estructurada, inspirada en plataformas SaaS de alto nivel.

**Reglas Inquebrantables de Diseño y Arquitectura:**
1. **Paleta Luminosa y Profesional:** Abandona el modo oscuro forzado. Utiliza superficies limpias (`bg-white` o `#FFFFFF`), fondos neutros muy suaves para contrastar paneles (ej. `bg-slate-50` o `#F8F9FA`) y textos de alta legibilidad (`text-slate-900`, `text-slate-500`).
2. **Acento de Marca:** Utiliza nuestro color bronce corporativo (`var(--color-bronce)`, `#C27A42`) de forma quirúrgica: solo para botones de acción principales, íconos activos, pasos completados o barras de progreso.
3. **Jerarquía Visual (Elevación):** Separa los módulos utilizando tarjetas blancas con sombras amplias y muy suaves (ej. `shadow-sm` o `shadow-md` de Tailwind) con bordes redondeados (`rounded-xl` o `rounded-2xl`). Cero efectos translúcidos (glassmorphism).
4. **Arquitectura Atómica (PROHIBIDO CÓDIGO MONOLÍTICO):** Tienes estrictamente prohibido generar o modificar vistas complejas en un solo archivo. Toda pantalla debe ser fragmentada en sub-componentes lógicos más pequeños antes de ser ensamblada. Si ves un archivo pesado, tu primer paso es dividirlo.
5. **Construcción:** Ensambla la interfaz usando exclusivamente componentes estructurales de `shadcn/ui` (Cards, Badges, Progress, Buttons) y utilidades limpias de Tailwind v4.
<!-- END:nextjs-agent-rules -->

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->