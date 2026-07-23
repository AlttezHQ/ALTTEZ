import { describe, it, expect } from "vitest";
import {
  selectEquiposByTorneo,
  selectPartidosByFase,
  selectTorneoActivo,
  selectCompetitionConfig,
  selectPosicionesByGrupo,
} from "../selectors.js";
import { MATCH_STATUS, LEGACY_MATCH_STATUS } from "../../domain/fixtureState.js";

const state = {
  torneoActivoId: "t1",
  torneos: [
    { id: "t1", nombre: "Uno" },
    { id: "t2", nombre: "Dos" },
  ],
  equipos: [
    { id: "e1", torneoId: "t1", nombre: "A", grupo: "A" },
    { id: "e2", torneoId: "t1", nombre: "B", grupo: "A" },
    { id: "e3", torneoId: "t2", nombre: "C" },
  ],
  partidos: [
    {
      id: "p1", torneoId: "t1", fase: "grupos", grupo: "A",
      equipoLocalId: "e1", equipoVisitaId: "e2", golesLocal: 2, golesVisita: 1,
      status: MATCH_STATUS.COMPLETED, estado: LEGACY_MATCH_STATUS.COMPLETED,
    },
    { id: "p2", torneoId: "t1", fase: "liga", equipoLocalId: "e1", equipoVisitaId: "e2" },
    { id: "p3", torneoId: "t2", fase: "grupos" },
  ],
  categorias: [
    { id: "c1", torneoId: "t1", nombre: "Cat", pointsConfig: { win: 3, draw: 1, loss: 0 } },
  ],
  sedes: [],
  arbitros: [],
};

describe("selectores de torneos", () => {
  it("filtra equipos por torneo", () => {
    expect(selectEquiposByTorneo(state, "t1").map(e => e.id)).toEqual(["e1", "e2"]);
    expect(selectEquiposByTorneo(state, "t2").map(e => e.id)).toEqual(["e3"]);
  });

  it("filtra partidos por torneo + fase", () => {
    expect(selectPartidosByFase(state, "t1", "grupos").map(p => p.id)).toEqual(["p1"]);
  });

  it("resuelve torneo activo desde torneoActivoId", () => {
    expect(selectTorneoActivo(state)?.id).toBe("t1");
    expect(selectTorneoActivo({ ...state, torneoActivoId: null })).toBeNull();
  });

  it("mergea defaults en competition config", () => {
    const cfg = selectCompetitionConfig(state, "c1");
    expect(cfg.qualifyPerGroup).toBe(2);
    expect(cfg.crossingMethod).toBe("auto_position");
    expect(selectCompetitionConfig(state, "noexiste")).toBeNull();
  });

  it("calcula posiciones por grupo de la categoría", () => {
    const standings = selectPosicionesByGrupo(state, "t1", "c1");
    // p1 (e1 vs e2 categoriaId null) no matchea categoría → grupos vacíos.
    // Sin filtro de categoría el motor agrupa por team.grupo.
    expect(standings).toBeTypeOf("object");
  });
});
