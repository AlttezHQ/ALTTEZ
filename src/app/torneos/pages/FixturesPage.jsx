import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart2, List, Trophy } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { generarFixture } from "../utils/fixturesEngine";
import { generateGroups, generateRoundRobinFixtures } from "../utils/competitionEngine";
import { LEGACY_MATCH_STATUS, MATCH_STATUS } from "../domain/fixtureState";
import { selectFixturesPageViewModel } from "../domain/fixtures/fixtureSelectors";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import AlttezLoader from "../components/shared/AlttezLoader";
import { showToast } from "../../../shared/ui/Toast";
import ConfirmModal from "../../../shared/ui/ConfirmModal";
import FixturesHeader from "../components/fixtures/FixturesHeader";
import FixtureFiltersBar from "../components/fixtures/FixtureFiltersBar";
import FixtureDateGroup from "../components/fixtures/FixtureDateGroup";
import FixtureStatsRail from "../components/fixtures/FixtureStatsRail";
import SchedulingPanel from "../components/fixtures/SchedulingPanel";
import StandingsPanel from "../components/fixtures/StandingsPanel";
import GenerateFixtureModal from "../components/fixtures/GenerateFixtureModal";
import ResultModal from "../components/fixtures/ResultModal";
import MatchDetailsModal from "../components/fixtures/MatchDetailsModal";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CARD = PALETTE.surface;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const HINT = PALETTE.textHint;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

const ESTADO_CFG = {
  programado: { label: "Programado", color: PALETTE.success, dot: PALETTE.success },
  propuesto: { label: "Propuesto", color: HINT, dot: HINT },
  aplazado: { label: "Aplazado", color: PALETTE.error ?? "#EF4444", dot: PALETTE.error ?? "#EF4444" },
  en_curso: { label: "En curso", color: "#F59E0B", dot: "#F59E0B" },
  finalizado: { label: "Finalizado", color: CU, dot: CU },
  pendiente: { label: "Pendiente", color: MUTED, dot: MUTED },
};

export default function FixturesPage({ torneoId, onGoTorneos }) {
  const torneoActivoId = torneoId;
  const allTorneos = useTorneosStore((state) => state.torneos);
  const allEquipos = useTorneosStore((state) => state.equipos);
  const allPartidos = useTorneosStore((state) => state.partidos);
  const allSedes = useTorneosStore((state) => state.sedes);
  const allArbitros = useTorneosStore((state) => state.arbitros);
  const allCategorias = useTorneosStore((state) => state.categorias);

  const setPartidos = useTorneosStore((state) => state.setPartidos);
  const registrarResultado = useTorneosStore((state) => state.registrarResultado);
  const registrarEventoCompeticion = useTorneosStore((state) => state.registrarEventoCompeticion);
  const autoSchedulePartidos = useTorneosStore((state) => state.autoSchedulePartidos);
  const agregarSede = useTorneosStore((state) => state.agregarSede);
  const eliminarSede = useTorneosStore((state) => state.eliminarSede);
  const agregarArbitro = useTorneosStore((state) => state.agregarArbitro);
  const eliminarArbitro = useTorneosStore((state) => state.eliminarArbitro);
  const actualizarTorneo = useTorneosStore((state) => state.actualizarTorneo);
  const actualizarCategoria = useTorneosStore((state) => state.actualizarCategoria);
  const actualizarEquiposBatch = useTorneosStore((state) => state.actualizarEquiposBatch);
  const getCompetitionConfig = useTorneosStore((state) => state.getCompetitionConfig);

  const [tab, setTab] = useState("fixture");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalPartido, setModalPartido] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [scheduleReport, setScheduleReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSede, setNewSede] = useState({ nombre: "" });
  const [newArbitro, setNewArbitro] = useState({ nombre: "" });
  const [schedRound, setSchedRound] = useState(1);
  const [schedFrom, setSchedFrom] = useState("");
  const [schedTo, setSchedTo] = useState("");
  const [expandedDates, setExpandedDates] = useState({});
  const [filterJornada, setFilterJornada] = useState("Todas las jornadas");
  const [filterQuery, setFilterQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos los estados");

  const viewModel = useMemo(
    () =>
      selectFixturesPageViewModel({
        torneoActivoId,
        selectedCategory,
        allTorneos,
        allEquipos,
        allPartidos,
        allSedes,
        allArbitros,
        allCategorias,
        scheduleReport,
        filters: {
          expandedDates,
          filterJornada,
          filterQuery,
          filterEstado,
        },
        stateConfig: ESTADO_CFG,
        colors: {
          primary: CU,
          border: BORDER,
        },
      }),
    [
      allArbitros,
      allCategorias,
      allEquipos,
      allPartidos,
      allSedes,
      allTorneos,
      expandedDates,
      filterEstado,
      filterJornada,
      filterQuery,
      scheduleReport,
      selectedCategory,
      torneoActivoId,
    ],
  );

  if (!torneoActivoId) {
    return (
      <ModuleEmptyState
        icon={List}
        title="Selecciona un torneo"
        subtitle="Abre un torneo para ver y gestionar sus fixtures."
        ctaLabel="Ver torneos"
        onCta={onGoTorneos}
      />
    );
  }

  const {
    categoryMatches,
    categoryTeams,
    activeCategory,
    activeCategoryConfig,
    tournament,
    venues,
    referees,
  } = viewModel.raw;

  const cfg = tournament?.schedulingConfig ?? {
    diasDisponibles: [6, 0],
    horaInicio: "10:00",
    horaFin: "22:00",
  };

  const handleConfirmGenerar = async (fechaInicio, fechaFin, fixtureOptions = {}) => {
    if (!fechaFin) {
      showToast("Debes especificar la fecha de fin", "error");
      return;
    }
    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      showToast("La fecha de fin no puede ser anterior al inicio", "error");
      return;
    }

    setShowGenModal(false);
    setIsGenerating(true);

    try {
      await actualizarTorneo(torneoActivoId, { fechaInicio, fechaFin });

      const baseCatConfig =
        activeCategoryConfig ?? tournament?.categorias?.find((item) => item.nombre === activeCategory);
      const catConfig = baseCatConfig ? { ...baseCatConfig, ...fixtureOptions } : null;

      if (baseCatConfig?.id && Object.keys(fixtureOptions).length > 0) {
        await actualizarCategoria(baseCatConfig.id, fixtureOptions);
      }

      const tempTorneo = { ...tournament, fechaInicio, fechaFin };
      if (catConfig) {
        tempTorneo.formato = catConfig.format;
        tempTorneo.fases = catConfig.fases;
        tempTorneo.vueltas = catConfig.groupLegs ?? catConfig.vueltas;
      }

      const others = allPartidos.filter((match) => {
        if (match.torneoId !== torneoActivoId) return false;
        if (catConfig?.id) return match.categoriaId !== catConfig.id;
        return (match.grupo || "General") !== activeCategory;
      });

      if (catConfig?.format === "grupos_playoffs") {
        const config = {
          ...(getCompetitionConfig(catConfig.id) ?? {}),
          torneoId: torneoActivoId,
          categoriaId: catConfig.id,
        };

        const groupsMap = generateGroups(categoryTeams, config);
        if (groupsMap.length === 0) {
          showToast("No se pudo generar grupos con la configuracion actual", "error");
          return;
        }

        const updatedTeams = [];
        groupsMap.forEach(({ label: group, teams }) => {
          teams.forEach((team) => {
            updatedTeams.push({ ...team, grupo: group });
          });
        });
        await actualizarEquiposBatch(torneoActivoId, updatedTeams);

        const newMatches = generateRoundRobinFixtures(groupsMap, config);
        const mappedMatches = newMatches.map((match) => ({
          ...match,
          torneoId: torneoActivoId,
          categoriaId: catConfig.id,
        }));

        await setPartidos(torneoActivoId, [...others, ...mappedMatches]);
        await registrarEventoCompeticion({
          tournamentId: torneoActivoId,
          eventType: "competition.fixture_generated",
          payload: {
            categoryId: catConfig.id,
            categoryName: activeCategory,
            format: catConfig.format,
            groupCount: groupsMap.length,
            groupLegs: config.groupLegs ?? 1,
            assignmentMethod: config.assignmentMethod ?? "auto_serpentina",
            qualifyPerGroup: config.qualifyPerGroup ?? 2,
            allowBestThirds: Boolean(config.allowBestThirds),
            bestThirdsCount: config.bestThirdsCount ?? 0,
            matchCount: mappedMatches.length,
            groups: groupsMap.map((group) => ({
              label: group.label,
              teamIds: group.teams.map((team) => team.id),
            })),
          },
        });
        showToast(`Grupos y fixture de ${activeCategory} generados con éxito`, "success");
      } else {
        const generatedMatches = generarFixture(tempTorneo, categoryTeams);
        const mappedMatches = generatedMatches.map((match) => ({
          ...match,
          torneoId: torneoActivoId,
          categoriaId: catConfig?.id ?? match.categoriaId ?? null,
          grupo: activeCategory,
          status: match.status ?? MATCH_STATUS.DRAFT,
        }));

        await setPartidos(torneoActivoId, [...others, ...mappedMatches]);
        await registrarEventoCompeticion({
          tournamentId: torneoActivoId,
          eventType: "competition.fixture_generated",
          payload: {
            categoryId: catConfig?.id ?? null,
            categoryName: activeCategory,
            format: catConfig?.format ?? tempTorneo.formato ?? "legacy",
            matchCount: mappedMatches.length,
          },
        });
        showToast("Fixture generado con éxito", "success");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerar = () => {
    if (categoryTeams.length < 2) {
      showToast("Necesitas al menos 2 equipos en esta categoría", "error");
      return;
    }

    const hasCompleted = categoryMatches.some(
      (match) =>
        match.estado === "finalizado" || match.status === MATCH_STATUS.COMPLETED,
    );
    if (hasCompleted) {
      showToast(
        "No se puede regenerar esta categoría porque ya tiene partidos finalizados. Contacta a soporte.",
        "error",
      );
      return;
    }

    if (categoryMatches.length > 0) {
      setShowReplaceConfirm(true);
      return;
    }

    setShowGenModal(true);
  };

  const handleSchedRound = async () => {
    if (!schedFrom) {
      showToast("Define la fecha de inicio", "error");
      return;
    }

    const roundMatches = categoryMatches.filter(
      (match) => match.ronda === Number(schedRound),
    );
    if (!roundMatches.length) {
      showToast("No hay partidos en esta fecha", "error");
      return;
    }

    const diasOk = cfg.diasDisponibles ?? [6, 0];
    const horaInicio = cfg.horaInicio || "10:00";
    const intervaloMin = 90;
    let currentDate = new Date(`${schedFrom}T${horaInicio}`);

    const scheduled = roundMatches.map((match, index) => {
      while (!diasOk.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(...horaInicio.split(":").map(Number), 0);
      }

      const tzOffset = currentDate.getTimezoneOffset() * 60000;
      const localISOTime = new Date(currentDate.getTime() - tzOffset)
        .toISOString()
        .slice(0, -1);

      const fechaHora = localISOTime;
      const sedeId = venues.length ? venues[index % venues.length].id : null;
      const arbitroId = referees.length ? referees[index % referees.length].id : null;

      currentDate = new Date(currentDate.getTime() + intervaloMin * 60000);

      return {
        ...match,
        fechaHora,
        sedeId,
        arbitroId,
        estado: LEGACY_MATCH_STATUS.SCHEDULED,
        status: MATCH_STATUS.SCHEDULED,
      };
    });

    const others = allPartidos.filter((match) => {
      if (match.torneoId !== torneoActivoId) return false;
      const sameCategory = activeCategoryConfig?.id
        ? match.categoriaId === activeCategoryConfig.id
        : (match.grupo || "General") === activeCategory;
      return !(sameCategory && match.ronda === Number(schedRound));
    });

    await setPartidos(torneoActivoId, [...others, ...scheduled]);
    await registrarEventoCompeticion({
      tournamentId: torneoActivoId,
      eventType: "competition.fixture_round_scheduled",
      payload: {
        categoryId: activeCategoryConfig?.id ?? null,
        categoryName: activeCategory,
        roundNumber: Number(schedRound),
        matchCount: scheduled.length,
        fromDate: schedFrom,
        toDate: schedTo || null,
        matchIds: scheduled.map((match) => match.id),
      },
    });

    showToast(`Fecha ${schedRound}: ${scheduled.length} partidos programados`, "success");
  };

  const handleGlobalSchedule = async () => {
    if (!allPartidos.some((match) => match.torneoId === torneoActivoId)) {
      showToast("Primero genera fixtures para una o mas categorias", "error");
      return;
    }
    if (!venues.length) {
      showToast("Agrega al menos una cancha o sede para programar el torneo", "error");
      return;
    }

    const report = await autoSchedulePartidos(torneoActivoId);
    setScheduleReport(report ?? null);
    showToast(
      `Programacion global lista: ${report?.scheduled || 0} de ${report?.total || 0} partidos asignados`,
      report?.scheduled ? "success" : "error",
    );
  };

  const selectedMatchDetails = selectedMatch
    ? {
        match: selectedMatch,
        local: allEquipos.find((team) => team.id === selectedMatch.equipoLocalId)?.nombre ?? "TBD",
        visita: allEquipos.find((team) => team.id === selectedMatch.equipoVisitaId)?.nombre ?? "TBD",
        venue: venues.find((venue) => venue.id === selectedMatch.sedeId)?.nombre ?? "",
        referee: referees.find((referee) => referee.id === selectedMatch.arbitroId)?.nombre ?? "",
        hour: selectedMatch.fechaHora
          ? new Date(selectedMatch.fechaHora).toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        state: ESTADO_CFG[selectedMatch.estado] ?? ESTADO_CFG.pendiente,
      }
    : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: FONT }}>
      <FixturesHeader
        categories={viewModel.categories}
        activeCategory={viewModel.activeCategory}
        activeTab={tab}
        onCategoryChange={setSelectedCategory}
        onTabChange={setTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <main>
          <AnimatePresence mode="wait">
            {tab === "fixture" && (
              <motion.div key="f" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {viewModel.fixtureTab.isEmpty ? (
                  <div style={{ background: CARD, borderRadius: 20, padding: 60, textAlign: "center", border: `1px solid ${BORDER}`, boxShadow: ELEVATION.card }}>
                    <Trophy size={48} color={PALETTE.bronceBorder} style={{ margin: "0 auto 20px" }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                      Sin fixture en {activeCategory}
                    </h3>
                    <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>
                      Genera los partidos base para esta categoría.
                    </p>
                    <button onClick={handleGenerar} style={{ background: CU, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", boxShadow: ELEVATION.card }}>
                      Generar Fixture
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      <FixtureFiltersBar
                        filters={viewModel.fixtureTab.filters}
                        onRoundChange={setFilterJornada}
                        onQueryChange={setFilterQuery}
                        onStateChange={setFilterEstado}
                        onRegenerate={handleGenerar}
                      />
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {viewModel.fixtureTab.groups.map((group) => (
                          <FixtureDateGroup
                            key={group.key}
                            group={group}
                            onToggle={(key) =>
                              setExpandedDates((current) => ({
                                ...current,
                                [key]: !(current[key] ?? false),
                              }))
                            }
                            onOpenMatch={setModalPartido}
                          />
                        ))}
                      </div>
                    </div>

                    <FixtureStatsRail
                      stats={viewModel.fixtureTab.stats}
                      upcomingMatches={viewModel.fixtureTab.upcomingMatches}
                      onGoScheduling={() => setTab("programacion")}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {tab === "programacion" && (
              <SchedulingPanel
                scheduling={viewModel.schedulingTab}
                venueDraft={newSede.nombre}
                refereeDraft={newArbitro.nombre}
                schedRound={schedRound}
                schedFrom={schedFrom}
                schedTo={schedTo}
                selectedMatch={
                  selectedMatchDetails
                    ? {
                        localName: selectedMatchDetails.local,
                        visitaName: selectedMatchDetails.visita,
                        hourLabel: selectedMatchDetails.hour,
                        venueLabel: selectedMatchDetails.venue,
                        refereeLabel: selectedMatchDetails.referee,
                        state: selectedMatchDetails.state,
                      }
                    : null
                }
                onVenueDraftChange={(value) => setNewSede({ nombre: value })}
                onRefereeDraftChange={(value) => setNewArbitro({ nombre: value })}
                onRoundChange={setSchedRound}
                onFromChange={setSchedFrom}
                onToChange={setSchedTo}
                onOpenMatch={setSelectedMatch}
                onCloseMatch={() => setSelectedMatch(null)}
                onAddVenue={() => {
                  if (newSede.nombre) {
                    agregarSede(torneoActivoId, newSede);
                    setNewSede({ nombre: "" });
                  }
                }}
                onRemoveVenue={eliminarSede}
                onAddReferee={() => {
                  if (newArbitro.nombre) {
                    agregarArbitro(torneoActivoId, newArbitro);
                    setNewArbitro({ nombre: "" });
                  }
                }}
                onRemoveReferee={eliminarArbitro}
                onScheduleRound={handleSchedRound}
                onScheduleGlobal={handleGlobalSchedule}
              />
            )}

            {tab === "tabla" && (
              <motion.div key="t" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <StandingsPanel rows={viewModel.standingsTab.rows} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {tab !== "programacion" && (
          <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <section style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <BarChart2 size={18} color={CU} />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Tabla rápida</h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {viewModel.standingsTab.rows.slice(0, 4).map((row, index) => (
                  <div key={row.equipoId} style={{ background: PALETTE.bg, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: TEXT }}>
                        {index + 1}. {row.nombre}
                      </div>
                      <div style={{ fontSize: 10, color: MUTED }}>
                        PJ {row.pj} · DG {row.dg > 0 ? `+${row.dg}` : row.dg}
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: CU }}>{row.pts}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setTab("tabla")} style={{ width: "100%", marginTop: 16, background: "none", border: `1.5px solid ${PALETTE.bronceBorder}`, color: CU, borderRadius: 8, padding: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>
                Ver tabla completa
              </button>
            </section>
          </aside>
        )}
      </div>

      <AnimatePresence>
        {modalPartido && (
          <ResultModal
            partido={modalPartido}
            equipos={allEquipos}
            onSave={async (gl, gv, eventos) => {
              await registrarResultado(modalPartido.id, gl, gv, eventos);
              setModalPartido(null);
            }}
            onClose={() => setModalPartido(null)}
          />
        )}
        {showGenModal && (
          <GenerateFixtureModal
            torneo={tournament}
            category={activeCategory}
            categoryConfig={activeCategoryConfig}
            equipos={categoryTeams}
            existingMatches={categoryMatches.length}
            onConfirm={handleConfirmGenerar}
            onClose={() => setShowGenModal(false)}
          />
        )}
        {showReplaceConfirm && (
          <ConfirmModal
            title="Regenerar fixture"
            message={`Se reemplazarán ${categoryMatches.length} partidos existentes de ${activeCategory}. Esta acción solo está permitida porque no hay partidos finalizados.`}
            confirmLabel="Continuar"
            cancelLabel="Cancelar"
            accentColor={CU}
            onCancel={() => setShowReplaceConfirm(false)}
            onConfirm={() => {
              setShowReplaceConfirm(false);
              setShowGenModal(true);
            }}
          />
        )}
        {selectedMatchDetails && (
          <MatchDetailsModal
            match={selectedMatchDetails.match}
            local={selectedMatchDetails.local}
            visita={selectedMatchDetails.visita}
            venue={selectedMatchDetails.venue}
            referee={selectedMatchDetails.referee}
            hour={selectedMatchDetails.hour}
            state={selectedMatchDetails.state}
            onClose={() => setSelectedMatch(null)}
          />
        )}
        {isGenerating && <AlttezLoader fullScreen text="Generando Fixture..." />}
      </AnimatePresence>
    </motion.div>
  );
}
