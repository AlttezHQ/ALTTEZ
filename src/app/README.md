# Rutas y dominios (`src/app`)

Cada carpeta enrutable corresponde a un segmento de App Router. Un dominio
complejo puede contener estas capas:

```text
<dominio>/
├── page.tsx / layout.tsx   Entrada de ruta
├── components/             Presentación local
├── domain/                 Reglas y contratos de negocio
├── services/               I/O del dominio
├── store/                  Estado y transiciones
├── selectors/              Estado derivado
└── utils/                  Algoritmos puros del dominio
```

Las páginas ensamblan; no deben concentrar reglas críticas. Los IDs activos se
leen desde URL (`params` o `searchParams`), no desde Zustand.

Los archivos nuevos en esta carpeta deben ser TypeScript/TSX. La migración de
JavaScript heredado se realiza de forma incremental y junto a cambios reales.
