import { describe, it, expect } from "vitest";
import { calcularPosiciones, distribuirEnGrupos } from "../fixturesEngine.js";
import { MATCH_STATUS, LEGACY_MATCH_STATUS } from "../../domain/fixtureState.js";

// Caracterización del comportamiento ACTUAL de calcularPosiciones.
// Objetivo: congelar resultados antes de mover lógica fuera del store (Fase 1).

const equipos = [
  { id: "t1", nombre: "Alfa", grupo: null },
  { id: "t2", nombre: "Beta", grupo: null },
  { id: "t3", nombre: "Gamma", grupo: null },
];

function partido(over) {
  return {
    id: over.id ?? "m",
    equipoLocalId: over.local,
    equipoVisitaId: over.visita,
    golesLocal: over.gl,
    golesVisita: over.gv,
    status: over.status ?? MATCH_STATUS.COMPLETED,
    estado: over.estado ?? LEGACY_MATCH_STATUS.COMPLETED,
  };
}

describe("calcularPosiciones", () => {
  it("acumula pts/dg/gf y ordena pts→dg→gf", () => {
    const partidos = [
      partido({ id: "a", local: "t1", visita: "t2", gl: 2, gv: 0 }), // Alfa gana
      partido({ id: "b", local: "t2", visita: "t3", gl: 1, gv: 1 }), // empate
      partido({ id: "c", local: "t1", visita: "t3", gl: 3, gv: 1 }), // Alfa gana
    ];
    const tabla = calcularPosiciones(partidos, equipos);

    expect(tabla.map(r => r.equipoId)).toEqual(["t1", "t3", "t2"]);

    const alfa = tabla.find(r => r.equipoId === "t1");
    expect(alfa).toMatchObject({ pj: 2, pg: 2, pe: 0, pp: 0, gf: 5, gc: 1, dg: 4, pts: 6 });

    const beta = tabla.find(r => r.equipoId === "t2");
    expect(beta).toMatchObject({ pj: 2, pg: 0, pe: 1, pp: 1, gf: 1, gc: 3, dg: -2, pts: 1 });

    const gamma = tabla.find(r => r.equipoId === "t3");
    expect(gamma).toMatchObject({ pj: 2, pg: 0, pe: 1, pp: 1, gf: 2, gc: 4, dg: -2, pts: 1 });
  });

  it("ignora partidos no finalizados o sin marcador", () => {
    const partidos = [
      partido({ id: "a", local: "t1", visita: "t2", gl: 2, gv: 0, status: MATCH_STATUS.SCHEDULED, estado: LEGACY_MATCH_STATUS.SCHEDULED }),
      partido({ id: "b", local: "t1", visita: "t3", gl: null, gv: null }),
    ];
    const tabla = calcularPosiciones(partidos, equipos);
    tabla.forEach(r => expect(r.pj).toBe(0));
  });
});

describe("distribuirEnGrupos", () => {
  it("reparte en serpentina entre N grupos", () => {
    const eqs = ["a", "b", "c", "d", "e", "f"].map(id => ({ id, nombre: id }));
    const grupos = distribuirEnGrupos(eqs, 2);
    expect(grupos).toHaveLength(2);
    // serpentina: idx0→g0, idx1→g1, idx2→g1, idx3→g0, idx4→g0, idx5→g1
    expect(grupos[0].map(e => e.id)).toEqual(["a", "d", "e"]);
    expect(grupos[1].map(e => e.id)).toEqual(["b", "c", "f"]);
  });
});
