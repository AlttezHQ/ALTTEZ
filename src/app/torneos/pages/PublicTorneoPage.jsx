import { useParams, Link } from "react-router-dom";
import { useTorneosStore } from "../store/useTorneosStore";
import { motion } from "framer-motion";
import { Trophy, BarChart2, Calendar, Users, Info, Phone, Gift, MapPin, Eye, Heart, FileText } from "lucide-react";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import { calcularPosiciones } from "../utils/fixturesEngine";
import { useState } from "react";

const CU = PALETTE.bronce;
const BG = PALETTE.bg;
const CARD = PALETTE.surface;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

export default function PublicTorneoPage() {
  const { slug } = useParams();
  const torneos = useTorneosStore((s) => s.torneos);
  const equipos = useTorneosStore((s) => s.equipos);
  const partidos = useTorneosStore((s) => s.partidos);
  const [activeTab, setActiveTab] = useState("fixture"); // fixture, tabla, equipos, info

  const torneo = torneos.find((t) => t.slug === slug && t.publicado);

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

  const torneoEquipos = equipos.filter((e) => e.torneoId === torneo.id);
  const torneoPartidos = partidos.filter((p) => p.torneoId === torneo.id);
  const tabla = calcularPosiciones(torneoPartidos, torneoEquipos);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: FONT, color: TEXT }}>
      
      {/* Portada y Perfil */}
      <div style={{ position: "relative", height: 280, background: torneo.portada ? `url(${torneo.portada}) center/cover` : `linear-gradient(135deg, ${CU}, #8B5E34)` }}>
        <div style={{ position: "absolute", bottom: -50, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${CARD}`, background: CARD, boxShadow: ELEVATION.card, overflow: "hidden" }}>
            {torneo.perfil ? (
              <img src={torneo.perfil} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: CU_DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={40} color={CU} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header Info */}
      <header style={{ paddingTop: 60, paddingBottom: 24, textAlign: "center", background: CARD, borderBottom: `1px solid ${BORDER}` }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" }}>{torneo.nombre}</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 14, color: MUTED, marginBottom: 16 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={14}/> {torneoEquipos.length} Equipos</span>
          <span>•</span>
          <span style={{ textTransform: "capitalize" }}>{torneo.deporte}</span>
          <span>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={14}/> {torneo.vistasCount || 0}</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: CU, color: "#FFF", border: "none", padding: "10px 24px", borderRadius: 30, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: ELEVATION.card }}
          >
            <Heart size={16} /> Seguir Torneo
          </motion.button>
          {torneo.reglamentoUrl && (
            <motion.a 
              href={torneo.reglamentoUrl} target="_blank" rel="noreferrer"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ display: "flex", alignItems: "center", gap: 8, background: BG, color: TEXT, border: `1px solid ${BORDER}`, padding: "10px 24px", borderRadius: 30, fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}
            >
              <FileText size={16} /> Reglamento
            </motion.a>
          )}
        </div>
      </header>

      {/* Sponsor Marquee */}
      {torneo.patrocinadores?.length > 0 && (
        <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, overflow: "hidden", padding: "12px 0" }}>
          <motion.div 
            animate={{ x: [0, -1000] }} 
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            style={{ display: "flex", gap: 60, alignItems: "center", width: "fit-content", padding: "0 40px" }}
          >
            {[...torneo.patrocinadores, ...torneo.patrocinadores, ...torneo.patrocinadores].map((s, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <img src={s.logo} alt={s.nombre} style={{ height: 30, width: "auto", filter: "grayscale(100%)", opacity: 0.6 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.05em" }}>{s.nombre.toUpperCase()}</span>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Tabs Navigation */}
      <nav style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "center" }}>
          {[
            { id: "fixture", label: "Fixture", icon: Calendar },
            { id: "tabla", label: "Tabla", icon: BarChart2 },
            { id: "equipos", label: "Equipos", icon: Users },
            { id: "info", label: "Información", icon: Info },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "16px 8px", border: "none", background: "none",
                borderBottom: `2px solid ${activeTab === t.id ? CU : "transparent"}`,
                color: activeTab === t.id ? CU : MUTED, fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <t.icon size={16} />
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "32px auto", padding: "0 20px", paddingBottom: 100 }}>
        
        {activeTab === "fixture" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {torneoPartidos.filter(p => ["programado", "en_curso", "finalizado"].includes(p.estado)).sort((a,b) => new Date(a.fechaHora) - new Date(b.fechaHora)).map(p => {
                const local = torneoEquipos.find(e => e.id === p.equipoLocalId);
                const visita = torneoEquipos.find(e => e.id === p.equipoVisitaId);
                return (
                  <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: ELEVATION.card }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 10, fontWeight: 800, color: MUTED }}>
                      <span>JORNADA {p.ronda} · {p.fase.toUpperCase()}</span>
                      <span style={{ color: p.estado === "finalizado" ? CU : "#22C55E" }}>{p.estado.toUpperCase()}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, textAlign: "right", fontSize: 14, fontWeight: 700 }}>{local?.nombre}</div>
                      <div style={{ padding: "4px 12px", background: BG, borderRadius: 8, fontWeight: 800, fontSize: 16 }}>
                        {p.estado === "finalizado" ? `${p.golesLocal} - ${p.golesVisita}` : "vs"}
                      </div>
                      <div style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700 }}>{visita?.nombre}</div>
                    </div>
                    {p.fechaHora && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "center", gap: 16, fontSize: 11, color: MUTED }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12}/> {new Date(p.fechaHora).toLocaleDateString()}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12}/> Cancha {p.sedeId?.slice(-1) || 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === "tabla" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: ELEVATION.card }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
                    <th style={{ padding: 16, textAlign: "center", width: 40 }}>#</th>
                    <th style={{ padding: 16, textAlign: "left" }}>Equipo</th>
                    <th style={{ padding: 16, textAlign: "center" }}>PJ</th>
                    <th style={{ padding: 16, textAlign: "center" }}>GD</th>
                    <th style={{ padding: 16, textAlign: "center", fontWeight: 800 }}>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((t, i) => (
                    <tr key={t.equipoId} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: 14, textAlign: "center", fontWeight: 700, color: i < 3 ? CU : MUTED }}>{i + 1}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>{t.nombre}</td>
                      <td style={{ padding: 14, textAlign: "center", color: MUTED }}>{t.pj}</td>
                      <td style={{ padding: 14, textAlign: "center", color: MUTED }}>{t.gf - t.gc}</td>
                      <td style={{ padding: 14, textAlign: "center", fontWeight: 800, color: CU, fontSize: 15 }}>{t.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "equipos" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {torneoEquipos.map(e => (
              <div key={e.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 24, textAlign: "center", boxShadow: ELEVATION.card }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: e.color || CU_DIM, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {e.escudo ? <img src={e.escudo} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : <Users size={32} color={e.color ? "#FFF" : CU} />}
                </div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{e.nombre}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>GRUPO {e.grupo || "A"}</div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "info" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 32, boxShadow: ELEVATION.card }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px" }}>Sobre el torneo</h3>
              <p style={{ lineHeight: 1.7, color: MUTED, whiteSpace: "pre-wrap" }}>{torneo.descripcion || "Sin descripción disponible."}</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
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
        @media (max-width: 600px) {
          .tab-label { display: none; }
        }
      `}} />
    </div>
  );
}
