import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Plus,
  Save,
  Shield,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import ConfirmModal from "../../../shared/ui/ConfirmModal";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import { showToast } from "../../../shared/ui/Toast";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import TeamsSummarySidebar from "../components/teams/TeamsSummarySidebar";
import TeamsTable from "../components/teams/TeamsTable";
import TeamsToolbar from "../components/teams/TeamsToolbar";
import { selectTeamsPageViewModel } from "../domain/teams/teamSelectors";
import { useTorneosStore } from "../store/useTorneosStore";
import { uploadImage } from "../utils/storageHelper";
import styles from "./EquiposPage.module.css";

const CU = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD = PALETTE.surface;
const BG = PALETTE.bg;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const HINT = PALETTE.textHint;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE = [0.22, 1, 0.36, 1];

function EquipoModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState(() =>
    initialData
      ? { ...initialData }
      : { nombre: "", grupo: "", delegado: "", entrenador: "", logo: "" },
  );
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (stayOpen = false) => {
    if (!formData.nombre.trim()) return;
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    if (!stayOpen) {
      onClose();
      return;
    }

    setFormData({ nombre: "", grupo: "", delegado: "", entrenador: "", logo: "" });
    nameInputRef.current?.focus();
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const url = await uploadImage(file);
    if (url) setFormData({ ...formData, logo: url });
    setLoading(false);
  };

  return (
    <div style={modalBackdropStyle}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={modalPanelStyle}
      >
        <div style={modalHeaderStyle}>
          <div style={modalHeaderCopyStyle}>
            <div style={modalIconWrapStyle}>
              <Shield size={20} color={CU} />
            </div>
            <h3 style={modalTitleStyle}>{initialData ? "Editar equipo" : "Nuevo equipo"}</h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={18} />
          </button>
        </div>

        <div style={modalBodyStyle}>
          <div style={logoUploadSectionStyle}>
            <div style={logoPreviewStyle}>
              {formData.logo ? (
                <img src={formData.logo} alt="Logo del equipo" style={logoPreviewImageStyle} />
              ) : (
                <Upload size={24} color={HINT} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={uploadKickerStyle}>LOGO DEL CLUB</div>
              <label style={uploadLabelStyle}>
                <Plus size={14} /> {formData.logo ? "Cambiar imagen" : "Subir imagen"}
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} disabled={loading} />
              </label>
            </div>
          </div>

          <Field label="NOMBRE DEL EQUIPO">
            <input
              ref={nameInputRef}
              type="text"
              value={formData.nombre}
              onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
              onKeyDown={(event) => event.key === "Enter" && handleSave(false)}
              placeholder="Ej: Deportivo Alttez"
              style={modalInputStyle}
            />
          </Field>

          <div style={twoColumnGridStyle}>
            <Field label="CATEGORIA">
              <input
                type="text"
                value={formData.grupo}
                onChange={(event) => setFormData({ ...formData, grupo: event.target.value })}
                onKeyDown={(event) => event.key === "Enter" && handleSave(false)}
                placeholder="Ej: Sub 15"
                style={modalInputStyle}
              />
            </Field>
            <Field label="DELEGADO / CONTACTO">
              <input
                type="text"
                value={formData.delegado}
                onChange={(event) => setFormData({ ...formData, delegado: event.target.value })}
                onKeyDown={(event) => event.key === "Enter" && handleSave(false)}
                placeholder="Nombre"
                style={modalInputStyle}
              />
            </Field>
          </div>
        </div>

        <div style={modalFooterColumnStyle}>
          <div style={modalActionsRowStyle}>
            <button disabled={loading} onClick={() => handleSave(false)} style={modalPrimaryActionStyle}>
              <Save size={16} /> Guardar equipo
            </button>
            {!initialData && (
              <button
                disabled={loading}
                onClick={() => handleSave(true)}
                style={modalSecondaryIconActionStyle}
                title="Guardar y registrar otro"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <button onClick={onClose} style={modalCancelActionStyle}>
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ImportModal({ isOpen, onClose, onImport }) {
  if (!isOpen) return null;

  return (
    <div style={modalBackdropStyle}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...modalPanelStyle, maxWidth: 500 }}>
        <div style={modalHeaderStyle}>
          <div style={modalHeaderCopyStyle}>
            <div style={{ ...modalIconWrapStyle, background: `${PALETTE.success}15` }}>
              <FileText size={20} color={PALETTE.success} />
            </div>
            <h3 style={modalTitleStyle}>Importar desde Excel</h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={18} />
          </button>
        </div>

        <div style={importInfoCardStyle}>
          <div style={importInfoTitleStyle}>FORMATO DEL ARCHIVO</div>
          <div style={importInfoTextStyle}>
            El archivo debe ser Excel (.xlsx) o CSV y contener las columnas Nombre, Categoria y Delegado.
          </div>
          <table style={importTableStyle}>
            <thead>
              <tr style={{ color: HINT, borderBottom: `1px solid ${BORDER}` }}>
                <th style={{ paddingBottom: 8 }}>Nombre</th>
                <th style={{ paddingBottom: 8 }}>Categoria</th>
                <th style={{ paddingBottom: 8 }}>Delegado</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ color: TEXT, fontWeight: 600 }}>
                <td style={{ paddingTop: 8 }}>Tigres FC</td>
                <td style={{ paddingTop: 8 }}>Sub 12</td>
                <td style={{ paddingTop: 8 }}>Juan Perez</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={importDropzoneStyle} onClick={() => document.getElementById("file-import")?.click()}>
          <Upload size={32} color={CU} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Selecciona tu archivo</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Haz clic o arrastra el archivo aqui</div>
          <input id="file-import" type="file" hidden accept=".xlsx,.xls,.csv" onChange={(event) => onImport(event.target.files?.[0])} />
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={modalGhostActionStyle}>
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TeamPlayersModal({ isOpen, onClose, team, onUpdate }) {
  const [nuevo, setNuevo] = useState({ nombre: "", dorsal: "" });
  const inputRef = useRef(null);

  if (!isOpen || !team) return null;

  const handleAdd = () => {
    if (!nuevo.nombre.trim()) return;
    const jugador = { id: crypto.randomUUID(), nombre: nuevo.nombre.trim(), dorsal: nuevo.dorsal.trim() };
    onUpdate({ jugadores: [...(team.jugadores || []), jugador] });
    setNuevo({ nombre: "", dorsal: "" });
    inputRef.current?.focus();
  };

  const remove = (id) => {
    onUpdate({ jugadores: (team.jugadores || []).filter((player) => player.id !== id) });
  };

  return (
    <div style={modalBackdropStyle}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...modalPanelStyle, maxWidth: 500 }}>
        <div style={modalHeaderStyle}>
          <div style={modalHeaderCopyStyle}>
            <div style={modalIconWrapStyle}>
              <Users size={20} color={CU} />
            </div>
            <div>
              <h3 style={modalTitleStyle}>Plantilla: {team.nombre}</h3>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>{team.grupo || "Sin categoria"}</div>
            </div>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="N°"
            value={nuevo.dorsal}
            onChange={(event) => setNuevo({ ...nuevo, dorsal: event.target.value })}
            style={{ width: 60, ...modalInputStyle }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Nombre completo del jugador"
            value={nuevo.nombre}
            onChange={(event) => setNuevo({ ...nuevo, nombre: event.target.value })}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            style={{ flex: 1, ...modalInputStyle }}
          />
          <button onClick={handleAdd} style={playerAddButtonStyle}>
            <Plus size={20} />
          </button>
        </div>

        <div style={playersListStyle}>
          {(team.jugadores || []).length === 0 ? (
            <div style={playersEmptyStyle}>No hay jugadores registrados.</div>
          ) : (
            team.jugadores.map((player) => (
              <div key={player.id} style={playerRowStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={playerNumberStyle}>{player.dorsal || "-"}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{player.nombre}</div>
                </div>
                <button onClick={() => remove(player.id)} style={playerRemoveButtonStyle}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={modalPrimaryDoneStyle}>
            Finalizar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 6, letterSpacing: "0.04em" }}>{label}</div>
      {children}
    </div>
  );
}

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: "0 16px",
};

const modalPanelStyle = {
  background: CARD,
  borderRadius: 24,
  width: "100%",
  maxWidth: 440,
  padding: 32,
  boxShadow: ELEVATION.panel,
  border: `1px solid ${BORDER}`,
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 24,
};

const modalHeaderCopyStyle = { display: "flex", alignItems: "center", gap: 12 };
const modalIconWrapStyle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: CU_DIM,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const modalTitleStyle = { margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" };
const modalCloseButtonStyle = {
  background: BG,
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 8,
  cursor: "pointer",
  color: MUTED,
};
const modalBodyStyle = { display: "flex", flexDirection: "column", gap: 20 };
const logoUploadSectionStyle = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  padding: 16,
  background: BG,
  borderRadius: 16,
  border: `1px dashed ${BORDER}`,
};
const logoPreviewStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
  background: CARD,
  border: `1px solid ${BORDER}`,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const logoPreviewImageStyle = { width: "100%", height: "100%", objectFit: "cover" };
const uploadKickerStyle = { fontSize: 11, fontWeight: 700, color: TEXT, marginBottom: 4 };
const uploadLabelStyle = {
  fontSize: 12,
  color: CU,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};
const twoColumnGridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const modalInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  color: TEXT,
  fontFamily: FONT,
  background: BG,
  outline: "none",
};
const modalFooterColumnStyle = { display: "flex", flexDirection: "column", gap: 10, marginTop: 32 };
const modalActionsRowStyle = { display: "flex", gap: 10 };
const modalPrimaryActionStyle = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: CU,
  fontSize: 13,
  fontWeight: 700,
  color: "#FFF",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: `0 4px 12px ${CU}33`,
};
const modalSecondaryIconActionStyle = {
  padding: "0 16px",
  borderRadius: 12,
  border: `1.5px solid ${CU_BOR}`,
  background: BG,
  fontSize: 13,
  fontWeight: 700,
  color: CU,
  cursor: "pointer",
};
const modalCancelActionStyle = {
  padding: "12px",
  borderRadius: 12,
  border: `1px solid ${BORDER}`,
  background: "none",
  fontSize: 13,
  fontWeight: 700,
  color: MUTED,
  cursor: "pointer",
};
const modalGhostActionStyle = {
  padding: "12px 24px",
  borderRadius: 12,
  border: `1px solid ${BORDER}`,
  background: "none",
  fontSize: 13,
  fontWeight: 700,
  color: MUTED,
  cursor: "pointer",
};
const importInfoCardStyle = {
  padding: 20,
  background: BG,
  borderRadius: 16,
  border: `1px solid ${BORDER}`,
  marginBottom: 24,
};
const importInfoTitleStyle = { fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 12 };
const importInfoTextStyle = { fontSize: 11, color: MUTED, lineHeight: 1.6, marginBottom: 16 };
const importTableStyle = { width: "100%", fontSize: 10, borderCollapse: "collapse", textAlign: "left" };
const importDropzoneStyle = {
  border: `2px dashed ${BORDER}`,
  borderRadius: 16,
  padding: "32px 20px",
  textAlign: "center",
  cursor: "pointer",
  background: BG,
};
const playerAddButtonStyle = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: CU,
  border: "none",
  color: "#FFF",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const playersListStyle = {
  maxHeight: 300,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  paddingRight: 4,
};
const playersEmptyStyle = { padding: "40px 0", textAlign: "center", color: MUTED, fontSize: 13 };
const playerRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  background: BG,
  borderRadius: 12,
  border: `1px solid ${BORDER}`,
};
const playerNumberStyle = {
  width: 28,
  height: 28,
  borderRadius: 6,
  background: CARD,
  border: `1px solid ${BORDER}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 800,
  color: CU,
};
const playerRemoveButtonStyle = { background: "none", border: "none", color: MUTED, cursor: "pointer" };
const modalPrimaryDoneStyle = {
  padding: "12px 24px",
  borderRadius: 12,
  border: "none",
  background: CU,
  fontSize: 13,
  fontWeight: 700,
  color: "#FFF",
  cursor: "pointer",
};

export default function EquiposPage({ onGoTorneos }) {
  const torneoActivoId = useTorneosStore((state) => state.torneoActivoId);
  const allTorneos = useTorneosStore((state) => state.torneos);
  const allEquipos = useTorneosStore((state) => state.equipos);
  const agregarEquipo = useTorneosStore((state) => state.agregarEquipo);
  const actualizarEquipo = useTorneosStore((state) => state.actualizarEquipo);
  const eliminarEquipo = useTorneosStore((state) => state.eliminarEquipo);

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [playersOpen, setPlayersOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [pendingDeleteEquipo, setPendingDeleteEquipo] = useState(null);

  const torneo = allTorneos.find((item) => item.id === torneoActivoId) ?? null;
  const equiposRaw = allEquipos.filter((item) => item.torneoId === torneoActivoId);
  const origin = typeof window !== "undefined" ? window.location.origin : null;

  const pageViewModel = useMemo(
    () =>
      selectTeamsPageViewModel({
        torneoActivoId,
        tournamentName: torneo?.nombre ?? "",
        tournamentSlug: torneo?.slug ?? null,
        origin,
        teams: allEquipos,
        search,
        statusFilter: filterEstado,
      }),
    [allEquipos, filterEstado, origin, search, torneo?.nombre, torneo?.slug, torneoActivoId],
  );

  if (!torneoActivoId) {
    return (
      <ModuleEmptyState
        icon={Users}
        title="Selecciona un torneo"
        subtitle="Abre un torneo desde la lista para gestionar sus equipos."
        ctaLabel="Ver torneos"
        onCta={onGoTorneos}
      />
    );
  }

  const handleSaveModal = async (data) => {
    if (editingEquipo) {
      await actualizarEquipo(editingEquipo.id, data);
      showToast("Equipo actualizado", "success");
      return;
    }

    await agregarEquipo(torneoActivoId, data);
    showToast("Equipo registrado", "success");
  };

  const handleImport = async (file) => {
    if (!file) return;
    showToast(`Procesando ${file.name}...`, "info");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          showToast("El archivo esta vacio", "error");
          return;
        }

        let count = 0;
        for (const row of json) {
          const nombre = row.Nombre || row.nombre || row.NOMBRE || row.Equipo || row.EQUIPO;
          const grupo = row.Categoria || row["Categoría"] || row.categoria || row.Grupo || row.grupo;
          const delegado = row.Delegado || row.delegado || row.Contacto || row.contacto;

          if (nombre) {
            await agregarEquipo(torneoActivoId, {
              nombre: String(nombre).trim(),
              grupo: grupo ? String(grupo).trim() : "",
              delegado: delegado ? String(delegado).trim() : "",
            });
            count += 1;
          }
        }

        setImportOpen(false);
        showToast(`Se importaron ${count} equipos con exito`, "success");
      } catch (error) {
        console.error("Error importando archivo:", error);
        showToast("Error al leer el archivo. Asegurate de que sea Excel o CSV.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAction = (id, action) => {
    const equipo = equiposRaw.find((item) => item.id === id);
    if (!equipo) return;

    if (action === "eliminar") {
      setPendingDeleteEquipo(equipo);
      return;
    }

    if (action === "editar") {
      setEditingEquipo(equipo);
      setModalOpen(true);
      return;
    }

    if (action === "jugadores") {
      setEditingEquipo(equipo);
      setPlayersOpen(true);
      return;
    }

    if (action === "link") {
      const url = `${window.location.origin}/t/${torneo?.slug}/registro-equipo/${equipo.id}`;
      navigator.clipboard
        .writeText(url)
        .then(() => showToast("Link publico copiado al portapapeles", "success"))
        .catch(() => showToast("Error al copiar link", "error"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={styles.page}
    >
      <EquipoModal
        key={`${editingEquipo?.id || "new"}-${modalOpen ? "open" : "closed"}`}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEquipo(null);
        }}
        onSave={handleSaveModal}
        initialData={editingEquipo}
      />
      <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
      <TeamPlayersModal
        isOpen={playersOpen}
        onClose={() => {
          setPlayersOpen(false);
          setEditingEquipo(null);
        }}
        team={editingEquipo}
        onUpdate={(patch) => actualizarEquipo(editingEquipo.id, patch)}
      />

      <AnimatePresence>
        {pendingDeleteEquipo && (
          <ConfirmModal
            title="Eliminar equipo"
            message={`¿Eliminar "${pendingDeleteEquipo.nombre}"? Esta accion no se puede deshacer.`}
            confirmLabel="Eliminar"
            cancelLabel="Cancelar"
            accentColor={PALETTE.danger ?? "#EF4444"}
            onCancel={() => setPendingDeleteEquipo(null)}
            onConfirm={async () => {
              await eliminarEquipo(pendingDeleteEquipo.id);
              setPendingDeleteEquipo(null);
              showToast("Equipo eliminado", "success");
            }}
          />
        )}
      </AnimatePresence>

      <div className={styles.breadcrumbs}>
        <span className={styles.crumbMuted}>Torneos</span>
        <span className={styles.crumbMuted}>›</span>
        <span className={styles.crumbCurrent}>Equipos</span>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Equipos</h1>
          <p className={styles.subtitle}>
            Administra los equipos participantes por torneo y categoria.
          </p>
        </div>
      </div>

      <TeamsToolbar
        tournamentName={pageViewModel.tournamentName}
        search={search}
        statusFilter={filterEstado}
        onSearchChange={setSearch}
        onStatusFilterChange={setFilterEstado}
        onCreate={() => {
          setEditingEquipo(null);
          setModalOpen(true);
        }}
        onImport={() => setImportOpen(true)}
      />

      <div className={styles.mainGrid}>
        <TeamsTable teams={pageViewModel.teams} onAction={handleAction} />
        <TeamsSummarySidebar summary={pageViewModel.summary} />
      </div>
    </motion.div>
  );
}
