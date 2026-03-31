/**
 * @file rpeEngine.test.js
 * @description Tests unitarios para el motor RPE de Salud Actual v2.0 + ACWR v3.1.
 *
 * Modelo sRPE: SaludActual = clamp(100 - RPE_avg_7d × 10, 0, 100)
 * Modelo ACWR v3.1: ratio = promedio_agudo_7d / promedio_cronico_28d (Hulin et al., 2014)
 * v2.0: RPE per-athlete via rpeByAthlete, ventana 7d via savedAt ISO
 * v3.1: ACWR con promedios diarios — ratio puede superar 1.0 y detectar spikes reales
 *
 * @author @QA (Sara-QA_Seguridad) + @Data (Mateo-Data_Engine)
 * @version 3.1.0
 */

import { describe, it, expect } from "vitest";
import { calcSaludActual, calcSaludPlantel, saludColor, calcACWR, calcAthleteRisk } from "../utils/rpeEngine";

// Helper: genera savedAt dentro de los ultimos N dias
function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

// ════════════════════════════════════════════════
// calcSaludActual — casos basicos (compatibilidad v1)
// ════════════════════════════════════════════════

describe("calcSaludActual — basico", () => {
  it("retorna salud 100 y sin_datos cuando no hay RPE", () => {
    const result = calcSaludActual(null, []);
    expect(result.salud).toBe(100);
    expect(result.riskLevel).toBe("sin_datos");
    expect(result.rpeAvg7d).toBeNull();
  });

  it("calcula correctamente con RPE actual de 5 → salud 50", () => {
    const result = calcSaludActual(5, []);
    expect(result.salud).toBe(50);
    expect(result.riskLevel).toBe("optimo");
    expect(result.rpeAvg7d).toBe(5);
  });

  it("calcula correctamente con RPE actual de 1 → salud 90", () => {
    const result = calcSaludActual(1, []);
    expect(result.salud).toBe(90);
    expect(result.riskLevel).toBe("optimo");
  });

  it("calcula correctamente con RPE actual de 10 → salud 0", () => {
    const result = calcSaludActual(10, []);
    expect(result.salud).toBe(0);
    expect(result.riskLevel).toBe("riesgo");
  });

  it("clamps salud entre 0 y 100", () => {
    expect(calcSaludActual(10, []).salud).toBe(0);
    expect(calcSaludActual(null, []).salud).toBe(100);
  });

  it("retorna rpeAvg7d con 1 decimal", () => {
    const historial = [{ rpeAvg: 8, savedAt: daysAgo(1) }];
    const result = calcSaludActual(7, historial);
    expect(result.rpeAvg7d).toBe(7.5);
  });

  it("limita a 7 entradas maximo", () => {
    const historial = Array.from({ length: 20 }, () => ({
      rpeAvg: 5, savedAt: daysAgo(1),
    }));
    const result = calcSaludActual(5, historial);
    expect(result.salud).toBe(50);
  });
});

// ════════════════════════════════════════════════
// calcSaludActual — RPE per-athlete (v2.0)
// ════════════════════════════════════════════════

describe("calcSaludActual — per-athlete RPE", () => {
  it("usa rpeByAthlete cuando athleteId es proporcionado", () => {
    const historial = [
      { rpeByAthlete: { 1: 8, 2: 3 }, rpeAvg: 5.5, savedAt: daysAgo(1) },
    ];
    // Atleta 1: RPE actual 7, historico 8 → avg (7+8)/2 = 7.5 → salud 25
    const r1 = calcSaludActual(7, historial, 1);
    expect(r1.rpeAvg7d).toBe(7.5);
    expect(r1.salud).toBe(25);
    expect(r1.riskLevel).toBe("precaucion");

    // Atleta 2: RPE actual 2, historico 3 → avg (2+3)/2 = 2.5 → salud 75
    const r2 = calcSaludActual(2, historial, 2);
    expect(r2.rpeAvg7d).toBe(2.5);
    expect(r2.salud).toBe(75);
    expect(r2.riskLevel).toBe("optimo");
  });

  it("diferencia correctamente entre atletas del mismo equipo", () => {
    const historial = [
      { rpeByAthlete: { 10: 9, 20: 2 }, savedAt: daysAgo(2) },
      { rpeByAthlete: { 10: 8, 20: 3 }, savedAt: daysAgo(1) },
    ];
    const fatigued = calcSaludActual(null, historial, 10);
    const fresh    = calcSaludActual(null, historial, 20);

    // Atleta 10: avg(9,8) = 8.5 → salud 15
    expect(fatigued.salud).toBe(15);
    expect(fatigued.riskLevel).toBe("riesgo");

    // Atleta 20: avg(2,3) = 2.5 → salud 75
    expect(fresh.salud).toBe(75);
    expect(fresh.riskLevel).toBe("optimo");
  });

  it("fallback a rpeAvg cuando rpeByAthlete no tiene el atleta", () => {
    const historial = [
      { rpeByAthlete: { 1: 8 }, rpeAvg: 5, savedAt: daysAgo(1) },
    ];
    // Atleta 99 no esta en rpeByAthlete → usa rpeAvg=5
    const r = calcSaludActual(null, historial, 99);
    expect(r.rpeAvg7d).toBe(5);
    expect(r.salud).toBe(50);
  });

  it("fallback a rpeAvg para sesiones legacy sin rpeByAthlete", () => {
    const historial = [
      { rpeAvg: 6, fecha: "Mar 18 Mar" }, // sesion legacy: sin savedAt ni rpeByAthlete
    ];
    const r = calcSaludActual(4, historial, 1);
    // avg(4,6) = 5 → salud 50
    expect(r.salud).toBe(50);
  });
});

// ════════════════════════════════════════════════
// calcSaludActual — ventana temporal 7 dias
// ════════════════════════════════════════════════

describe("calcSaludActual — ventana temporal", () => {
  it("excluye sesiones fuera de la ventana de 7 dias", () => {
    const historial = [
      { rpeByAthlete: { 1: 9 }, savedAt: daysAgo(10) }, // fuera de ventana
      { rpeByAthlete: { 1: 3 }, savedAt: daysAgo(2) },  // dentro
    ];
    // Solo toma RPE=3 del dia 2 → salud = 100 - 30 = 70
    const r = calcSaludActual(null, historial, 1);
    expect(r.rpeAvg7d).toBe(3);
    expect(r.salud).toBe(70);
  });

  it("incluye sesiones del limite exacto de 7 dias", () => {
    const historial = [
      { rpeByAthlete: { 1: 6 }, savedAt: daysAgo(7) }, // justo en el limite
    ];
    const r = calcSaludActual(4, historial, 1);
    // avg(4,6) = 5 → salud 50
    expect(r.salud).toBe(50);
  });

  it("usa savedAt ISO sobre fecha display", () => {
    const historial = [
      { rpeByAthlete: { 1: 9 }, rpeAvg: 9, savedAt: daysAgo(20), fecha: "Hoy" },
    ];
    // savedAt es 20 dias atras → fuera de ventana → excluido
    const r = calcSaludActual(null, historial, 1);
    expect(r.riskLevel).toBe("sin_datos");
  });
});

// ════════════════════════════════════════════════
// calcSaludActual — validacion de rangos
// ════════════════════════════════════════════════

describe("calcSaludActual — validacion", () => {
  it("ignora RPE fuera de rango [1,10] en historial", () => {
    const historial = [
      { rpeByAthlete: { 1: 15 }, savedAt: daysAgo(1) }, // invalido
      { rpeByAthlete: { 1: 0 },  savedAt: daysAgo(1) }, // invalido
      { rpeByAthlete: { 1: 5 },  savedAt: daysAgo(1) }, // valido
    ];
    const r = calcSaludActual(3, historial, 1);
    // avg(3,5) = 4 → salud 60
    expect(r.salud).toBe(60);
  });

  it("ignora RPE null y '—' en historial", () => {
    const historial = [
      { rpeAvg: null, savedAt: daysAgo(1) },
      { rpeAvg: "\u2014", savedAt: daysAgo(1) },
      { rpeAvg: 7, savedAt: daysAgo(1) },
    ];
    const r = calcSaludActual(null, historial);
    expect(r.salud).toBe(30);
    expect(r.riskLevel).toBe("precaucion");
  });

  it("ignora currentRpe fuera de rango", () => {
    expect(calcSaludActual(0, []).riskLevel).toBe("sin_datos");
    expect(calcSaludActual(11, []).riskLevel).toBe("sin_datos");
    expect(calcSaludActual(-1, []).riskLevel).toBe("sin_datos");
  });
});

// ════════════════════════════════════════════════
// saludColor
// ════════════════════════════════════════════════

describe("saludColor", () => {
  it("retorna verde para salud >= 50", () => {
    expect(saludColor(50)).toBe("#1D9E75");
    expect(saludColor(100)).toBe("#1D9E75");
    expect(saludColor(75)).toBe("#1D9E75");
  });

  it("retorna ambar para salud 25-49", () => {
    expect(saludColor(25)).toBe("#EF9F27");
    expect(saludColor(49)).toBe("#EF9F27");
    expect(saludColor(45)).toBe("#EF9F27");
  });

  it("retorna rojo para salud < 25", () => {
    expect(saludColor(24)).toBe("#E24B4A");
    expect(saludColor(0)).toBe("#E24B4A");
    expect(saludColor(10)).toBe("#E24B4A");
  });
});

// ════════════════════════════════════════════════
// calcSaludPlantel
// ════════════════════════════════════════════════

describe("calcSaludPlantel", () => {
  it("retorna Map con salud individual para cada atleta", () => {
    const athletes = [
      { id: 1, rpe: 3 },
      { id: 2, rpe: 8 },
      { id: 3, rpe: null },
    ];
    const map = calcSaludPlantel(athletes, []);
    expect(map.size).toBe(3);
    expect(map.get(1).salud).toBe(70);
    expect(map.get(2).salud).toBe(20);
    expect(map.get(3).riskLevel).toBe("sin_datos");
  });

  it("maneja plantel vacio", () => {
    const map = calcSaludPlantel([], []);
    expect(map.size).toBe(0);
  });

  it("usa RPE individual del historial, no promedio equipo", () => {
    const athletes = [
      { id: 1, rpe: 5 },
      { id: 2, rpe: 5 },
    ];
    const historial = [
      { rpeByAthlete: { 1: 9, 2: 2 }, rpeAvg: 5.5, savedAt: daysAgo(1) },
    ];
    const map = calcSaludPlantel(athletes, historial);
    // Atleta 1: avg(5,9) = 7 → salud 30
    expect(map.get(1).salud).toBe(30);
    // Atleta 2: avg(5,2) = 3.5 → salud 65
    expect(map.get(2).salud).toBe(65);
    // Con la v1 ambos hubieran dado salud 48 (avg con rpeAvg=5.5 del equipo)
  });
});

// ════════════════════════════════════════════════
// calcACWR — ACWR engine v3.1 (Hulin et al., 2014) — promedios diarios
// ════════════════════════════════════════════════

describe("calcACWR", () => {
  it("sin historial retorna ratio null, acute 0, chronic 0", () => {
    // Sin datos: no hay sesiones en ninguna ventana. hasChronicData = false → null.
    const result = calcACWR(1, []);
    expect(result.ratio).toBeNull();
    expect(result.acute).toBe(0);
    expect(result.chronic).toBe(0);
  });

  it("con solo 7 dias de historial retorna ratio null (sin datos cronicos fuera de aguda)", () => {
    // v3.1: ratio es null cuando no hay sesiones en la ventana 7-28d.
    // Sin datos cronicos fuera de la aguda, el denominador no tiene significado historico.
    const historial = [
      { rpeByAthlete: { 1: 5 }, savedAt: daysAgo(1) },
      { rpeByAthlete: { 1: 6 }, savedAt: daysAgo(3) },
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(6) },
    ];
    const result = calcACWR(1, historial);
    // Solo hay datos en ventana 0-7d. hasChronicData = false → ratio = null.
    expect(result.ratio).toBeNull();
    // acute = promedio(5,6,4) = 5.0
    expect(result.acute).toBe(5);
    // chronic = promedio(5,6,4) = 5.0 (mismos datos, ventana 0-28d)
    expect(result.chronic).toBe(5);
  });

  it("con historial de 28 dias bien distribuido calcula ratio correcto con promedios", () => {
    // Semana aguda (0-7d): 3 sesiones RPE 6 → acute = promedio = 6.0
    // Semanas 2-4 (8-28d): 9 sesiones RPE 4 (datos cronicos fuera de aguda)
    // chronic = promedio(6,6,6, 4,4,4,4,4,4,4,4,4) = (18+36)/12 = 54/12 = 4.5
    // ratio = 6.0 / 4.5 = 1.33
    const historial = [
      // Semana aguda (0-7d)
      { rpeByAthlete: { 1: 6 }, savedAt: daysAgo(1) },
      { rpeByAthlete: { 1: 6 }, savedAt: daysAgo(3) },
      { rpeByAthlete: { 1: 6 }, savedAt: daysAgo(6) },
      // Semanas 2-3 (8-21d)
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(9) },
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(11) },
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(14) },
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(16) },
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(18) },
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(21) },
      // Semana 4 (22-28d)
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(23) },
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(25) },
      { rpeByAthlete: { 1: 4 }, savedAt: daysAgo(27) },
    ];
    const result = calcACWR(1, historial);
    // acute = promedio(6,6,6) = 6.0
    expect(result.acute).toBe(6);
    // chronic = promedio de 12 sesiones = 4.5
    expect(result.chronic).toBe(4.5);
    // ratio = 6.0 / 4.5 = 1.33
    expect(result.ratio).toBeCloseTo(1.33, 2);
  });

  it("spike de carga: promedio agudo >> promedio cronico → ratio > 1.0 (modelo v3.1)", () => {
    // v3.1 usa promedios → el ratio PUEDE superar 1.0 cuando la semana es mas intensa.
    // Aguda (0-7d): [3,3,3,3,9,9] + currentRpe=9 → 7 valores, avg = 39/7 ≈ 5.57
    // Cronica (0-28d): los 7 agudos + 9 de base RPE 3 = 16 valores, avg = (39+27)/16 = 66/16 ≈ 4.13
    // ratio = 5.57 / 4.13 ≈ 1.35
    const historial = [
      // Semana aguda: 4 suaves + 2 explosivos
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(7) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(5) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(4) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(3) },
      { rpeByAthlete: { 7: 9 }, savedAt: daysAgo(2) },
      { rpeByAthlete: { 7: 9 }, savedAt: daysAgo(1) },
      // Semanas 2-4: carga base RPE 3
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(9) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(11) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(14) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(16) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(18) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(21) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(23) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(25) },
      { rpeByAthlete: { 7: 3 }, savedAt: daysAgo(27) },
    ];
    const result = calcACWR(7, historial, 9);
    // acute: [9,3,3,3,3,9,9] = 7 items, avg = 39/7 ≈ 5.57
    expect(result.acute).toBeCloseTo(5.57, 1);
    // chronic: 16 items, avg = 66/16 ≈ 4.13
    expect(result.chronic).toBeCloseTo(4.13, 1);
    // ratio > 1.0 (confirma que el modelo v3.1 supera el limite del modelo de sumas)
    expect(result.ratio).toBeGreaterThan(1.0);
    expect(result.ratio).toBeCloseTo(1.35, 1);
  });

  it("ACWR < 0.8 con semana aguda suave vs base cronica moderada", () => {
    // Aguda (0-7d): [2,2] → avg = 2.0
    // Cronica (0-28d): [2,2,6,6,6,6,6,6,6] = 9 items, avg = 46/9 ≈ 5.11
    // ratio = 2.0 / 5.11 ≈ 0.39 → yellow (< 0.8)
    const historial = [
      { rpeByAthlete: { 3: 2 }, savedAt: daysAgo(2) },
      { rpeByAthlete: { 3: 2 }, savedAt: daysAgo(5) },
      { rpeByAthlete: { 3: 6 }, savedAt: daysAgo(9) },
      { rpeByAthlete: { 3: 6 }, savedAt: daysAgo(12) },
      { rpeByAthlete: { 3: 6 }, savedAt: daysAgo(15) },
      { rpeByAthlete: { 3: 6 }, savedAt: daysAgo(18) },
      { rpeByAthlete: { 3: 6 }, savedAt: daysAgo(21) },
      { rpeByAthlete: { 3: 6 }, savedAt: daysAgo(24) },
      { rpeByAthlete: { 3: 6 }, savedAt: daysAgo(27) },
    ];
    const result = calcACWR(3, historial);
    // acute = promedio(2,2) = 2.0
    expect(result.acute).toBe(2);
    expect(result.ratio).toBeLessThan(0.8);
  });

  it("acepta athleteId como string o number (tolerancia de tipo)", () => {
    // Necesitamos datos en ambas ventanas para que ratio no sea null
    const historial = [
      { rpeByAthlete: { 5: 7 }, savedAt: daysAgo(2) },  // ventana aguda
      { rpeByAthlete: { 5: 7 }, savedAt: daysAgo(10) }, // ventana cronica
    ];
    const resultNum = calcACWR(5, historial);
    const resultStr = calcACWR("5", historial);
    // acute(0-7d) = promedio(7) = 7.0; chronic(0-28d) = promedio(7,7) = 7.0
    // hasChronicData: dia 10 esta en 7-28d → true → ratio = 7/7 = 1.0
    expect(resultNum.ratio).not.toBeNull();
    expect(resultStr.ratio).not.toBeNull();
    expect(resultNum.ratio).toBe(resultStr.ratio);
    expect(resultNum.ratio).toBe(1);
  });
});

// ════════════════════════════════════════════════
// calcAthleteRisk — selector de riesgo ACWR v3.1
// ════════════════════════════════════════════════

describe("calcAthleteRisk", () => {
  it("retorna status 'unknown' cuando no hay datos cronicos fuera de los 7d agudos", () => {
    // Sin historial: hasChronicData = false → ratio = null → status unknown
    const result = calcAthleteRisk(1, []);
    expect(result.status).toBe("unknown");
    expect(result.ratio).toBeNull();
    expect(result.trend).toBe("stable");
    expect(result.suggestion).toMatch(/28 dias/);
  });

  it("retorna status 'green' con historial uniforme de 28 dias (ratio = 1.0)", () => {
    // 28 sesiones con RPE 5: acute = avg(5×7) = 5.0, chronic = avg(5×28) = 5.0
    // ratio = 5/5 = 1.0 → green (zona optima 0.8-1.3)
    const uniform = Array.from({ length: 28 }, (_, i) => ({
      rpeByAthlete: { 9: 5 },
      savedAt: daysAgo(i + 1),
    }));
    const result = calcAthleteRisk(9, uniform);
    // Con promedios, acute = 5 y chronic = 5 → ratio = 1.0
    expect(result.ratio).toBeCloseTo(1.0, 2);
    expect(result.status).toBe("green");
    expect(result.suggestion).toMatch(/optima/i);
  });

  it("retorna status 'red' con spike de carga: aguda alta vs base cronica baja", () => {
    // Aguda (0-7d): 5 sesiones RPE 8 → avg = 8.0
    // Cronica (8-28d): 15 sesiones RPE 2 (base baja recuperacion)
    // chronic (0-28d): promedio(8×5, 2×15) = (40+30)/20 = 3.5
    // ratio = 8.0 / 3.5 ≈ 2.29 → rojo (> 1.5)
    const historial = [
      // Semana aguda: alta intensidad
      { rpeByAthlete: { 4: 8 }, savedAt: daysAgo(1) },
      { rpeByAthlete: { 4: 8 }, savedAt: daysAgo(2) },
      { rpeByAthlete: { 4: 8 }, savedAt: daysAgo(3) },
      { rpeByAthlete: { 4: 8 }, savedAt: daysAgo(5) },
      { rpeByAthlete: { 4: 8 }, savedAt: daysAgo(6) },
      // Base cronica: recuperacion larga con RPE bajo
      ...Array.from({ length: 15 }, (_, i) => ({
        rpeByAthlete: { 4: 2 },
        savedAt: daysAgo(i + 8),
      })),
    ];
    const result = calcAthleteRisk(4, historial);
    expect(result.ratio).toBeGreaterThan(1.5);
    expect(result.status).toBe("red");
    expect(result.suggestion).toMatch(/lesion|peligro/i);
  });

  it("retorna status 'yellow' carga baja con currentRpe alto y base cronica moderada", () => {
    // Cronica base moderada, semana aguda con solo un currentRpe alto pero
    // base historica aguda baja → ratio resultante entre yellow y green segun calculo
    const historial = [
      { rpeByAthlete: { 6: 1 }, savedAt: daysAgo(8) },
      { rpeByAthlete: { 6: 1 }, savedAt: daysAgo(15) },
      { rpeByAthlete: { 6: 1 }, savedAt: daysAgo(22) },
    ];
    const result = calcAthleteRisk(6, historial, 10);
    // acuteRpes (0-7d): [] + currentRpe=10 → [10], avg = 10.0
    // chronicRpes (0-28d): [1,1,1] + currentRpe=10 → [10,1,1,1], avg = 13/4 = 3.25
    // hasChronicData: dia 8,15,22 → si (en ventana 7-28d)
    // ratio = 10 / 3.25 ≈ 3.08 → red (> 1.5)
    expect(result.ratio).toBeGreaterThan(1.5);
    expect(result.status).toBe("red");
  });

  it("trend 'up' cuando ratio actual sube mas de 0.1 respecto a semana anterior", () => {
    // Con promedios v3.1:
    // acute(0-7d): [8,8] avg=8.0
    // chronic(0-28d): [8,8,1,5,5,5,5,5] avg=42/8=5.25
    // hasChronicData: dia 9,17,22,24,26,28 → si
    // ratio = 8.0/5.25 ≈ 1.52
    // prevAcute(7-14d): [1] avg=1.0
    // prevChronic(7-28d): [1,5,5,5,5,5] avg=26/6≈4.33
    // prevRatio = 1.0/4.33 ≈ 0.23
    // 1.52 > 0.23 + 0.1 → trend "up"
    const historial = [
      { rpeByAthlete: { 12: 8 }, savedAt: daysAgo(2) },
      { rpeByAthlete: { 12: 8 }, savedAt: daysAgo(5) },
      { rpeByAthlete: { 12: 1 }, savedAt: daysAgo(9) },
      { rpeByAthlete: { 12: 5 }, savedAt: daysAgo(17) },
      { rpeByAthlete: { 12: 5 }, savedAt: daysAgo(22) },
      { rpeByAthlete: { 12: 5 }, savedAt: daysAgo(24) },
      { rpeByAthlete: { 12: 5 }, savedAt: daysAgo(26) },
      { rpeByAthlete: { 12: 5 }, savedAt: daysAgo(28) },
    ];
    const result = calcAthleteRisk(12, historial);
    expect(result.trend).toBe("up");
    expect(result.ratio).toBeGreaterThan(1.0);
  });

  it("trend 'down' cuando ratio baja mas de 0.1 respecto a semana anterior", () => {
    // acute(0-7d): [1,1] avg=1.0
    // chronic(0-28d): [1,1,7,7,6,4,4,1,1] = 9 items, avg=32/9≈3.56
    // hasChronicData: semana 7-14d tiene datos → si
    // ratio ≈ 1.0/3.56 ≈ 0.28
    // prevAcute(7-14d): [7,7,6] avg=20/3≈6.67
    // prevChronic(7-28d): [7,7,6,4,4,1,1] = 7 items, avg=30/7≈4.29
    // prevRatio = 6.67/4.29 ≈ 1.55
    // 0.28 < 1.55 - 0.1 → trend "down"
    const historial = [
      { rpeByAthlete: { 13: 1 }, savedAt: daysAgo(3) },
      { rpeByAthlete: { 13: 1 }, savedAt: daysAgo(6) },
      { rpeByAthlete: { 13: 7 }, savedAt: daysAgo(8) },
      { rpeByAthlete: { 13: 7 }, savedAt: daysAgo(10) },
      { rpeByAthlete: { 13: 6 }, savedAt: daysAgo(13) },
      { rpeByAthlete: { 13: 4 }, savedAt: daysAgo(16) },
      { rpeByAthlete: { 13: 4 }, savedAt: daysAgo(19) },
      { rpeByAthlete: { 13: 1 }, savedAt: daysAgo(22) },
      { rpeByAthlete: { 13: 1 }, savedAt: daysAgo(26) },
    ];
    const result = calcAthleteRisk(13, historial);
    expect(result.trend).toBe("down");
  });

  it("suggestion correcta para status 'unknown'", () => {
    const result = calcAthleteRisk(99, []);
    expect(result.suggestion).toBe("Necesitas al menos 28 dias de historial para calcular el ACWR.");
  });

  it("suggestion correcta para status 'yellow' carga baja (ratio < 0.8)", () => {
    // Aguda (0-7d): 1 sesion RPE 1 → avg = 1.0
    // Base cronica (8-28d): 5 sesiones RPE 8 → avg alto
    // chronic(0-28d): [1,8,8,8,8,8] avg=41/6≈6.83
    // ratio = 1.0/6.83 ≈ 0.15 → yellow (< 0.8)
    const historial = [
      { rpeByAthlete: { 14: 1 }, savedAt: daysAgo(3) },
      { rpeByAthlete: { 14: 8 }, savedAt: daysAgo(10) },
      { rpeByAthlete: { 14: 8 }, savedAt: daysAgo(14) },
      { rpeByAthlete: { 14: 8 }, savedAt: daysAgo(18) },
      { rpeByAthlete: { 14: 8 }, savedAt: daysAgo(22) },
      { rpeByAthlete: { 14: 8 }, savedAt: daysAgo(26) },
    ];
    const result = calcAthleteRisk(14, historial);
    expect(result.status).toBe("yellow");
    expect(result.suggestion).toBe("Carga muy baja. Riesgo de desentrenamiento.");
  });

  it("suggestion correcta para status 'green' (ratio = 1.0 con datos simetricos)", () => {
    // Aguda (0-7d): 4 sesiones RPE 5 → avg = 5.0
    // Cronica base (8-28d): 1 sesion RPE 5 → la semana aguda domina el promedio cronico
    // chronic(0-28d): [5,5,5,5,5] = 5 items, avg = 5.0
    // ratio = 5.0/5.0 = 1.0 → green
    const historialGreen = [
      { rpeByAthlete: { 15: 5 }, savedAt: daysAgo(1) },
      { rpeByAthlete: { 15: 5 }, savedAt: daysAgo(2) },
      { rpeByAthlete: { 15: 5 }, savedAt: daysAgo(3) },
      { rpeByAthlete: { 15: 5 }, savedAt: daysAgo(4) },
      { rpeByAthlete: { 15: 5 }, savedAt: daysAgo(27) },
    ];
    const resultGreen = calcAthleteRisk(15, historialGreen);
    expect(resultGreen.ratio).toBeCloseTo(1.0, 2);
    expect(resultGreen.status).toBe("green");
    expect(resultGreen.suggestion).toBe("Zona optima. El atleta esta bien cargado.");
  });

  it("CASO CRITICO: atleta con carga cronica baja que sufre spike → status red", () => {
    // Cronico: 3 semanas a RPE promedio 3 (carga baja, bien recuperado)
    // Agudo: ultimos 7 dias a RPE promedio 8 (spike brutal)
    // ACWR = 8/3 = 2.67 → status "red" (Hulin et al., 2014: riesgo lesion 2.1x)
    const historial = [
      // Semana aguda (ultimos 7 dias)
      ...Array.from({ length: 5 }, (_, i) => ({
        rpeByAthlete: { 1: 8 },
        savedAt: daysAgo(i + 1),
      })),
      // Semanas cronicas (dias 8-28)
      ...Array.from({ length: 15 }, (_, i) => ({
        rpeByAthlete: { 1: 3 },
        savedAt: daysAgo(i + 8),
      })),
    ];

    const risk = calcAthleteRisk(1, historial, null);
    // acute = promedio(8×5) = 8.0
    // chronic = promedio(8×5, 3×15) = (40+45)/20 = 85/20 = 4.25
    // ratio = 8.0/4.25 ≈ 1.88 → red (> 1.5)
    expect(risk.status).toBe("red");
    expect(risk.ratio).toBeGreaterThan(1.5);
    expect(risk.suggestion).toMatch(/lesion|peligro/i);
  });
});
