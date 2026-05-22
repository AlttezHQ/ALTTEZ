import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, BarChart2, Calendar, Users, Info, Phone, Gift, Eye, LayoutGrid } from "lucide-react";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import { useState, useMemo, useEffect } from "react";
import { calculateGroupStandings, applyTiebreakers, DEFAULT_POINTS_CONFIG, DEFAULT_TIEBREAKERS } from "../utils/competitionEngine";
import { getTorneoPublico } from "../services/torneosService";

const CU = PALETTE.bronce;
const CU_DIM = PALETTE.bronce + "15";
const BG = PALETTE.bg;
const CARD = PALETTE.surface;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

function BracketNode({ match, equipos }) {
  if (!match) return <div style={{ width: 200, height: 60 }} />;
  const local = equipos.find(e => e.id === match.equipoLocalId);
  const visita = equipos.find(e => e.id === match.equipoVisitaId);
  const isDone = match.estado === "finalizado";

  const renderTeam = (team, isLocal) => {
    const isWinner = isDone && ((isLocal && match.golesLocal > match.golesVisita) || (!isLocal && match.golesVisita > match.golesLocal));
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderBottom: isLocal ? `1px solid ${BORDER}` : "none", background: isWinner ? "#FDFDFB" : "transparent" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: team?.color || BORDER }} />
          <span style={{ fontSize: 12, fontWeight: isWinner ? 800 : 600, color: team ? TEXT : MUTED }}>{team?.nombre || "TBD"}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: isWinner ? CU : TEXT }}>{isDone ? (isLocal ? match.golesLocal : match.golesVisita) : "-"}</span>
      </div>
    );
  };

  return (
    <div style={{ width: 200, background: CARD, borderRadius: 10, border: `1px solid ${isDone ? `${CU}40` : BORDER}`, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", overflow: "hidden" }}>
      {renderTeam(local, true)}
      {renderTeam(visita, false)}
    </div>
  );
}

export default function PublicTorneoPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "fixture";

  const [loading, setLoading] = useState(true);
  const [torneo, setTorneo] = useState(null);
  const [torneoEquipos, setTorneoEquipos] = useState([]);
  const [torneoPartidos, setTorneoPartidos] = useState([]);
  const [torneoCats, setTorneoCats] = useState([]);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeCatId, setActiveCatId] = useState(null);

  // Cargar datos desde vistas publicas estrictas; nunca desde tablas completas.
  useEffect(() => {
    async function loadPublicData() {
      try {
        const data = await getTorneoPublico(slug);
        if (!data?.torneo) {
          setLoading(false);
          return;
        }

        setTorneo(data.torneo);
        setTorneoEquipos(data.equipos ?? []);
        setTorneoPartidos(data.partidos ?? []);
        setTorneoCats(data.categorias ?? []);
      } catch (err) {
        console.error("Error loading public tournament data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPublicData();
  }, [slug]);
  // Si hay cambios en defaultTab por URL, reaccionar
  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab"));
    }
  }, [searchParams]);

  const currentCatId = activeCatId || (torneoCats.length > 0 ? torneoCats[0].id : null);
  const currentCat = torneoCats.find(c => c.id === currentCatId);
  const isGroups = currentCat?.format === "grupos_playoffs" || torneo?.formato === "grupos_playoffs";

  // Filter Data
  const catEquipos = useMemo(() => {
    return torneoEquipos.filter(e => !currentCatId || e.categoriaId === currentCatId || e.grupo === currentCat?.nombre);
  }, [torneoEquipos, currentCatId, currentCat]);

  const catPartidos = useMemo(() => {
    return torneoPartidos.filter(p => !currentCatId || p.categoriaId === currentCatId);
  }, [torneoPartidos, currentCatId]);

  // Standings Logic
  const standings = useMemo(() => {
    if (isGroups) {
      const config = { tiebreakers: currentCat?.tiebreakers || DEFAULT_TIEBREAKERS, pointsConfig: currentCat?.pointsConfig || DEFAULT_POINTS_CONFIG };
      const raw = calculateGroupStandings(catPartidos, catEquipos, config.pointsConfig);
      const sorted = {};
      Object.entries(raw).forEach(([grp, rows]) => { sorted[grp] = applyTiebreakers(rows, config.tiebreakers, catPartidos); });
      return { type: "groups", data: sorted };
    } else {
      const raw = calculateGroupStandings(catPartidos, catEquipos, DEFAULT_POINTS_CONFIG);
      const sorted = applyTiebreakers(raw["Único"] || [], DEFAULT_TIEBREAKERS, catPartidos);
      return { type: "single", data: sorted };
    }
  }, [catPartidos, catEquipos, isGroups, currentCat]);

  // Knockout Bracket Logic
  const knockoutMatches = useMemo(() => {
    return catPartidos.filter(p => p.source === "knockout");
  }, [catPartidos]);

  const hasBracket = knockoutMatches.length > 0 || currentCat?.format === "eliminacion";
  const matchPhases = { octavos: [], cuartos: [], semis: [], final: [] };
  knockoutMatches.forEach(p => { if (matchPhases[p.fase]) matchPhases[p.fase].push(p); });
  const activePhases = Object.keys(matchPhases).filter(k => matchPhases[k].length > 0);

  const tabs = [
    { id: "fixture", label: "Fixture", icon: Calendar },
    { id: "tabla", label: "Posiciones", icon: BarChart2 },
  ];
  if (hasBracket) tabs.push({ id: "bracket", label: "Fase Final", icon: Trophy });
  tabs.push({ id: "equipos", label: "Equipos", icon: Users });
  tabs.push({ id: "info", label: "Información", icon: Info });

  // Ensure active tab is valid
  useEffect(() => {
    if (activeTab === "bracket" && !hasBracket) {
      setActiveTab("fixture");
    }
  }, [activeTab, hasBracket]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: BG, fontFamily: FONT, color: MUTED }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${BORDER}`, borderTopColor: CU, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Cargando Torneo</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!torneo) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: BG, fontFamily: FONT, color: TEXT, flexDirection: "column", gap: 16 }}>
        <Trophy size={48} color={MUTED} />
        <h2>Torneo no encontrado</h2>
        <p style={{ color: MUTED }}>El torneo que buscas no existe o aún no ha sido publicado.</p>
        <Link to="/" style={{ color: CU, textDecoration: "none", fontWeight: 700 }}>Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: FONT, color: TEXT }}>
      {/* Portada y Perfil */}
      <div style={{ position: "relative", height: 280, background: torneo.portada ? `url(${torneo.portada}) center/cover` : `linear-gradient(135deg, ${CU}, #8B5E34)` }}>
        <div style={{ position: "absolute", bottom: -50, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${CARD}`, background: CARD, boxShadow: ELEVATION.card, overflow: "hidden" }}>
            {torneo.perfil ? <img src={torneo.perfil} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}><Trophy size={40} color={CU} /></div>}
          </div>
        </div>
      </div>

      {/* Header Info */}
      <header style={{ paddingTop: 60, paddingBottom: 24, textAlign: "center", background: CARD, borderBottom: `1px solid ${BORDER}` }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em", padding: "0 16px" }}>{torneo.nombre}</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 14, color: MUTED, marginBottom: 16, flexWrap: "wrap", padding: "0 16px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={14}/> {torneoEquipos.length} Equipos</span>
          <span>•</span>
          <span style={{ textTransform: "capitalize" }}>{torneo.deporte}</span>
          <span>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={14}/> {torneo.vistasCount || 0} seguidores</span>
        </div>
        
        {torneoCats.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {torneoCats.map(cat => (
              <button key={cat.id} onClick={() => setActiveCatId(cat.id)} style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${currentCatId === cat.id ? CU : BORDER}`, background: currentCatId === cat.id ? CU_DIM : BG, color: currentCatId === cat.id ? CU : MUTED, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                {cat.nombre}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Sponsor Marquee */}
      {torneo.patrocinadores?.length > 0 && (
        <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, overflow: "hidden", padding: "12px 0" }}>
          <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} style={{ display: "flex", gap: 60, alignItems: "center", width: "fit-content", padding: "0 40px" }}>
            {[...torneo.patrocinadores, ...torneo.patrocinadores, ...torneo.patrocinadores].map((s, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}><img src={s.logo} alt={s.nombre} style={{ height: 30, width: "auto" }} /></div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Tabs Navigation */}
      <nav style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 50, overflowX: "auto", whiteSpace: "nowrap" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "center", minWidth: "max-content", padding: "0 16px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "16px 8px", border: "none", background: "none", borderBottom: `2px solid ${activeTab === t.id ? CU : "transparent"}`, color: activeTab === t.id ? CU : MUTED, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", transition: "all 0.2s" }}>
              <t.icon size={16} /><span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "32px auto", padding: "0 20px", paddingBottom: 100 }}>
        
        {activeTab === "fixture" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {catPartidos.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: MUTED }}>
                <Calendar size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
                <div style={{ fontSize: 16, fontWeight: 700 }}>Aún no hay partidos</div>
              </div>
            ) : (
              <div className="responsive-grid">
                {catPartidos.filter(p => ["programado", "en_curso", "finalizado"].includes(p.estado)).sort((a,b) => new Date(a.fechaHora) - new Date(b.fechaHora)).map(p => {
                  const local = catEquipos.find(e => e.id === p.equipoLocalId);
                  const visita = catEquipos.find(e => e.id === p.equipoVisitaId);
                  const isDone = p.estado === "finalizado";
                  return (
                    <motion.div whileHover={{ y: -4 }} key={p.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 24, boxShadow: "0 10px 20px rgba(0,0,0,0.03)", transition: "all 0.3s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: "0.04em" }}>
                        <span>JORNADA {p.ronda} · {p.fase.toUpperCase()}</span>
                        <span style={{ color: isDone ? MUTED : "#22C55E", background: isDone ? BG : "#22C55E15", padding: "4px 8px", borderRadius: 6 }}>{p.estado.toUpperCase()}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 48, height: 48, borderRadius: "50%", background: local?.color || CU_DIM, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${CARD}`, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                            {local?.escudo || local?.logo ? <img src={local.escudo || local.logo} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <Users size={20} color={local?.color ? "#FFF" : CU} />}
                          </div>
                          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{local?.nombre || "TBD"}</div>
                        </div>
                        <div style={{ padding: isDone ? "8px 16px" : "6px 12px", background: isDone ? CU_DIM : BG, border: `1px solid ${isDone ? "transparent" : BORDER}`, borderRadius: 12, fontWeight: 900, fontSize: isDone ? 20 : 12, color: isDone ? CU : MUTED, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 60 }}>
                          {isDone ? `${p.golesLocal} - ${p.golesVisita}` : "VS"}
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 48, height: 48, borderRadius: "50%", background: visita?.color || BORDER, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${CARD}`, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                            {visita?.escudo || visita?.logo ? <img src={visita.escudo || visita.logo} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <Users size={20} color="#FFF" />}
                          </div>
                          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{visita?.nombre || "TBD"}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "tabla" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {standings.type === "groups" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {Object.entries(standings.data).sort().map(([grp, rows]) => (
                  <div key={grp} style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: ELEVATION.card }}>
                    <div style={{ padding: "14px 20px", background: "#FDFDFB", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
                      <LayoutGrid size={16} color={CU} /><h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Grupo {grp}</h3>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 500 }}>
                        <thead><tr style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>{["#", "EQUIPO", "PJ", "PG", "PE", "PP", "GD", "PTS"].map((h, i) => <th key={h} style={{ padding: 12, textAlign: i === 1 ? "left" : "center", color: MUTED, fontWeight: i === 7 ? 800 : 700 }}>{h}</th>)}</tr></thead>
                        <tbody>
                          {rows.map((t, i) => (
                            <tr key={t.equipoId} style={{ borderBottom: `1px solid ${BORDER}` }}>
                              <td style={{ padding: 12, textAlign: "center", fontWeight: 800, color: i < 2 ? CU : MUTED }}>{i + 1}</td>
                              <td style={{ padding: 12, fontWeight: 800 }}>{t.nombre}</td>
                              <td style={{ padding: 12, textAlign: "center", color: MUTED }}>{t.pj}</td>
                              <td style={{ padding: 12, textAlign: "center", color: MUTED }}>{t.pg}</td>
                              <td style={{ padding: 12, textAlign: "center", color: MUTED }}>{t.pe}</td>
                              <td style={{ padding: 12, textAlign: "center", color: MUTED }}>{t.pp}</td>
                              <td style={{ padding: 12, textAlign: "center", fontWeight: 700, color: t.dg > 0 ? "#22C55E" : t.dg < 0 ? "#EF4444" : MUTED }}>{t.dg > 0 ? `+${t.dg}` : t.dg}</td>
                              <td style={{ padding: 12, textAlign: "center", fontWeight: 900, color: CU, fontSize: 14, background: CU_DIM }}>{t.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflowX: "auto", boxShadow: ELEVATION.card }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 500 }}>
                  <thead><tr style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>{["#", "EQUIPO", "PJ", "PG", "PE", "PP", "GD", "PTS"].map((h, i) => <th key={h} style={{ padding: 14, textAlign: i === 1 ? "left" : "center", color: MUTED, fontWeight: i === 7 ? 800 : 700 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {standings.data.map((t, i) => (
                      <tr key={t.equipoId} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={{ padding: 14, textAlign: "center", fontWeight: 800, color: i < 3 ? CU : MUTED }}>{i + 1}</td>
                        <td style={{ padding: 14, fontWeight: 800 }}>{t.nombre}</td>
                        <td style={{ padding: 14, textAlign: "center", color: MUTED }}>{t.pj}</td>
                        <td style={{ padding: 14, textAlign: "center", color: MUTED }}>{t.pg}</td>
                        <td style={{ padding: 14, textAlign: "center", color: MUTED }}>{t.pe}</td>
                        <td style={{ padding: 14, textAlign: "center", color: MUTED }}>{t.pp}</td>
                        <td style={{ padding: 14, textAlign: "center", fontWeight: 700, color: t.dg > 0 ? "#22C55E" : t.dg < 0 ? "#EF4444" : MUTED }}>{t.dg > 0 ? `+${t.dg}` : t.dg}</td>
                        <td style={{ padding: 14, textAlign: "center", fontWeight: 900, color: CU, fontSize: 15, background: CU_DIM }}>{t.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "bracket" && hasBracket && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 40, overflowX: "auto", padding: "10px 0 40px" }}>
            {activePhases.map(phaseName => {
              const phaseMatches = matchPhases[phaseName].sort((a, b) => a.orden - b.orden);
              return (
                <div key={phaseName} style={{ display: "flex", flexDirection: "column", gap: 32, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>{phaseName}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 32, justifyContent: "space-around", flex: 1 }}>
                    {phaseMatches.map(m => <BracketNode key={m.id} match={m} equipos={catEquipos} />)}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === "equipos" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {catEquipos.map(e => (
              <div key={e.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 24, textAlign: "center", boxShadow: ELEVATION.card }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: e.color || CU_DIM, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {e.escudo || e.logo ? <img src={e.escudo || e.logo} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <Users size={32} color={e.color ? "#FFF" : CU} />}
                </div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{e.nombre}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{e.grupo ? `Grupo ${e.grupo}` : "Inscrito"}</div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "info" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32, boxShadow: ELEVATION.card }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>Sobre el torneo</h3>
              <p style={{ lineHeight: 1.7, color: MUTED, whiteSpace: "pre-wrap" }}>{torneo.descripcion || "Sin descripción disponible."}</p>
              
              <div className="responsive-grid" style={{ marginTop: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F59E0B20", display: "flex", alignItems: "center", justifyContent: "center" }}><Gift color="#F59E0B" size={20}/></div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>PREMIOS</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{torneo.premios || "A definir"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#22C55E20", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone color="#22C55E" size={20}/></div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>CONTACTO</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{torneo.contacto || "No disponible"}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .responsive-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        @media (max-width: 600px) { .tab-label { display: inline-block; } .responsive-grid { grid-template-columns: 1fr; } }
      `}} />
    </div>
  );
}
