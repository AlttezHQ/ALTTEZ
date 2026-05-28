# Arquitectura de Categorías ALTTEZ

## Capas
- `selector`: obtiene y compone datos base desde store y entidades.
- `resolver`: decide estados, prioridad o clasificación.
- `engine`: evalúa reglas más amplias o reutilizables.
- `mapper`: transforma dominio a contratos de UI.
- `view model`: shape final para render.
- `utils`: helpers puros sin semántica fuerte de negocio.

## Idioma por capa
- Dominio técnico, contratos y view models: inglés.
- Copy visible al usuario: español.

## Naming conventions
- Estados operativos: `snake_case`
- Severidades: `low | medium | high | critical`
- Contratos de UI: `name`, `metrics`, `activity`, `alerts`, `quickActions`, `states`, `primaryState`
- No usar strings mágicos en componentes.

## Ubicación de responsabilidades
- `domain/alerts`: contrato y helpers compartibles de alertas.
- `domain/categories`: reglas y selectores propios de Categorías.
- `components/categories`: render puro, sin acceso a store.

## Regla principal
React no resuelve negocio. La UI consume view models ya preparados.
