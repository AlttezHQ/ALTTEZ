/**
 * @component Administracion
 * @description Modulo de administracion financiera de ALTTEZ.
 * Tres tabs: Pagos, Movimientos, Resumen.
 *
 * @props { athletes, finanzas, setFinanzas }
 * @version 2.0
 * @author ALTTEZ
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PALETTE } from "../../shared/tokens/palette";
import { createMovimiento, validatePago } from "../../shared/constants/schemas";
import { showToast } from "../../shared/ui/Toast";
import ConfirmModal from "../../shared/ui/ConfirmModal";
import { useStore } from "../../shared/store/useStore";
import GlassPanel  from "../../shared/ui/GlassPanel";
import SectionLabel from "../../shared/ui/SectionLabel";
import Badge       from "../../shared/ui/Badge";
import Button      from "../../shared/ui/Button";
import TabBar      from "../../shared/ui/TabBar";
import KpiCard     from "../../shared/ui/KpiCard";
import FieldInput  from "../../shared/ui/FieldInput";

// ── Animation variants ──────────────────────────────────────────────────────
const kpiStagger = { animate: { transition: { staggerChildren: 0.07 } } };
const kpiItem    = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } } };
const tabPanel   = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } }, exit: { opacity: 0, y: -6, transition: { duration: 0.15 } } };
const rowVariant = { initial: { opacity: 0, x: -8 }, animate: (i) => ({ opacity: 1, x: 0, transition: { type: "spring", stiffness: 320, damping: 28, delay: i * 0.04 } }) };

const ADMIN      = PALETTE.violetAccent;
const MONTHLY_FEE = 80000;
const TABS       = ["Mensualidades", "Movimientos", "Resumen ejecutivo"];

const fmtCOP  = (n) => "$" + Number(n).toLocaleString("es-CO");
const fmtDate = (d) => { if (!d) return "—"; const [y, m, day] = d.split("-"); return `${day}/${m}/${y}`; };

const ESTADO_COLOR = { pagado: PALETTE.green, parcial: PALETTE.amber, pendiente: PALETTE.danger };

// ── Selector de mes ─────────────────────────────────────────────────────────
function MonthSelector({ value, onChange }) {
  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const now = new Date();
  const currentYear = now.getFullYear();
  const opts = [];
  for (let y = currentYear - 1; y <= currentYear + 1; y++)
    for (let m = 0; m < 12; m++) {
      const val = `${y}-${String(m + 1).padStart(2, "0")}`;
      opts.push(<option key={val} value={val}>{MONTHS[m]} {y}</option>);
    }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
      <span className="section-label">MES</span>
      <select
        className="field-input"
        style={{ width: "auto", fontSize: "var(--fs-body-lg)", padding: "4px 8px", color: ADMIN, borderColor: PALETTE.violetBorder }}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {opts}
      </select>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Administracion() {
  const athletes   = useStore(state => state.athletes);
  const finanzas   = useStore(state => state.finanzas);
  const setFinanzas = useStore(state => state.setFinanzas);

  const [activeTab, setActiveTab] = useState("Mensualidades");
  const [selectedMes, setSelectedMes] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [movTipo, setMovTipo]       = useState("ingreso");
  const [movConcepto, setMovConcepto] = useState("");
  const [movMonto, setMovMonto]     = useState("");
  const [formError, setFormError]   = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [movFecha, setMovFecha]     = useState(() => new Date().toISOString().split("T")[0]);

  // ── Derived data ──
  const pagosDelMes    = (finanzas.pagos || []).filter(p => p.mes === selectedMes);
  const totalRecaudado = pagosDelMes.filter(p => p.estado === "pagado").reduce((s, p) => s + p.monto, 0);
  const totalParcial   = pagosDelMes.filter(p => p.estado === "parcial").reduce((s, p) => s + (p.monto / 2), 0);
  const totalPendiente = (athletes.length * MONTHLY_FEE) - totalRecaudado - totalParcial;
  const pctCobro       = athletes.length ? Math.round(((totalRecaudado + totalParcial) / (athletes.length * MONTHLY_FEE)) * 100) : 0;
  const alDia          = pagosDelMes.filter(p => p.estado === "pagado").length;
  const movimientos    = finanzas.movimientos || [];
  const balanceTotal   = movimientos.reduce((s, m) => m.tipo === "ingreso" ? s + m.monto : s - m.monto, 0);
  const egresosMes     = movimientos.filter(m => m.tipo === "egreso" && m.fecha.startsWith(selectedMes)).reduce((s, m) => s + m.monto, 0);
  const tasaMorosidad  = athletes.length ? Math.round((pagosDelMes.filter(p => p.estado === "pendiente").length / athletes.length) * 100) : 0;

  // ── Toggle payment status ──
  const doTogglePago = (athleteId) => {
    const cycle = { pendiente: "pagado", pagado: "parcial", parcial: "pendiente" };
    setFinanzas(prev => ({
      ...prev,
      pagos: prev.pagos.map(p => {
        if (p.athleteId === athleteId && p.mes === selectedMes) {
          const nuevoEstado = cycle[p.estado] || "pendiente";
          const updated = { ...p, estado: nuevoEstado, fechaPago: nuevoEstado === "pendiente" ? null : (p.fechaPago || new Date().toISOString().slice(0, 10)) };
          const { valid, errors } = validatePago(updated);
          if (!valid) { showToast(`Error en pago: ${errors[0]}`, "error"); return p; }
          return updated;
        }
        return p;
      }),
    }));
  };

  const togglePago = (athleteId) => {
    const pago    = pagosDelMes.find(p => p.athleteId === athleteId);
    const athlete = athletes.find(a => a.id === athleteId);
    const cycle   = { pendiente: "pagado", pagado: "parcial", parcial: "pendiente" };
    const next    = cycle[pago?.estado] || "pendiente";
    setConfirmAction({
      title: "Cambiar estado de pago",
      message: `${athlete?.name || "Jugador"}: ${pago?.estado || "pendiente"} → ${next}`,
      onConfirm: () => { doTogglePago(athleteId); setConfirmAction(null); },
    });
  };

  // ── Add movement ──
  const addMovimiento = () => {
    setFormError("");
    if (!movConcepto.trim()) { setFormError("El concepto no puede estar vacio"); return; }
    if (!movMonto) { setFormError("Ingresa un monto valido"); return; }
    const monto = Number(movMonto);
    if (isNaN(monto) || monto <= 0) { setFormError("El monto debe ser un numero positivo"); return; }
    if (!movFecha) { setFormError("Selecciona una fecha"); return; }
    const newMov = createMovimiento({ tipo: movTipo, concepto: movConcepto, monto, fecha: movFecha });
    if (!newMov) { setFormError("Datos invalidos — revisa los campos"); return; }
    setFinanzas(prev => ({ ...prev, movimientos: [...prev.movimientos, newMov] }));
    setMovConcepto(""); setMovMonto(""); setFormError("");
  };

  return (
    <div className="admin-container" style={{ padding: "var(--sp-4)" }}>

      {/* TABS */}
      <TabBar
        className="admin-tabs"
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
        accent={ADMIN}
        scrollable
        style={{
          background: "rgba(8,8,14,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "var(--sp-4)",
        }}
        rightSlot={<MonthSelector value={selectedMes} onChange={setSelectedMes} />}
      />

      <AnimatePresence mode="wait">

        {/* TAB: MENSUALIDADES */}
        {activeTab === "Mensualidades" && (
          <motion.div key="tab-pagos" variants={tabPanel} initial="initial" animate="animate" exit="exit">

            {/* KPI BAR */}
            <motion.div
              variants={kpiStagger} initial="initial" animate="animate"
              className="admin-kpi-bar"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}
            >
              {[
                { label: "TOTAL RECAUDADO", value: fmtCOP(totalRecaudado), accent: PALETTE.green },
                { label: "PENDIENTE",       value: fmtCOP(totalPendiente), accent: PALETTE.danger },
                { label: "% COBRO",         value: `${pctCobro}%`,         accent: ADMIN },
                { label: "AL DÍA / TOTAL",  value: `${alDia}/${athletes.length}`, accent: "white" },
              ].map(kpi => (
                <motion.div key={kpi.label} variants={kpiItem}>
                  <KpiCard label={kpi.label} value={kpi.value} accent={kpi.accent} />
                </motion.div>
              ))}
            </motion.div>

            {/* TABLE */}
            <div className="admin-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#","NOMBRE","POSICIÓN","ESTADO","MONTO","FECHA PAGO","ACCIÓN"].map(h => (
                      <th key={h} style={{ fontSize: "var(--fs-label)", textTransform: "uppercase", letterSpacing: "var(--ls-caps-md)", color: PALETTE.textMuted, padding: "var(--sp-2) var(--sp-3)", textAlign: "left", borderBottom: `1px solid ${PALETTE.border}`, background: "rgba(0,0,0,0.6)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((a, i) => {
                    const pago   = pagosDelMes.find(p => p.athleteId === a.id);
                    const estado = pago?.estado ?? "pendiente";
                    return (
                      <motion.tr
                        key={a.id} custom={i} variants={rowVariant} initial="initial" animate="animate"
                        style={{ background: i % 2 === 0 ? "linear-gradient(135deg,rgba(18,18,28,0.8),rgba(12,12,20,0.85))" : "rgba(10,10,18,0.6)", transition: "background 150ms" }}
                      >
                        <td style={{ fontSize: "var(--fs-body-lg)", color: "white", padding: "var(--sp-2) var(--sp-3)", borderBottom: `1px solid ${PALETTE.border}` }}>{a.id}</td>
                        <td style={{ fontSize: "var(--fs-body-lg)", color: "white", padding: "var(--sp-2) var(--sp-3)", borderBottom: `1px solid ${PALETTE.border}`, fontWeight: "var(--fw-bold)" }}>{a.name}</td>
                        <td style={{ fontSize: "var(--fs-caption)", color: PALETTE.textMuted, padding: "var(--sp-2) var(--sp-3)", borderBottom: `1px solid ${PALETTE.border}`, textTransform: "uppercase", letterSpacing: "var(--ls-caps-sm)" }}>{a.pos}</td>
                        <td style={{ padding: "var(--sp-2) var(--sp-3)", borderBottom: `1px solid ${PALETTE.border}` }}>
                          <Badge color={ESTADO_COLOR[estado]}>{estado}</Badge>
                        </td>
                        <td style={{ fontSize: "var(--fs-body-lg)", color: "white", padding: "var(--sp-2) var(--sp-3)", borderBottom: `1px solid ${PALETTE.border}` }}>{fmtCOP(MONTHLY_FEE)}</td>
                        <td style={{ fontSize: "var(--fs-body-lg)", color: PALETTE.textMuted, padding: "var(--sp-2) var(--sp-3)", borderBottom: `1px solid ${PALETTE.border}` }}>{fmtDate(pago?.fechaPago)}</td>
                        <td style={{ padding: "var(--sp-2) var(--sp-3)", borderBottom: `1px solid ${PALETTE.border}` }}>
                          <Button variant="capsule" accent={ADMIN} size="sm" onClick={() => togglePago(a.id)}>
                            ACTUALIZAR
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB: MOVIMIENTOS */}
        {activeTab === "Movimientos" && (
          <motion.div key="tab-movimientos" variants={tabPanel} initial="initial" animate="animate" exit="exit">

            {/* Balance */}
            <GlassPanel accent={ADMIN} style={{ marginBottom: "var(--sp-3)" }}>
              <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>BALANCE ACUMULADO</SectionLabel>
              <div style={{ fontSize: "var(--fs-kpi-sm)", fontWeight: "var(--fw-bold)", color: balanceTotal >= 0 ? PALETTE.green : PALETTE.danger }}>
                {fmtCOP(balanceTotal)}
              </div>
            </GlassPanel>

            {/* Form */}
            <GlassPanel style={{ marginBottom: "var(--sp-3)" }}>
              <SectionLabel style={{ marginBottom: "var(--sp-3)" }}>NUEVO MOVIMIENTO DE CAJA</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "var(--sp-3)", alignItems: "end" }}>
                <FieldInput label="TIPO" as="select" value={movTipo} onChange={e => setMovTipo(e.target.value)}>
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </FieldInput>
                <FieldInput label="CONCEPTO" value={movConcepto} onChange={e => setMovConcepto(e.target.value.replace(/[<>{}]/g, ""))} placeholder="Descripcion del movimiento" maxLength={120} />
                <FieldInput label="MONTO" type="number" value={movMonto} onChange={e => { const v = e.target.value; if (v === "" || (Number(v) >= 0 && Number(v) <= 999999999)) setMovMonto(v); }} placeholder="0" min="1" step="1000" />
                <FieldInput label="FECHA" type="date" value={movFecha} onChange={e => setMovFecha(e.target.value)} style={{ colorScheme: "dark" }} />
                <Button
                  variant="primary"
                  accent={ADMIN}
                  onClick={addMovimiento}
                  style={{ background: `linear-gradient(135deg,${ADMIN},#9d6fe8)`, color: "white", boxShadow: `0 4px 16px ${PALETTE.violetGlow}`, alignSelf: "flex-end" }}
                >
                  REGISTRAR
                </Button>
              </div>
              {formError && (
                <div style={{ marginTop: "var(--sp-2)", padding: "6px var(--sp-3)", background: PALETTE.dangerDim, border: `1px solid ${PALETTE.dangerBorder}`, fontSize: "var(--fs-caption)", color: PALETTE.danger, letterSpacing: "0.5px", borderRadius: "var(--radius-md)" }}>
                  {formError}
                </div>
              )}
            </GlassPanel>

            {/* Historial */}
            <GlassPanel>
              <SectionLabel style={{ marginBottom: "var(--sp-3)" }}>HISTORIAL DE CAJA</SectionLabel>
              {movimientos.length === 0 && (
                <div style={{ color: PALETTE.textMuted, fontSize: "var(--fs-body-lg)", padding: "var(--sp-3) 0" }}>
                  No hay movimientos registrados. Registra el primer ingreso o egreso del ciclo.
                </div>
              )}
              {[...movimientos].reverse().map((m, i) => (
                <motion.div
                  key={m.id} custom={i} variants={rowVariant} initial="initial" animate="animate"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "var(--sp-2) var(--sp-3)",
                    borderBottom: `1px solid ${PALETTE.border}`,
                    borderLeft: `3px solid ${m.tipo === "ingreso" ? PALETTE.green : PALETTE.danger}`,
                    marginBottom: "var(--sp-1)",
                    background: m.tipo === "ingreso" ? PALETTE.greenDim : PALETTE.dangerDim,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
                    <Badge color={m.tipo === "ingreso" ? PALETTE.green : PALETTE.danger} size="xs">
                      {m.tipo === "ingreso" ? "INGRESO" : "EGRESO"}
                    </Badge>
                    <span style={{ fontSize: "var(--fs-body-lg)", color: "white" }}>{m.concepto}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-5)" }}>
                    <span style={{ fontSize: "var(--fs-caption)", color: PALETTE.textMuted }}>{fmtDate(m.fecha)}</span>
                    <span style={{ fontSize: "var(--fs-title-sm)", fontWeight: "var(--fw-bold)", color: m.tipo === "ingreso" ? PALETTE.green : PALETTE.danger }}>
                      {m.tipo === "ingreso" ? "+" : "-"}{fmtCOP(m.monto)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </GlassPanel>
          </motion.div>
        )}

        {/* TAB: RESUMEN EJECUTIVO */}
        {activeTab === "Resumen ejecutivo" && (
          <motion.div key="tab-resumen" variants={tabPanel} initial="initial" animate="animate" exit="exit">
            <motion.div
              variants={kpiStagger} initial="initial" animate="animate"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "var(--sp-3)" }}
            >
              {[
                { label: "BALANCE TOTAL",    value: fmtCOP(balanceTotal),               accent: ADMIN,          color: balanceTotal >= 0 ? PALETTE.green : PALETTE.danger },
                { label: "RECAUDO DEL MES",  value: fmtCOP(totalRecaudado + totalParcial), accent: PALETTE.green,  color: PALETTE.green },
                { label: "GASTOS DEL MES",   value: fmtCOP(egresosMes),                 accent: PALETTE.danger, color: PALETTE.danger },
                { label: "TASA MOROSIDAD",   value: `${tasaMorosidad}%`,                accent: PALETTE.amber,  color: PALETTE.amber },
              ].map(card => (
                <motion.div key={card.label} variants={kpiItem}>
                  <GlassPanel accent={card.accent} padding="lg">
                    <SectionLabel style={{ marginBottom: "var(--sp-2)" }}>{card.label}</SectionLabel>
                    <div style={{ fontSize: "var(--fs-hero)", fontWeight: "var(--fw-bold)", color: card.color, letterSpacing: "var(--ls-tight)", fontFamily: '"Orbitron","Exo 2",Arial,sans-serif' }}>
                      {card.value}
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modal de confirmacion */}
      <AnimatePresence>
        {confirmAction && (
          <ConfirmModal
            title={confirmAction.title}
            message={confirmAction.message}
            onConfirm={confirmAction.onConfirm}
            onCancel={() => setConfirmAction(null)}
            accentColor={ADMIN}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
