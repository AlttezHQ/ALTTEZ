/**
 * competitionEngine.test.js
 * Tests unitarios para el motor de dominio de torneos "Grupos + Fase Final".
 * Corre con: npm test src/tests/torneos/competitionEngine.test.js
 */

import { describe, it, expect } from "vitest";
import {
  generateGroups,
  generateRoundRobinFixtures,
  calculateGroupStandings,
  applyTiebreakers,
  getQualifiedTeams,
  generateKnockoutBracket,
  advanceKnockoutWinner,
  canGenerateFixture,
  canCloseGroupStage,
  canGenerateKnockout,
  DEFAULT_POINTS_CONFIG,
  DEFAULT_TIEBREAKERS,
} from "../../app/torneos/utils/competitionEngine.js";

// ── Helpers de test ──────────────────────────────────────────────────────────

const makeTeams = (n, prefix = "Equipo") =>
  Array.from({ length: n }, (_, i) => ({
    id:     `team-${i + 1}`,
    nombre: `${prefix} ${i + 1}`,
    grupo:  null,
  }));

const makeMatch = (local, visita, gl, gv, grupo = "A") => ({
  id:             `m-${local}-${visita}`,
  torneoId:       "t1",
  fase:           "grupos",
  grupo,
  equipoLocalId:  local,
  equipoVisitaId: visita,
  golesLocal:     gl,
  golesVisita:    gv,
  estado:         gl != null ? "finalizado" : "pendiente",
});

// ── 1. generateGroups ────────────────────────────────────────────────────────

describe("generateGroups()", () => {
  it("distribuye 8 equipos en 2 grupos de 4 (serpentina)", () => {
    const teams  = makeTeams(8);
    const groups = generateGroups(teams, { groupsCount: 2, assignmentMethod: "auto_serpentina" });

    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe("A");
    expect(groups[1].label).toBe("B");
    expect(groups[0].teams).toHaveLength(4);
    expect(groups[1].teams).toHaveLength(4);
    // Todos los equipos aparecen exactamente una vez
    const allIds = [...groups[0].teams, ...groups[1].teams].map(t => t.id);
    expect(new Set(allIds).size).toBe(8);
  });

  it("distribuye 12 equipos en 3 grupos de 4", () => {
    const teams  = makeTeams(12);
    const groups = generateGroups(teams, { groupsCount: 3 });

    expect(groups).toHaveLength(3);
    groups.forEach(g => expect(g.teams).toHaveLength(4));
  });

  it("maneja grupos desbalanceados (10 equipos / 3 grupos → 4+4+2 o similar)", () => {
    const teams  = makeTeams(10);
    const groups = generateGroups(teams, { groupsCount: 3 });

    const total = groups.reduce((s, g) => s + g.teams.length, 0);
    expect(total).toBe(10);
    groups.forEach(g => expect(g.teams.length).toBeGreaterThanOrEqual(2));
  });

  it("devuelve grupos vacíos en modo manual", () => {
    const teams  = makeTeams(8);
    const groups = generateGroups(teams, { groupsCount: 2, assignmentMethod: "manual" });

    expect(groups).toHaveLength(2);
    groups.forEach(g => expect(g.teams).toHaveLength(0));
  });

  it("rechaza cuando hay menos equipos que grupos", () => {
    const result = generateGroups(makeTeams(1), { groupsCount: 3 });
    expect(result).toHaveLength(0);
  });
});

// ── 2. generateRoundRobinFixtures ────────────────────────────────────────────

describe("generateRoundRobinFixtures()", () => {
  it("genera n*(n-1)/2 partidos con n par en una sola vuelta", () => {
    const groups = generateGroups(makeTeams(8), { groupsCount: 2 });
    const matches = generateRoundRobinFixtures(groups, { torneoId: "t1", groupLegs: 1 });

    // 2 grupos de 4: 6 + 6 = 12 partidos
    expect(matches).toHaveLength(12);
  });

  it("duplica los partidos con ida y vuelta", () => {
    const groups  = generateGroups(makeTeams(8), { groupsCount: 2 });
    const single  = generateRoundRobinFixtures(groups, { torneoId: "t1", groupLegs: 1 });
    const double_ = generateRoundRobinFixtures(groups, { torneoId: "t1", groupLegs: 2 });

    expect(double_.length).toBe(single.length * 2);
  });

  it("soporta número impar de equipos (BYE automático)", () => {
    const groups  = generateGroups(makeTeams(5), { groupsCount: 1 });
    const matches = generateRoundRobinFixtures(groups, { torneoId: "t1", groupLegs: 1 });

    // 5 equipos → 6 teams con BYE → 5*(5-1)/2 = 10 partidos válidos
    expect(matches).toHaveLength(10);
    matches.forEach(m => {
      expect(m.equipoLocalId).not.toBe("BYE");
      expect(m.equipoVisitaId).not.toBe("BYE");
    });
  });

  it("todos los partidos tienen fase=grupos y torneoId correcto", () => {
    const groups  = generateGroups(makeTeams(4), { groupsCount: 1 });
    const matches = generateRoundRobinFixtures(groups, { torneoId: "torneo-x", groupLegs: 1 });

    matches.forEach(m => {
      expect(m.fase).toBe("grupos");
      expect(m.torneoId).toBe("torneo-x");
      expect(m.estado).toBe("pendiente");
    });
  });

  it("12 equipos en 3 grupos de 4: 18 partidos (3 × 6)", () => {
    const groups  = generateGroups(makeTeams(12), { groupsCount: 3 });
    const matches = generateRoundRobinFixtures(groups, { torneoId: "t1", groupLegs: 1 });

    expect(matches).toHaveLength(18);
  });
});

// ── 3. calculateGroupStandings ───────────────────────────────────────────────

describe("calculateGroupStandings()", () => {
  it("calcula puntos correctamente (victoria=3, empate=1, derrota=0)", () => {
    const teams = [
      { id: "t1", nombre: "Tigres",  grupo: "A" },
      { id: "t2", nombre: "Leones",  grupo: "A" },
      { id: "t3", nombre: "Águilas", grupo: "A" },
    ];
    const matches = [
      makeMatch("t1","t2",2,0,"A"), // t1 gana
      makeMatch("t1","t3",1,1,"A"), // empate
      makeMatch("t2","t3",0,1,"A"), // t3 gana
    ];
    const standings = calculateGroupStandings(matches, teams, DEFAULT_POINTS_CONFIG);
    const grupoA = standings["A"];

    const t1 = grupoA.find(r => r.equipoId === "t1");
    const t2 = grupoA.find(r => r.equipoId === "t2");
    const t3 = grupoA.find(r => r.equipoId === "t3");

    expect(t1.pts).toBe(4); // 3 + 1
    expect(t1.pj).toBe(2);
    expect(t1.pg).toBe(1);
    expect(t1.pe).toBe(1);

    expect(t2.pts).toBe(0);
    expect(t2.pp).toBe(2);

    expect(t3.pts).toBe(4); // 3 + 1
    expect(t3.pg).toBe(1);
  });

  it("respeta puntos configurables (victoria=2, empate=1, derrota=0)", () => {
    const teams = [
      { id: "a", nombre: "A", grupo: "A" },
      { id: "b", nombre: "B", grupo: "A" },
    ];
    const matches = [makeMatch("a","b",1,0,"A")];
    const standings = calculateGroupStandings(matches, teams, { win: 2, draw: 1, loss: 0 });
    const grupoA = standings["A"];

    expect(grupoA.find(r => r.equipoId === "a").pts).toBe(2);
    expect(grupoA.find(r => r.equipoId === "b").pts).toBe(0);
  });
});

// ── 4. applyTiebreakers ──────────────────────────────────────────────────────

describe("applyTiebreakers()", () => {
  it("ordena por puntos primero", () => {
    const teams = [
      { equipoId: "a", pts: 3, dg: 0, gf: 1 },
      { equipoId: "b", pts: 6, dg: 0, gf: 1 },
      { equipoId: "c", pts: 1, dg: 0, gf: 1 },
    ];
    const sorted = applyTiebreakers(teams, DEFAULT_TIEBREAKERS);
    expect(sorted[0].equipoId).toBe("b");
    expect(sorted[1].equipoId).toBe("a");
    expect(sorted[2].equipoId).toBe("c");
  });

  it("desempate por diferencia de goles cuando puntos iguales", () => {
    const teams = [
      { equipoId: "a", pts: 3, dg:  2, gf: 3 },
      { equipoId: "b", pts: 3, dg: -1, gf: 1 },
    ];
    const sorted = applyTiebreakers(teams, DEFAULT_TIEBREAKERS);
    expect(sorted[0].equipoId).toBe("a");
  });

  it("desempate por goles a favor cuando puntos y DG iguales", () => {
    const teams = [
      { equipoId: "a", pts: 3, dg: 1, gf: 3 },
      { equipoId: "b", pts: 3, dg: 1, gf: 5 },
    ];
    const sorted = applyTiebreakers(teams, DEFAULT_TIEBREAKERS);
    expect(sorted[0].equipoId).toBe("b");
  });
});

// ── 5. getQualifiedTeams ─────────────────────────────────────────────────────

describe("getQualifiedTeams()", () => {
  const standings = {
    A: [
      { equipoId:"a1", nombre:"A1", grupo:"A", pts:9,  dg:5,  gf:8 },
      { equipoId:"a2", nombre:"A2", grupo:"A", pts:6,  dg:2,  gf:5 },
      { equipoId:"a3", nombre:"A3", grupo:"A", pts:3,  dg:-1, gf:3 },
      { equipoId:"a4", nombre:"A4", grupo:"A", pts:0,  dg:-6, gf:1 },
    ],
    B: [
      { equipoId:"b1", nombre:"B1", grupo:"B", pts:9,  dg:4,  gf:7 },
      { equipoId:"b2", nombre:"B2", grupo:"B", pts:6,  dg:1,  gf:4 },
      { equipoId:"b3", nombre:"B3", grupo:"B", pts:3,  dg:-2, gf:2 },
      { equipoId:"b4", nombre:"B4", grupo:"B", pts:0,  dg:-3, gf:1 },
    ],
  };

  it("devuelve top 2 de cada grupo con qualifyPerGroup=2", () => {
    const qualified = getQualifiedTeams(standings, { qualifyPerGroup: 2, allowBestThirds: false });
    expect(qualified).toHaveLength(4);
    const ids = qualified.map(q => q.equipoId);
    expect(ids).toContain("a1");
    expect(ids).toContain("a2");
    expect(ids).toContain("b1");
    expect(ids).toContain("b2");
  });

  it("incluye mejores terceros cuando allowBestThirds=true", () => {
    const qualified = getQualifiedTeams(standings, {
      qualifyPerGroup: 2,
      allowBestThirds: true,
      bestThirdsCount: 1,
    });
    expect(qualified).toHaveLength(5);
    // El mejor tercero entre a3 (pts=3,dg=-1) y b3 (pts=3,dg=-2) → a3
    const thirdIds = qualified.filter(q => q.qualifyType?.startsWith("3")).map(q => q.equipoId);
    expect(thirdIds).toContain("a3");
  });
});

// ── 6. generateKnockoutBracket ───────────────────────────────────────────────

describe("generateKnockoutBracket()", () => {
  const make4Qualified = () => [
    { equipoId:"q1", nombre:"Q1", group:"A", position:1, pts:9, dg:5, gf:8 },
    { equipoId:"q2", nombre:"Q2", group:"B", position:1, pts:8, dg:3, gf:7 },
    { equipoId:"q3", nombre:"Q3", group:"A", position:2, pts:6, dg:1, gf:5 },
    { equipoId:"q4", nombre:"Q4", group:"B", position:2, pts:5, dg:0, gf:4 },
  ];

  it("genera bracket de semifinal + final para 4 clasificados", () => {
    const matches = generateKnockoutBracket(make4Qualified(), { torneoId: "t1" });
    const semis = matches.filter(m => m.fase === "semis");
    const final = matches.filter(m => m.fase === "final");

    expect(semis).toHaveLength(2);
    expect(final).toHaveLength(1);
  });

  it("genera bracket de cuartos + semis + final para 8 clasificados", () => {
    const q8 = Array.from({ length: 8 }, (_, i) => ({
      equipoId: `q${i+1}`,
      nombre:   `Q${i+1}`,
      group:    i < 4 ? "A" : "B",
      position: (i % 4) + 1,
      pts:      9 - i, dg: 5 - i, gf: 8 - i,
    }));
    const matches = generateKnockoutBracket(q8, { torneoId: "t1" });
    const cuartos = matches.filter(m => m.fase === "cuartos");
    const semis   = matches.filter(m => m.fase === "semis");
    const final   = matches.filter(m => m.fase === "final");

    expect(cuartos).toHaveLength(4);
    expect(semis).toHaveLength(2);
    expect(final).toHaveLength(1);
  });

  it("todos los partidos de cuartos tienen equipos asignados (no TBD)", () => {
    const q8 = Array.from({ length: 8 }, (_, i) => ({
      equipoId: `q${i+1}`, nombre:`Q${i+1}`, group:"A", position:1, pts:5, dg:0, gf:2,
    }));
    const matches = generateKnockoutBracket(q8, { torneoId: "t1" });
    const cuartos = matches.filter(m => m.fase === "cuartos");
    cuartos.forEach(m => {
      expect(m.equipoLocalId).not.toBeNull();
      expect(m.equipoVisitaId).not.toBeNull();
    });
  });

  it("genera con ida y vuelta (playoffLegs=2, finalLegs=1)", () => {
    const matches = generateKnockoutBracket(make4Qualified(), {
      torneoId:    "t1",
      playoffLegs: 2,
      finalLegs:   1,
    });
    const semis = matches.filter(m => m.fase === "semis");
    // 2 partidos × 2 patas = 4 rows
    expect(semis).toHaveLength(4);
  });
});

// ── 7. advanceKnockoutWinner ─────────────────────────────────────────────────

describe("advanceKnockoutWinner()", () => {
  it("coloca el ganador de cuartos en las semis correctas", () => {
    const q4 = Array.from({ length: 4 }, (_, i) => ({
      equipoId: `q${i+1}`, nombre:`Q${i+1}`, group:"A", position:1, pts:5, dg:0, gf:2,
    }));
    const matches   = generateKnockoutBracket(q4, { torneoId: "t1" });
    const semiMatch = matches.find(m => m.fase === "semis");

    // Simular resultado del primer partido de semis
    const semiIdx   = matches.indexOf(semiMatch);
    const resultMatch = { ...semiMatch, golesLocal: 2, golesVisita: 0, estado: "finalizado" };
    const updatedMatches = [
      ...matches.slice(0, semiIdx),
      resultMatch,
      ...matches.slice(semiIdx + 1),
    ];

    const winnerId  = semiMatch.equipoLocalId;
    const advanced  = advanceKnockoutWinner(updatedMatches, semiMatch.id, winnerId);
    const finalMatch = advanced.find(m => m.fase === "final");

    expect(
      finalMatch.equipoLocalId === winnerId || finalMatch.equipoVisitaId === winnerId
    ).toBe(true);
  });
});

// ── 8. Validaciones (guards) ─────────────────────────────────────────────────

describe("canGenerateFixture()", () => {
  it("rechaza con menos de 2 equipos", () => {
    const { ok } = canGenerateFixture(makeTeams(1), { groupsCount: 1 });
    expect(ok).toBe(false);
  });

  it("rechaza cuando hay menos equipos que grupos", () => {
    const { ok } = canGenerateFixture(makeTeams(3), { groupsCount: 4 });
    expect(ok).toBe(false);
  });

  it("aprueba con configuración válida", () => {
    const { ok } = canGenerateFixture(makeTeams(8), { groupsCount: 2 });
    expect(ok).toBe(true);
  });
});

describe("canCloseGroupStage()", () => {
  it("rechaza si hay partidos pendientes", () => {
    const matches = [makeMatch("a","b",null,null,"A")];
    const { ok, pending } = canCloseGroupStage(matches);
    expect(ok).toBe(false);
    expect(pending).toBe(1);
  });

  it("aprueba si todos los partidos están finalizados", () => {
    const matches = [makeMatch("a","b",1,0,"A"), makeMatch("b","c",2,2,"A")];
    const { ok } = canCloseGroupStage(matches);
    expect(ok).toBe(true);
  });
});

describe("canGenerateKnockout()", () => {
  it("rechaza si hay partidos de grupos pendientes", () => {
    const matches    = [makeMatch("a","b",null,null,"A")];
    const qualified  = [{ equipoId:"a" }, { equipoId:"b" }];
    const { ok }     = canGenerateKnockout(matches, qualified);
    expect(ok).toBe(false);
  });

  it("rechaza sin clasificados suficientes", () => {
    const matches   = [makeMatch("a","b",1,0,"A")];
    const { ok }    = canGenerateKnockout(matches, []);
    expect(ok).toBe(false);
  });

  it("aprueba con grupos cerrados y clasificados suficientes", () => {
    const matches   = [makeMatch("a","b",1,0,"A")];
    const qualified = [{ equipoId:"a" }, { equipoId:"b" }];
    const { ok }    = canGenerateKnockout(matches, qualified);
    expect(ok).toBe(true);
  });
});
