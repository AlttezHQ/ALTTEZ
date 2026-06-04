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

### C. Documentación Continua Obligatoria
- **Actualización en Tiempo Real:** Cada vez que se genere una nueva estructura arquitectónica (ej. transición a App Router, nuevos módulos importantes) o se realice un cambio significativo en la lógica base del sistema, **debe documentarse inmediatamente**. Ya sea actualizando este archivo `AGENTS.md`, modificando los artefactos relevantes o creando reportes técnicos, nunca se debe avanzar asumiendo que los cambios están sobreentendidos.

### D. Buenas Prácticas de Código
- Mantener los componentes pequeños, modulares y reutilizables.
- Utilizar TypeScript para los nuevos archivos de la carpeta `src/app/`.
- **Manejo de Estado (Zustand vs URL):** La fuente de la verdad para entidades activas (ej. el torneo seleccionado, el ID del registro) **debe ser siempre la URL** (`useParams` o `searchParams`). Zustand se utilizará de forma pasiva (como caché de datos) y no debe almacenar IDs activos, previniendo fallos críticos de desincronización durante la navegación hacia atrás (browser back).
- No alterar ni borrar código de `data/` a menos que sea solicitado explícitamente para tareas de analítica.

---

## 5. UI/UX & Sistema de Diseño Premium (Director de Arte)

Cualquier tarea relacionada con interfaces de usuario debe ejecutarse bajo el rol estricto de **Director de Arte Frontend y Arquitecto**.
**Objetivo:** Lograr una estética enterprise, basada en el Manual de Marca v2.0 (estilo oscuro, estructurado y enfocado en rendimiento deportivo).

**Reglas Inquebrantables de Diseño y Arquitectura (Manual v2.0):**
1. **Paleta Cromática Oficial (Dark Mode):** 
   - **Grafito (`#111315` - 60%):** Color base para fondos que transmite fuerza y tecnología.
   - **Marfil (`#F5F7F8` - 25%):** Color secundario para textos y claridad en la interfaz.
   - **Cobre (`#C27A42` - 10%):** Acento principal. Úsalo quirúrgicamente para botones de acción principal, íconos activos y progreso.
   - **Azul Rendimiento (`#3F6D85` - 5%):** Color funcional para datos, métricas y gráficos.
   - **Estados:** Éxito (`#22C55E`), Advertencia (`#F5BE05`), Riesgo (`#EF4444`), Información (`#3F6B85`), Neutro (`#6B7280`).
2. **Tipografía Oficial:**
   - **Sora Bold:** Uso exclusivo para Títulos y Encabezados (Headings H1-H4).
   - **Inter Regular:** Uso para textos, interfaz (UI), tablas y etiquetas.
3. **Sistema Visual (Módulos y Profundidad):** Utiliza "Líneas tácticas" y un Grid Estructural. Las interfaces modulares deben estar bien definidas con contrastes (tarjetas grises/oscuras sobre fondo Grafito) sin usar transparencias tipo glassmorphism. La iconografía debe ser lineal (2px), minimalista y de esquinas redondeadas.
4. **Arquitectura Atómica (PROHIBIDO CÓDIGO MONOLÍTICO):** Tienes estrictamente prohibido generar o modificar vistas complejas en un solo archivo. Toda pantalla debe ser fragmentada en sub-componentes lógicos más pequeños antes de ser ensamblada. Si ves un archivo pesado, tu primer paso es dividirlo.
5. **Construcción:** Ensambla la interfaz usando exclusivamente componentes estructurales de `shadcn/ui` y utilidades limpias de Tailwind v4 alineadas a los tokens corporativos.
<!-- END:nextjs-agent-rules -->

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->