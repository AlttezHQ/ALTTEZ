# Matriz de capacidades — ALTTEZ Torneos

Fecha de corte: 2026-08-28.

Esta matriz describe evidencia del repositorio. No equivale a certificación de
campo: una capacidad solo queda `CERTIFICADA` después de una prueba completa
contra el ambiente Supabase canónico.

## Estados

| Estado | Significado |
|---|---|
| INVENTARIADA | Existe código o una interfaz identificable |
| CONECTADA | La UI invoca el motor/store/servicio correspondiente |
| PERSISTIDA | Existe mapeo de escritura y lectura remota |
| PROBADA | Tiene prueba automatizada dirigida |
| CERTIFICADA | Superó el recorrido E2E en el ambiente objetivo |
| PARCIAL | Hay evidencia incompleta o caminos legacy paralelos |
| NO VERIFICABLE | Requiere ambiente, credenciales o navegador operativo |

## Formatos competitivos

| Capacidad | UI | Motor | Persistencia | Pruebas | Estado | Decisión |
|---|---|---|---|---|---|---|
| Todos contra todos | Seleccionable | `generarLiga` y round-robin | `formato`, `format`, `vueltas` | Round-robin, BYE, ida/vuelta | PROBADA | Reutilizar; E2E pendiente |
| Grupos + fase final | Seleccionable y configurable | Motor completo de grupos, standings y knockout | Configuración extendida de categoría | Cobertura amplia, incluido 8 equipos → semifinal/final | PROBADA | Configuración de referencia del piloto |
| Eliminación directa | Seleccionable | Genera bracket y rondas TBD | `formato`, legs y regla de desempate | Knockout cubierto dentro del motor avanzado; falta recorrido directo del wizard | PARCIAL | Reutilizar; certificar después del caso piloto |
| Liga + playoffs | Definida internamente | Cálculo estimado parcial | No certificada | Sin evidencia dirigida | INVENTARIADA | No se ofrece: está filtrada del selector |
| Mejores terceros | Configurable | `getQualifiedTeams` | Campos específicos | Prueba dirigida existente | PROBADA | Reutilizar; fuera de la primera simulación |
| Ida y vuelta | Configurable | Grupos y knockout soportan legs | Campos específicos | Prueba dirigida existente | PROBADA | Reutilizar; fuera de la primera simulación |
| Puntos configurables | Configurable | Standings parametrizado | `points_config` | Prueba dirigida existente | PROBADA | Reutilizar |
| Desempates múltiples | Configurable | Puntos, DG, GF, H2H, fair play y sorteo | `tiebreakers` | Incluye triple empate y fair play | PROBADA | Reutilizar |
| Programación automática | Accesible desde fixtures/programación | Heurística local y adapter | Guarda patches de partidos | Adapter local probado | PARCIAL | Auditar conflictos y persistencia E2E |

## Rutas y pantallas

| Ruta | Responsabilidad | Protección/entrada | Estado actual |
|---|---|---|---|
| `/torneos` | Inicio global | Layout exige Supabase, sesión, perfil y capacidad | CONECTADA; acceso E2E pendiente |
| `/torneos/lista` | Listado y apertura | Hereda layout | CONECTADA |
| `/torneos/crear` | Wizard de creación/edición | Hereda layout; carga dinámica cliente | CONECTADA |
| `/torneos/[torneoId]` | Resumen de torneo | ID desde URL | CONECTADA |
| `/torneos/[torneoId]/categorias` | Categorías | ID desde URL | CONECTADA |
| `/torneos/[torneoId]/equipos` | Equipos | ID desde URL | CONECTADA |
| `/torneos/[torneoId]/fixtures` | Fixture y resultados | ID desde URL | CONECTADA |
| `/torneos/[torneoId]/programacion` | Calendario competitivo | ID desde URL | CONECTADA |
| `/torneos/[torneoId]/grupos` | Grupos y posiciones | ID desde URL | CONECTADA |
| `/torneos/[torneoId]/fase_final` | Eliminación | ID desde URL | CONECTADA |
| `/torneos/[torneoId]/estadisticas` | Estadísticas | ID desde URL | INVENTARIADA |
| `/torneos/[torneoId]/publica` | Gestión de publicación | ID desde URL | CONECTADA |
| `/t/[slug]` | Portal público | Anónimo mediante vistas/fallback | PARCIAL; seguridad E2E pendiente |
| `/t/[slug]/registro-equipo/[equipoId]` | Registro público | Update directo con fallback RPC | PARCIAL; autorización pendiente |

## Estado y operaciones del dominio

| Área | Capacidades existentes | Persistencia declarada | Estado |
|---|---|---|---|
| Torneo | Crear, editar, eliminar, publicar, scheduling config | `torneos` | CONECTADA; remoto no verificado |
| Categorías | Agregar, actualizar, configuración competitiva | `torneo_categorias` | CONECTADA; remoto no verificado |
| Equipos | Alta individual/lote, edición, grupos, eliminación | `torneo_equipos` | CONECTADA; remoto no verificado |
| Sedes | Agregar y eliminar | `torneo_sedes` | CONECTADA; remoto no verificado |
| Árbitros | Agregar y eliminar | `torneo_arbitros` | CONECTADA; remoto no verificado |
| Partidos | Guardar, resultado, corregir, reprogramar, auto-programar | `torneo_partidos` | CONECTADA; usa estados legacy y canónicos |
| Analítica competitiva | Resultado, seeding, avance y desempate | RPC de outbox | CONECTADA; remoto no verificado |
| Lectura pública | Torneo, equipos, partidos y categorías | Vistas públicas con fallback a tablas | PARCIAL |
| Caché | Datos operativos y último torneo activo | Zustand persist | PARCIAL; reconciliación pendiente |

## Cobertura automatizada encontrada

| Área | Evidencia | Evaluación |
|---|---|---|
| Distribución de grupos | 8/2, 12/3, grupos desbalanceados y manual | Sólida |
| Round-robin | Una/dos vueltas, pares, impares y BYE | Sólida |
| Posiciones | Puntos, DG, GF y puntos personalizados | Sólida |
| Desempates | H2H múltiple y fair play | Sólida |
| Clasificación | Top N y mejores terceros | Sólida |
| Knockout | Semis/final, cuartos, legs, seeding y avance | Sólida |
| Gates competitivos | Generar fixture, cerrar grupos y generar knockout | Sólida |
| Máquina de estados | Normalización legacy y transición desde completado | Parcial pero dirigida |
| Programación | Adapter heurístico local | Parcial |
| Store/selectores | Selectores de Torneos | Parcial |
| Auth y onboarding | Sin E2E localizado | Brecha de certificación |
| Servicio Supabase | Sin pruebas dirigidas localizadas | Brecha de certificación |
| Portal público/RLS | Sin E2E localizado | Brecha de certificación |
| Resiliencia | Sin simulación automatizada localizada | Brecha de certificación |

## Conclusión del inventario

El dominio competitivo no necesita reconstrucción. La mayor inversión ya existe
en formatos, standings, desempates y brackets. Las brechas iniciales están en el
ambiente Supabase, acceso, persistencia comprobada, seguridad pública y recorridos
E2E. Esas fronteras deben certificarse antes de modificar motores.

## Auditoría local del contrato Supabase — 2026-08-31

Esta sección amplía T009, pero no la cierra: el esquema remoto canónico todavía
no está identificado ni consultado.

| Hallazgo | Evidencia local | Severidad/estado |
|---|---|---|
| El CRUD principal del servicio tiene tablas, vistas y RPC declaradas localmente | `torneosService.js`; migraciones `016`, `020`–`022` | Inventariado; remoto pendiente |
| Migraciones `014`–`021` usan entidades de Torneos creadas después en `022` | Orden actual de `supabase/migrations/` | P0 para bootstrap limpio |
| `update_equipo_public` y `enqueue_competition_event` son `SECURITY DEFINER` sin revocación/grant ni autorización suficiente declarada | Migraciones `016` y `020` | P0 potencial; requiere prueba de permisos efectivos |
| Tablas dependientes tienen políticas públicas `USING (true)` | Migración `022`, líneas 251–297 | P0 potencial de exposición de torneos privados |
| Las vistas públicas no declaran `security_invoker` | Migración `021` | Riesgo pendiente de ownership/grants |
| Equipos no persisten `categoria_id` y la vista aproxima categoría mediante `nombre = grupo` | Servicio y migración `021` | P1 de integridad funcional |
| Partidos omiten campos competitivos ya presentes en el esquema | Servicio frente a migración `022` | P1/P2 pendiente de E2E |
| El fallback usa `DEFAULT_TIEBREAKERS` sin definición/importación visible | `torneosService.js` | P1 reproducible por camino fallback |
| El deployment Vercel de producción no contiene configuración Supabase compilada | `/torneos`, bundles públicos y `src/shared/lib/supabase.js` | P0: acceso operativo bloqueado |

No se corregirá SQL hasta obtener un bootstrap local reproducible y probar los
permisos efectivos con organizadores A/B y `anon`.
