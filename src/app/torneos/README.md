# Dominio ALTTEZ Torneos

Responsable de la administración competitiva y de las rutas privadas bajo
`/torneos`. El portal público vive bajo `src/app/t` y consume contratos públicos
del mismo dominio.

## Capas

| Ruta | Responsabilidad |
|---|---|
| `[torneoId]/` | Rutas de un torneo identificado por URL |
| `components/` | UI específica del dominio |
| `domain/` | Estados, reglas, selectores y mapeadores |
| `services/` | Lectura/escritura contra Supabase |
| `store/` | Caché y transiciones de estado |
| `utils/` | Motores de competencia, fixture y programación |
| `pages/` | Pantallas heredadas ensambladas por rutas App Router |

## Fuente de verdad

- El torneo activo proviene de `torneoId` en la URL.
- Supabase es la fuente de verdad remota.
- Zustand puede conservar caché y borradores, pero no conceder confirmación de
  persistencia sin respuesta del servicio.
- Las reglas competitivas deben ser funciones puras con pruebas.

## Corredor operativo prioritario

```text
acceso → onboarding → crear torneo → categorías → equipos → fixture
→ programación → resultados → posiciones → publicación
```

Todo trabajo inmediato debe mejorar este corredor antes de ampliar módulos.

## Configuración de referencia para certificación

La primera certificación operativa usa una configuración que ya soporta el
motor; no limita ni elimina los demás formatos:

- Fútbol y una categoría.
- 8 equipos distribuidos en 2 grupos de 4.
- Todos contra todos a una vuelta en cada grupo.
- 3 puntos por victoria, 1 por empate y 0 por derrota.
- Clasifican 2 equipos por grupo.
- Semifinales cruzadas y final a partido único.
- Penales como desempate de eliminación.
- Sin mejores terceros ni partido por tercer puesto en esta simulación.

El caso produce 12 partidos de grupos, 2 semifinales y 1 final: 15 partidos. Los
formatos todos contra todos, eliminación directa, ida/vuelta y mejores terceros
siguen disponibles y se certificarán después, sin reconstruir sus motores.

La evidencia del inventario vive en [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
y el protocolo de ejecución en [RUNBOOK.md](./RUNBOOK.md).

El backlog ejecutable y ordenado por dependencias está en [TASKS.md](./TASKS.md).
