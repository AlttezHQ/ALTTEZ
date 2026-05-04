import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, FileSpreadsheet, Tag } from "lucide-react";
import { PALETTE } from "../../shared/tokens/palette";
import { useTorneosStore } from "./store/useTorneosStore";

import TorneosSidebar   from "./components/shared/TorneosSidebar";
import TorneosHeader    from "./components/shared/TorneosHeader";
import ModuleEmptyState from "./components/shared/ModuleEmptyState";
import InicioPage       from "./pages/InicioPage";
import TorneosListPage  from "./pages/TorneosListPage";
import EquiposPage      from "./pages/EquiposPage";
import FixturesPage     from "./pages/FixturesPage";
import EstadisticasPage from "./pages/EstadisticasPage";
import CalendarioPage   from "./pages/CalendarioPage";
import AjustesPage      from "./pages/AjustesPage";
import CrearTorneoWizard from "./components/wizard/CrearTorneoWizard";

const BG     = PALETTE.bg;
const CARD   = PALETTE.surface;
const CU     = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const BORDER = PALETTE.border;
const EASE   = [0.22, 1, 0.36, 1];
const FONT   = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

const PAGE_ANIM = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: EASE },
};

function ImportModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(23,26,28,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, fontFamily: FONT,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{
          background: CARD, borderRadius: 16, width: 480,
          boxShadow: "0 24px 64px rgba(23,26,28,0.18)",
          border: `1px solid ${BORDER}`, padding: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Importar datos</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{
            border: `2px dashed ${CU_BOR}`, borderRadius: 10, padding: "20px 16px",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8, background: CU_DIM,
          }}>
            <FileSpreadsheet size={24} color={CU} />
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Desde Excel / CSV</span>
            <span style={{ fontSize: 11, color: MUTED }}>Arrastra un archivo o haz clic para seleccionar</span>
            <input type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} />
          </label>
          <div style={{
            border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16,
            display: "flex", alignItems: "center", gap: 12, opacity: 0.5,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trophy size={16} color={MUTED} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Desde ALTTEZ Clubes</div>
              <div style={{ fontSize: 11, color: MUTED }}>Próximamente disponible</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: MUTED, background: BG, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "2px 7px" }}>
              PRONTO
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", fontSize: 13, color: MUTED, fontFamily: FONT, cursor: "pointer" }}>
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: CU, color: "#FFF", fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}
          >
            Importar
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TorneosApp() {
  const navigate = useNavigate();
  const torneoActivoId = useTorneosStore(s => s.torneoActivoId);
  const torneos        = useTorneosStore(s => s.torneos);
  const torneoActivo   = torneoActivoId ? torneos.find(t => t.id === torneoActivoId) ?? null : null;

  const [activeModule, setActiveModule] = useState("inicio");
  const [showImport,   setShowImport]   = useState(false);

  const goTo      = (mod) => setActiveModule(mod);
  const goTorneos = ()    => setActiveModule("torneos");

  const handleCreate  = () => setActiveModule("crear");
  const handleImport  = () => setShowImport(true);

  const handleWizardFinish = () => setActiveModule("torneos");
  const handleWizardBack   = () => setActiveModule("inicio");

  const handleAbrirTorneo = () => setActiveModule("fixtures");

  const sidebarActive = activeModule === "crear" ? null : activeModule;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: FONT }}>
      <TorneosSidebar
        active={sidebarActive}
        onNav={goTo}
        torneoActivo={torneoActivo}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <TorneosHeader onLogout={() => navigate("/")} />

        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px 48px" }}>
          <AnimatePresence mode="wait">

            {activeModule === "inicio" && (
              <motion.div key="inicio" {...PAGE_ANIM}>
                <InicioPage
                  onCreate={handleCreate}
                  onImport={handleImport}
                  onInfoClick={goTo}
                  onNavigate={goTo}
                />
              </motion.div>
            )}

            {activeModule === "crear" && (
              <motion.div key="crear" {...PAGE_ANIM}>
                <CrearTorneoWizard
                  onFinish={handleWizardFinish}
                  onBack={handleWizardBack}
                />
              </motion.div>
            )}

            {activeModule === "torneos" && (
              <motion.div key="torneos" {...PAGE_ANIM}>
                <TorneosListPage
                  onCreate={handleCreate}
                  onAbrir={handleAbrirTorneo}
                />
              </motion.div>
            )}

            {activeModule === "equipos" && (
              <motion.div key="equipos" {...PAGE_ANIM}>
                <EquiposPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "categorias" && (
              <motion.div key="categorias" {...PAGE_ANIM}>
                <ModuleEmptyState
                  icon={Tag}
                  title="Sin categorías"
                  subtitle="Define categorías para organizar tus torneos."
                />
              </motion.div>
            )}

            {activeModule === "calendario" && (
              <motion.div key="calendario" {...PAGE_ANIM}>
                <CalendarioPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "estadisticas" && (
              <motion.div key="estadisticas" {...PAGE_ANIM}>
                <EstadisticasPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "fixtures" && (
              <motion.div key="fixtures" {...PAGE_ANIM}>
                <FixturesPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "publica" && (
              <motion.div key="publica" {...PAGE_ANIM}>
                <AjustesPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

            {activeModule === "ajustes" && (
              <motion.div key="ajustes" {...PAGE_ANIM}>
                <AjustesPage onGoTorneos={goTorneos} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      </AnimatePresence>
    </div>
  );
}
