/**
 * @component App
 * @description Componente raiz de Elevate Sports.
 * Gestiona onboarding (Landing → Demo/Produccion), estado global,
 * enrutamiento entre modulos y persistencia en localStorage.
 *
 * @architecture
 * App
 * ├── LandingPage     → onboarding: demo o registro de club
 * ├── Home            → pantalla principal con mosaicos FIFA
 * ├── Entrenamiento   → asistencia, RPE, planificacion, historial
 * ├── GestionPlantilla → pizarra tactica y gestion del plantel
 * ├── MiClub          → configuracion del club
 * ├── Administracion  → pagos, movimientos, resumen financiero
 * └── Reportes        → resumen ejecutivo (inline)
 *
 * @state
 * - elevate_mode     {string|null}  null=landing, "demo", "production"
 * - activeModule     {string}       Modulo activo
 * - athletes/historial/clubInfo/matchStats/finanzas → datos del club
 *
 * @version 5.0
 * @author Elevate Sports
 */

import { useState, useCallback } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import FieldBackground from "./components/FieldBackground";
import LandingPage from "./components/LandingPage";
import Home from "./components/Home";
import Entrenamiento from "./components/Entrenamiento";
import GestionPlantilla from "./components/GestionPlantilla";
import MiClub from "./components/MiClub";
import Administracion from "./components/Administracion";
import {
  DEMO_ATHLETES, DEMO_HISTORIAL, DEMO_CLUB_INFO, DEMO_MATCH_STATS, DEMO_FINANZAS,
  EMPTY_ATHLETES, EMPTY_HISTORIAL, EMPTY_MATCH_STATS, EMPTY_FINANZAS,
  createEmptyClubInfo, STORAGE_KEYS,
} from "./constants/initialStates";

// ─────────────────────────────────────────────
// DEFAULTS — usados por useLocalStorage como fallback
// Se inicializan vacios; el onboarding los llena.
// ─────────────────────────────────────────────
const DEFAULT_CLUB = { nombre:"", disciplina:"", ciudad:"", entrenador:"", temporada:"", categorias:[], campos:[], descripcion:"", telefono:"", email:"" };

export default function App() {
  // ── Modo de la app: null=landing, "demo", "production" ──
  const [mode, setMode] = useLocalStorage("elevate_mode", null);

  // ── Estado global (persiste en localStorage) ──
  const [activeModule, setActiveModule] = useState("home");
  const [athletes,   setAthletes]   = useLocalStorage("elevate_athletes",   EMPTY_ATHLETES);
  const [historial,  setHistorial]  = useLocalStorage("elevate_historial",  EMPTY_HISTORIAL);
  const [clubInfo,   setClubInfo]   = useLocalStorage("elevate_clubInfo",   DEFAULT_CLUB);
  const [matchStats, setMatchStats] = useLocalStorage("elevate_matchStats", EMPTY_MATCH_STATS);
  const [finanzas,   setFinanzas]   = useLocalStorage("elevate_finanzas",   EMPTY_FINANZAS);

  // ── Onboarding: DEMO ──
  const handleDemo = useCallback(() => {
    // Limpieza selectiva antes de cargar demo
    STORAGE_KEYS.forEach(k => window.localStorage.removeItem(k));
    setAthletes(DEMO_ATHLETES);
    setHistorial(DEMO_HISTORIAL);
    setClubInfo(DEMO_CLUB_INFO);
    setMatchStats(DEMO_MATCH_STATS);
    setFinanzas(DEMO_FINANZAS);
    setActiveModule("home");
    setMode("demo");
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode]);

  // ── Onboarding: REGISTRO DE CLUB REAL ──
  const handleRegister = useCallback((form) => {
    // Limpieza selectiva — elimina cualquier residuo demo
    STORAGE_KEYS.forEach(k => window.localStorage.removeItem(k));
    const newClub = createEmptyClubInfo(form);
    setAthletes(EMPTY_ATHLETES);
    setHistorial(EMPTY_HISTORIAL);
    setClubInfo(newClub);
    setMatchStats(EMPTY_MATCH_STATS);
    setFinanzas(EMPTY_FINANZAS);
    setActiveModule("home");
    setMode("production");
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode]);

  // ── Cerrar sesion / volver a landing ──
  const handleLogout = useCallback(() => {
    STORAGE_KEYS.forEach(k => window.localStorage.removeItem(k));
    setAthletes(EMPTY_ATHLETES);
    setHistorial(EMPTY_HISTORIAL);
    setClubInfo(DEFAULT_CLUB);
    setMatchStats(EMPTY_MATCH_STATS);
    setFinanzas(EMPTY_FINANZAS);
    setActiveModule("home");
    setMode(null);
  }, [setAthletes, setHistorial, setClubInfo, setMatchStats, setFinanzas, setMode]);

  // ── Si no hay modo, mostrar Landing ──
  if (!mode) {
    return (
      <div style={{ minHeight:"100vh", background:"#050a14", position:"relative" }}>
        <FieldBackground />
        <LandingPage onDemo={handleDemo} onRegister={handleRegister} />
      </div>
    );
  }

  // ── Guardar sesion ──
  const guardarSesion = (nota, tipo) => {
    const presentes = athletes.filter(a => a.status === "P");
    const rpesValidos = presentes.filter(a => a.rpe).map(a => a.rpe);
    const rpePromedio = rpesValidos.length
      ? (rpesValidos.reduce((acc, v) => acc + v, 0) / rpesValidos.length).toFixed(1)
      : null;

    const num = historial.length > 0 ? historial[0].num + 1 : 1;
    const hoy = new Date();
    const dias  = ["Dom","Lun","Mar","Mie","Jue","Vie","Sab"];
    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const fecha = `${dias[hoy.getDay()]} ${hoy.getDate()} ${meses[hoy.getMonth()]}`;

    setHistorial(prev => [{
      num, fecha,
      presentes: presentes.length,
      total:     athletes.length,
      rpeAvg:    rpePromedio,
      tipo:      tipo || "Sesion",
      nota,
    }, ...prev]);

    alert(`Sesion #${num} guardada correctamente.`);
  };

  // ── Metricas calculadas ──
  const stats = {
    presentes:  athletes.filter(a => a.status === "P").length,
    ausentes:   athletes.filter(a => a.status === "A").length,
    lesionados: athletes.filter(a => a.status === "L").length,
    rpeAvg: (() => {
      const rpes = athletes.filter(a => a.status === "P" && a.rpe).map(a => a.rpe);
      return rpes.length
        ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1)
        : "\u2014";
    })(),
    sesiones:   historial.length,
    asistencia: Math.round(
      (historial.reduce((a, s) => a + s.presentes, 0) /
       Math.max(historial.reduce((a, s) => a + s.total, 0), 1)) * 100
    ),
  };

  const clubProps = {
    ...clubInfo,
    categoria: (clubInfo.categorias || [])[0] || "General",
  };

  // ── Mini topbar reutilizable ──
  const MiniTopbar = ({ title, accent = "#c8ff00", accentBg = "rgba(200,255,0,0.05)" }) => (
    <div style={{ height:38, background:"rgba(0,0,0,0.92)", borderBottom:`1px solid ${accent}33`, display:"flex", alignItems:"stretch" }}>
      <div onClick={() => setActiveModule("home")} style={{ padding:"0 18px", fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.4)", display:"flex", alignItems:"center", cursor:"pointer", borderRight:"1px solid rgba(255,255,255,0.08)" }}>
        ← Inicio
      </div>
      <div style={{ padding:"0 18px", fontSize:10, textTransform:"uppercase", letterSpacing:"2px", color:"white", display:"flex", alignItems:"center", borderBottom:`2px solid ${accent}`, background:accentBg }}>
        {title}
      </div>
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10, padding:"0 18px" }}>
        {mode === "demo" && (
          <div style={{ padding:"2px 8px", fontSize:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", background:"rgba(239,159,39,0.2)", color:"#EF9F27", border:"1px solid rgba(239,159,39,0.4)" }}>
            Demo
          </div>
        )}
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:accent, display:"inline-block", marginRight:6 }}/>
          {clubInfo.nombre || "Mi Club"} · {(clubInfo.categorias||[])[0]||"General"}
        </div>
      </div>
    </div>
  );

  // ── Render principal ──
  return (
    <div style={{ minHeight:"100vh", background:"#050a14", position:"relative" }}>
      <FieldBackground />
      <div style={{ position:"relative", zIndex:2 }}>

        {activeModule === "home" && (
          <Home
            club={clubProps}
            athletes={athletes}
            historial={historial}
            stats={stats}
            matchStats={matchStats}
            onNavigate={setActiveModule}
            mode={mode}
            onLogout={handleLogout}
          />
        )}

        {activeModule === "entrenamiento" && (
          <>
            <MiniTopbar title="Entrenamiento" />
            <Entrenamiento athletes={athletes} setAthletes={setAthletes} historial={historial} onGuardar={guardarSesion} stats={stats} clubInfo={clubInfo} />
          </>
        )}

        {activeModule === "plantilla" && (
          <>
            <MiniTopbar title="Gestion de plantilla" />
            <GestionPlantilla athletes={athletes} setAthletes={setAthletes} />
          </>
        )}

        {activeModule === "miclub" && (
          <>
            <MiniTopbar title="Mi club" />
            <MiClub clubInfo={clubInfo} setClubInfo={setClubInfo} />
          </>
        )}

        {activeModule === "admin" && (
          <>
            <MiniTopbar title="Administracion" accent="#7F77DD" accentBg="rgba(127,119,221,0.08)" />
            <Administracion athletes={athletes} finanzas={finanzas} setFinanzas={setFinanzas} />
          </>
        )}

        {activeModule === "reportes" && (
          <>
            <MiniTopbar title="Reportes" />
            <div style={{ padding:24 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
                {[
                  { label:"Jugadores", value:athletes.length, color:"#c8ff00" },
                  { label:"Sesiones", value:historial.length, color:"#1D9E75" },
                  { label:"Partidos", value:matchStats.played, color:"#7F77DD" },
                ].map((m,i) => (
                  <div key={i} style={{ padding:"18px 20px", background:"rgba(0,0,0,0.7)", borderTop:`3px solid ${m.color}`, border:"1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.35)", marginBottom:8 }}>{m.label}</div>
                    <div style={{ fontSize:32, fontWeight:700, color:m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.08)", padding:18 }}>
                  <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.35)", marginBottom:14 }}>Record de partidos</div>
                  <div style={{ display:"flex", gap:20 }}>
                    {[
                      { val:matchStats.won, lbl:"G", color:"#1D9E75" },
                      { val:matchStats.drawn, lbl:"E", color:"rgba(255,255,255,0.5)" },
                      { val:matchStats.lost, lbl:"P", color:"#E24B4A" },
                    ].map((s,i) => (
                      <div key={i}>
                        <div style={{ fontSize:28, fontWeight:700, color:s.color }}>{s.val}</div>
                        <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px" }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:12, fontSize:11, color:"rgba(255,255,255,0.4)" }}>
                    Goles: {matchStats.goalsFor} a favor / {matchStats.goalsAgainst} en contra · {matchStats.points} pts
                  </div>
                </div>
                <div style={{ background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.08)", padding:18 }}>
                  <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.35)", marginBottom:14 }}>Resumen financiero</div>
                  {(() => {
                    const movs = finanzas.movimientos || [];
                    const ingresos = movs.filter(m => m.tipo === "ingreso").reduce((s,m) => s+m.monto, 0);
                    const egresos = movs.filter(m => m.tipo === "egreso").reduce((s,m) => s+m.monto, 0);
                    const balance = ingresos - egresos;
                    const pagados = (finanzas.pagos || []).filter(p => p.estado === "pagado").length;
                    return (
                      <>
                        <div style={{ display:"flex", gap:20, marginBottom:8 }}>
                          <div>
                            <div style={{ fontSize:22, fontWeight:700, color: balance >= 0 ? "#1D9E75" : "#E24B4A" }}>
                              ${balance.toLocaleString("es-CO")}
                            </div>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>Balance</div>
                          </div>
                          <div>
                            <div style={{ fontSize:22, fontWeight:700, color:"#7F77DD" }}>{pagados}/{athletes.length}</div>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>Al dia</div>
                          </div>
                        </div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>
                          Ingresos: ${ingresos.toLocaleString("es-CO")} · Egresos: ${egresos.toLocaleString("es-CO")}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div style={{ marginTop:16, background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.08)", padding:18 }}>
                <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.35)", marginBottom:14 }}>Ultimas 5 sesiones</div>
                {historial.slice(0,5).map((s,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <div style={{ fontSize:12, color:"white" }}>#{s.num} — {s.fecha} <span style={{ color:"rgba(255,255,255,0.3)", fontSize:10 }}>({s.tipo})</span></div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{s.presentes}/{s.total} · RPE {s.rpeAvg ?? "\u2014"}</div>
                  </div>
                ))}
                {historial.length === 0 && <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>Sin sesiones registradas</div>}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
