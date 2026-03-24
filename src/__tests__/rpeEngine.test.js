/**
 * @file rpeEngine.test.js
 * @description Tests unitarios para el motor RPE de Salud Actual v2.0.
 *
 * Modelo: SaludActual = clamp(100 - RPE_avg_7d × 10, 0, 100)
 * v2.0: RPE per-athlete via rpeByAthlete, ventana 7d via savedAt ISO
 *
 * @author @QA (Sara-QA_Seguridad) + @Data (Mateo-Data_Engine)
 * @version 2.0.0
 */

import { describe, it, expect } from "vitest";
import { calcSaludActual, calcSaludPlantel, saludColor } from "../utils/rpeEngine";

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
    expect(result.riskLevel).toBe("precaucion");
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
    expect(r1.riskLevel).toBe("riesgo");

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
  it("retorna verde para salud >= 60", () => {
    expect(saludColor(60)).toBe("#1D9E75");
    expect(saludColor(100)).toBe("#1D9E75");
    expect(saludColor(75)).toBe("#1D9E75");
  });

  it("retorna ambar para salud 30-59", () => {
    expect(saludColor(30)).toBe("#EF9F27");
    expect(saludColor(59)).toBe("#EF9F27");
    expect(saludColor(45)).toBe("#EF9F27");
  });

  it("retorna rojo para salud < 30", () => {
    expect(saludColor(29)).toBe("#E24B4A");
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
