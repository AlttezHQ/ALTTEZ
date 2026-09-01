# Runbook de certificación — ALTTEZ Torneos

## Principio operativo

No se implementa una capacidad antes de demostrar que falta o falla. El orden
obligatorio es inventariar, conectar, persistir, probar y certificar.

## Severidades

| Nivel | Definición | Ejemplos | Acción |
|---|---|---|---|
| P0 | Impide operar o compromete datos/seguridad | No se puede entrar; pérdida de resultados; acceso cruzado | Detener fase y corregir |
| P1 | Bloquea el piloto sin alternativa aceptable | No reabre torneo; fixture incorrecto; privado visible | Corregir antes del piloto |
| P2 | Existe workaround documentado | Reprogramación manual; mensaje poco claro | Puede aplazarse con aprobación |
| P3 | Mejora no esencial | Ajuste visual o conveniencia | Backlog posterior |

## Evidencia mínima

Una capacidad solo cambia de estado con evidencia:

- `INVENTARIADA`: archivo, función o ruta identificada.
- `CONECTADA`: traza UI → dominio/store → servicio.
- `PERSISTIDA`: escritura y lectura verificadas en el ambiente canónico.
- `PROBADA`: prueba automatizada reproducible.
- `CERTIFICADA`: recorrido E2E repetido con resultado esperado.

Los logs, capturas y reportes de ejecución se guardan en `artifacts/`. Nunca se
incluyen tokens, correos reales, datos personales ni credenciales.

## Regla de no reconstrucción

Cuando una capacidad supera el gate:

1. Se marca como reutilizada en `CAPABILITY_MATRIX.md`.
2. No se refactoriza durante la certificación.
3. No se amplía con variantes fuera del piloto.
4. Se continúa con la siguiente dependencia.

Un refactor solo se autoriza si reduce una brecha P0/P1 demostrada o permite una
prueba que de otra forma es imposible.

## Criterios de detención

Detener la fase cuando:

- No está definido el proyecto Supabase canónico.
- Una operación puede sobrescribir o perder datos reales.
- La prueba requiere modificar producción.
- Aparece una violación de aislamiento entre organizadores.
- El resultado no puede reproducirse dos veces.

## Registro de resultados

Cada auditoría debe contener fecha, ambiente, precondiciones, pasos, resultado
esperado, resultado observado, severidad y evidencia. Los artefactos locales no
se convierten en documentación pública ni se fuerzan a Git.

## Flujo de trabajo multiagente

Los subagentes aceleran la recolección de evidencia, pero no aprueban tareas ni
deciden cambios de arquitectura, seguridad o alcance. La responsabilidad final
permanece en el agente principal.

1. **Asignación:** cada subagente recibe una tarea acotada, archivos objetivo,
   restricciones y un resultado verificable. Dos agentes no editan el mismo
   archivo simultáneamente.
2. **Producción:** el subagente reporta evidencia por archivo y línea, comandos
   ejecutados, limitaciones, nivel de confianza y cambios propuestos. Una
   inferencia debe estar separada de un hecho observado.
3. **Revisión crítica:** el agente principal contrasta el reporte con el código,
   reproduce las comprobaciones importantes y busca evidencia contradictoria.
   La frecuencia de una configuración no demuestra que sea canónica.
4. **Integración:** únicamente el agente principal acepta o integra cambios. Las
   correcciones Supabase se prueban en un entorno local vacío o staging; nunca
   se aplican directamente al proyecto remoto durante la auditoría.
5. **Gate:** `TASKS.md` solo se marca cuando existen evidencia reproducible,
   criterio de aceptación satisfecho y revisión final. Un reporte incompleto
   mantiene la tarea abierta aunque haya trabajo parcial.

### Criterios de rechazo

Se rechaza o devuelve un resultado cuando:

- confunde configuración local con estado remoto;
- afirma éxito sin comando, salida o recorrido reproducible;
- oculta errores, advertencias o dependencias del entorno;
- propone reconstruir una capacidad existente sin demostrar una brecha P0/P1;
- modifica migraciones, RLS, grants o datos antes de completar la auditoría;
- incluye secretos, datos personales o identificadores sensibles innecesarios.
