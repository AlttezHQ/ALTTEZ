# UI Contract — Categorías ALTTEZ

## Densidad operativa
- El grid debe priorizar escaneo rápido.
- Desktop: máximo 4 columnas amplias.
- Tablet: 2 columnas.
- Mobile: 1 columna.

## Jerarquía visual
- Header compacto, sin widgets analíticos decorativos.
- Card operativa con:
  - nombre + badge
  - 4 métricas
  - actividad
  - alerta principal
  - quick actions

## Tokens de superficie
- Radios:
  - contenedor principal: 18-22px
  - bloques internos: 12-15px
  - pills/badges: 999px
- Sombras:
  - card base: elevación media
  - hover: elevación media-alta, sin dramatismo

## Semantic colors
- `competition_active`: success
- `needs_group_draw`: amber
- `open_registration`: blue
- `has_incidents`: danger
- `paused`: muted
- `completed`: brand bronze

## Interaction states
- Hover sutil con `translateY(-1px/-2px)`
- Focus visible
- Alertas y quick actions siempre clickeables si son accionables

## Regla de consistencia
No volver a dashboards recargados, tablas infinitas ni cards genéricas de CRM.
