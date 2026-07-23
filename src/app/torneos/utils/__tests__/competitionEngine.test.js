import { describe, it, expect } from "vitest";
import {
  calculateGroupStandings,
  applyTiebreakers,
  getQualifiedTeams,
  DEFAULT_TIEBREAKERS,
} from "../competitionEngine.js";
import { MATCH_STATUS, LEGACY_MATCH_STATUS } from "../../domain/fixtureState.js";

// Caracterización del motor de competencia (grupos + fase final).
// Congela el comportamiento ACTUAL para detectar regresiones en Fase 1.

const teams = [
  { id: "a1", nombre: "A1", grupo: "A" },
  { id: "a2", nombre: "A2", grupo: "A" },
  { id: "a3", nombre: "A3", grupo: "A" },
];

function grupoMatch(local, visita, gl, gv) {
  return {
    id: `${local}-${visita}`,
    fase: "grupos",
    grupo: "A",
    equipoLocalId: local,
    equipoVisitaId: visita,
    golesLocal: gl,
    golesVisita: gv,
    status: MATCH_STATUS.COMPLETED,
    estado: LEGACY_MATCH_STATUS.COMPLETED,
  };
}

const matches = [
  grupoMatch("a1", "a2", 2, 0),
  grupoMatch("a1", "a3", 1, 0),
  grupoMatch("a2", "a3", 3, 0),
];

describe("calculateGroupStandings", () => {
  it("agrupa por grupo y acumula stats de partidos finalizados", () => {
    const standings = calculateGroupStandings(matches, teams);
    expect(Object.keys(standings)).toEqual(["A"]);

    const byId = Object.fromEntries(standings.A.map(r => [r.equipoId, r]));
    expect(byId.a1).toMatchObject({ pj: 2, pg: 2, pp: 0, gf: 3, gc: 0, dg: 3, pts: 6 });
    expect(byId.a2).toMatchObject({ pj: 2, pg: 1, pp: 1, gf: 3, gc: 2, dg: 1, pts: 3 });
    expect(byId.a3).toMatchObject({ pj: 2, pg: 0, pp: 2, gf: 0, gc: 4, dg: -4, pts: 0 });
  });

  it("respeta pointsConfig custom (win=2)", () => {
    const standings = calculateGroupStandings(matches, teams, { win: 2, draw: 1, loss: 0 });
    const a1 = standings.A.find(r => r.equipoId === "a1");
    expect(a1.pts).toBe(4); // 2 victorias * 2
  });
});

describe("applyTiebreakers", () => {
  it("ordena por puntos y luego diferencia de gol", () => {
    const rows = [
      { equipoId: "x", pts: 3, dg: 2, gf: 5 },
      { equipoId: "y", pts: 3, dg: 5, gf: 6 },
      { equipoId: "z", pts: 6, dg: 1, gf: 2 },
    ];
    const ordered = applyTiebreakers(rows, DEFAULT_TIEBREAKERS, []);
    expect(ordered.map(r => r.equipoId)).toEqual(["z", "y", "x"]);
  });
});

describe("getQualifiedTeams", () => {
  it("clasifica los primeros N por grupo con etiqueta de posición", () => {
    const standings = calculateGroupStandings(matches, teams);
    const qualified = getQualifiedTeams(standings, { qualifyPerGroup: 2 }, matches);
    expect(qualified.map(q => q.equipoId)).toEqual(["a1", "a2"]);
    expect(qualified.map(q => q.qualifyType)).toEqual(["1A", "2A"]);
  });

  it("suma mejores terceros cuando allowBestThirds", () => {
    const standings = calculateGroupStandings(matches, teams);
    const qualified = getQualifiedTeams(
      standings,
      { qualifyPerGroup: 1, allowBestThirds: true, bestThirdsCount: 1 },
      matches
    );
    // 1 directo (a1) + 1 mejor tercero. a3 es position 3 → entra como 3A.
    expect(qualified.map(q => q.equipoId)).toContain("a1");
    expect(qualified.some(q => q.qualifyType === "3A")).toBe(true);
  });
});
