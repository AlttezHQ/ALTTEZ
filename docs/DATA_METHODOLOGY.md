# DATA_METHODOLOGY — Elevate Sports
## Documento interno de metodologia de datos

> Audiencia: equipo de ingenieria y ciencia del deporte de Elevate Sports.
> Version: 1.0 | Fecha: 2026-03-28 | Autor: @Data (Mateo — Data Engine)

---

## 1. Filosofia de datos

Elevate Sports es, ante todo, una empresa de datos deportivos. Cada pixel
del producto debe estar respaldado por un calculo justificable, cada calculo
por una formula documentada, y cada formula por evidencia cientifica publicada.

**Principios no negociables:**

1. **Verdad antes que conveniencia.** Si no hay datos suficientes para un
   calculo (e.g., menos de 4 semanas para ACWR), el sistema lo dice
   explicitamente. Nunca se inventan numeros.

2. **El deportista primero.** El objetivo primario de cada algoritmo es
   detectar riesgo de lesion antes de que ocurra. Un falso negativo
   (no detectar riesgo) es mas costoso que un falso positivo.

3. **Accesibilidad sin sacrificar rigor.** Los modelos deben ser
   comprensibles para un entrenador sin formacion estadistica.
   Un semaforo de tres colores con un numero es suficiente para tomar
   una decision; la formula detras puede estar en este documento.

4. **Multi-tenancy absoluto.** Ningun dato de un club se mezcla con
   el de otro. `club_id` es el primer filtro en toda query, todo
   endpoint, toda clave de localStorage.

---

## 2. Modelos cientificos en produccion

### 2.1 RPE Health Engine v2.1 — `src/utils/rpeEngine.js`

**Modelo base:** Session RPE (sRPE) de Foster et al. (2001)
**Escala:** Borg CR-10 (Borg, 1998) — escala de esfuerzo percibido 1-10

**Formula implementada:**

```
RPE_avg = mean(RPEs de los ultimos 7 dias, max 7 sesiones)
SaludActual = clamp(100 - RPE_avg * 10, 0, 100)
```

**Semaforo v2.1 (calibrado para Sub-17):**

| SaludActual | RPE_avg equiv. | riskLevel   | Color   | Significado clinico           |
|-------------|----------------|-------------|---------|-------------------------------|
| >= 50       | <= 5.0         | optimo      | #1D9E75 | Disponible para competir      |
| 25 – 49     | 5.0 – 7.5      | precaucion  | #EF9F27 | Reducir carga o rotar         |
| < 25        | > 7.5          | riesgo      | #E24B4A | Descanso / trabajo regenerativo |
| sin datos   | —              | sin_datos   | gris    | Registrar RPE                 |

**Supuestos del modelo:**
- Se asume que RPE captura adecuadamente la carga interna percibida
  en ausencia de datos objetivos (GPS, lactato, FC).
- La ventana de 7 dias es una aproximacion a la carga aguda del modelo
  ACWR (Hulin et al., 2014). Sin duracion de sesion, es el proxy mas
  robusto disponible.
- El promedio aritmetico trata todas las sesiones de la ventana con
  igual peso. Esto subestima el impacto de sesiones muy recientes
  (el lunes de competencia pesa igual que el viernes de hace 5 dias).

**Calibracion Sub-17:**
El umbral "optimo" (>= 50) fue ajustado de >= 60 (v2.0) a >= 50 (v2.1)
tras detectar que RPE = 5 —carga estandar de una sesion tecnico-tactica—
activaba la alerta amarilla. En microciclos de competicion para Sub-17,
RPE 4-5 es la carga objetivo en dias de preparacion. Un umbral de 60
generaba falsos positivos que erosionaban la credibilidad del semaforo.

---

### 2.2 Elevate Score v1.0 — `src/utils/elevateScore.js`

**Modelo base:** Match performance analysis compuesto con pesos manuales.
**Referencia conceptual:** metodologias de InStat, Opta, WyScout
  (adaptadas a estadisticas basicas registrables por entrenador de campo)

**Formula:**

```
ElevateScore = (goles * 2.0) + (asistencias * 1.5) + (recuperaciones * 0.3)
             + (duelosGanados * 0.2) + (minutosJugados/90 * 1.0)
             - (amarilla * 0.5) - (roja * 3.0)
Score = clamp(ElevateScore, 0, 10)
```

**Justificacion de pesos (resumen):**

| Estadistica    | Peso | Razon                                                          |
|----------------|------|----------------------------------------------------------------|
| goles          | +2.0 | Accion de maximo impacto en marcador. Predictor de valor de transferencia (Gonzalez-Artetxe et al., 2020). |
| asistencias    | +1.5 | 75% del peso de gol. Creacion directa, pero dependiente del rematador. |
| recuperaciones | +0.3 | Frecuentes (6-12 por partido en mediocampistas); peso bajo evita distorsion por posicion. |
| duelosGanados  | +0.2 | Alta varianza segun posicion. Diferenciador marginal, no dominante. |
| minutos/90     | +1.0 | Base de participacion. 90 min completos = 1 punto base. |
| amarilla       | -0.5 | Penalizacion menor. No destruye el score de un partido bueno. |
| roja           | -3.0 | Penalizacion severa. Equivale a perder 1.5 goles de aporte. |

**OVR (Overall Rating):**

```
OVR = round(50 + (avgScore / 10) * 49)   rango: [50, 99]
```

Escala convencional FIFA elegida por reconocimiento cultural inmediato
en jugadores y entrenadores jovenes.

**Alertas cruzadas RPE x ElevateScore:**

| Condicion               | Nivel    | Fundamento                                                  |
|-------------------------|----------|-------------------------------------------------------------|
| RPE > 8 Y score > 7     | critical | "Alto rendimiento bajo alta fatiga" = patron de lesion (Gabbett, 2016) |
| RPE > 7                 | warning  | "Muy intenso" en Borg CR-10. Monitorear semana siguiente.  |

---

## 3. Limitaciones conocidas (v2.x)

### L1 — sRPE sin duracion de sesion (CRITICO)
**Impacto:** Medio-alto.
El modelo canonico de Foster et al. (2001) define la unidad de carga como:
```
UA = RPE * duracion_minutos
```
Sin duracion, una sesion de 30 min con RPE = 7 pesa igual que una de
90 min con RPE = 7. Para entrenamientos tecnicos (30-45 min) y pretemporadas
(90+ min), esto introduce un error sistematico de hasta 3x en la estimacion
de carga absoluta.

**Plan de mitigacion:** Agregar campo `duracionMinutos` al formulario de
sesion en el modulo de Entrenamiento. Recalcular el motor para usar UA
como unidad base en lugar de RPE puro. Planificado para v2.5 o antes
si hay demanda de clubes.

### L2 — Sin ACWR (Acute:Chronic Workload Ratio)
**Impacto:** Alto para deteccion de lesion a mediano plazo.
El ACWR de Hulin et al. (2014) es el predictor mas robusto de lesion
en deportes de campo:
```
ACWR = carga_aguda_7d / carga_cronica_promedio_4sem
Zona optima: 0.8 – 1.3
Zona riesgo: > 1.5
```
Requiere >= 4 semanas de datos consistentes. Con menos datos, el ratio
es inestable (denominador pequeno genera valores extremos).

**Plan de mitigacion:** Activar el calculo de ACWR automaticamente cuando
un club acumule >= 4 semanas de sesiones con RPE. El modulo debe incluir
una barra de progreso "Datos para ACWR: X/28 dias". Planificado para v3.0.

### L3 — Promedio aritmetico (no EWMA)
**Impacto:** Bajo en uso tipico; medio en microciclos de carga pico.
EWMA (Exponentially Weighted Moving Average) pondera sesiones recientes
mas fuerte que las antiguas, lo cual es fisiologicamente mas preciso:
el cuerpo recupera de una sesion de hace 6 dias, pero sigue cargado de
la de hace 2 dias. El promedio aritmetico ignora esta diferencia.

**Plan de mitigacion:** Implementar EWMA junto con ACWR en v3.0, ya que
ambos requieren datos diarios consistentes para ser estables.

### L4 — localStorage (no Supabase)
**Impacto:** Medio para uso multi-dispositivo.
Los snapshots de salud se persisten en localStorage, lo que significa:
- No son accesibles desde otro dispositivo del mismo entrenador.
- Se pierden al limpiar el cache del navegador.
- El limite practico es ~ 5 MB por origen (suficiente para 500 snapshots).

**Plan de mitigacion:** Sincronizar snapshots a Supabase en v3.0 junto
con la implementacion de ACWR. La tabla `health_snapshots` ya esta
en el SCHEMA_MODEL como planned.

### L5 — Elevate Score v1.0: pesos manuales sin calibracion estadistica
**Impacto:** Medio para validez de rankings entre posiciones.
Los pesos actuales son razonados pero no calibrados con datos reales de
ligas colombianas Sub-17. Un defensa central que juega 90 min y gana 10
duelos obtiene score ≈ 3.0, mientras un delantero con 1 gol obtiene 3.0
tambien — lo cual puede ser correcto o no segun el partido.

**Plan de mitigacion:** Calibrar pesos con regresion logistica sobre
outcome del partido (victoria/derrota) usando datos de los primeros
50 clubes que adopten el sistema. Planificado para v2.0 del Elevate Score.

---

## 4. Roadmap de datos — v3.0

### 4.1 ACWR completo
- Campo `duracionMinutos` en sesiones de entrenamiento.
- Calculo de UA = RPE * duracion.
- Carga aguda: suma UA ultimos 7 dias.
- Carga cronica: promedio de cargas agudas de las 4 semanas previas.
- ACWR = carga_aguda / carga_cronica.
- Semaforo ACWR: verde 0.8-1.3, amarillo 0.5-0.8 o 1.3-1.5, rojo <0.5 o >1.5.
- Funcion: `calculateACWR(athleteId, sessionHistory): { acwr, zone, recommendation }`

### 4.2 Health Snapshots en Supabase
- Tabla `health_snapshots` con RLS por club_id.
- Sincronizacion offline-first: guardar en localStorage, subir a Supabase
  cuando haya conexion.
- Acceso multi-dispositivo para el cuerpo tecnico.

### 4.3 Elevate Score v2.0 — calibracion estadistica
- Regresion logistica con outcome del partido como variable dependiente.
- Pesos calibrados por posicion (no un peso unico para todos).
- Intervalos de confianza para el score (no un punto sino un rango).

### 4.4 Prediccion de lesion
- Modelo de riesgo basado en: ACWR + historial de lesiones + carga de
  competencia (partidos / semana).
- Output: probabilidad de lesion en los proximos 7 dias (0-100%).
- Requiere >= 12 semanas de datos por atleta para ser valido.

---

## 5. Referencias completas

Borg, G. (1998). *Borg's perceived exertion and pain scales.*
  Human Kinetics. ISBN: 978-0-88011-623-7.

Foster, C., Florhaug, J. A., Franklin, J., Gottschall, L., Hrovatin, L. A.,
  Parker, S., ... & Dodge, C. (2001). A new approach to monitoring exercise
  training. *Journal of Strength and Conditioning Research, 15*(1), 109-115.
  https://doi.org/10.1519/00124278-200102000-00019

Gabbett, T. J. (2016). The training-injury prevention paradox: should
  athletes be training smarter and harder? *British Journal of Sports
  Medicine, 50*(5), 273-280. https://doi.org/10.1136/bjsports-2015-095788

Gonzalez-Artetxe, A., Los Arcos, A., Yanci, J., & Mendez-Villanueva, A.
  (2020). Match running performance and fatigue in youth soccer: effect of
  position and match outcome. *Frontiers in Psychology.*
  https://doi.org/10.3389/fpsyg.2020.01137

Hulin, B. T., Gabbett, T. J., Blanch, P., Chapman, P., Bailey, D., &
  Orchard, J. W. (2014). Spikes in acute workload are associated with
  increased injury risk in elite cricket fast bowlers. *British Journal of
  Sports Medicine, 48*(8), 708-712. https://doi.org/10.1136/bjsports-2013-092524

Impellizzeri, F. M., Rampinini, E., Coutts, A. J., Sassi, A., & Marcora,
  S. M. (2004). Use of RPE-based training load in soccer. *Medicine &
  Science in Sports & Exercise, 36*(6), 1042-1047.
  https://doi.org/10.1249/01.MSS.0000128199.23901.2F

---

*Documento mantenido por @Data (Mateo — Data Engine). Actualizar con cada
cambio de formula o umbral. Sincronizar con ENGINEERING_LOG.md.*
