import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Gift,
  Globe,
  Image,
  Info,
  Phone,
  Plus,
  Settings,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { PALETTE, ELEVATION } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CU_BOR = PALETTE.bronceBorder;
const CARD = PALETTE.surface;
const BG = PALETTE.bg;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const ELEV = ELEVATION?.card ?? "0 10px 28px rgba(23,26,28,0.07)";
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";

function SectionCard({ icon: Icon, title, children, titleOnly = false }) {
  return (
    <div
      style={{
        background: CARD,
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        padding: 24,
        marginBottom: 16,
        boxShadow: ELEV,
      }}
    >
      {titleOnly ? (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: CU,
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          {title}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Icon size={16} color={CU} />
          <div style={{ fontSize: 11, fontWeight: 700, color: CU, letterSpacing: "0.1em" }}>
            {title}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function Field({ label, children, icon: Icon }) {
  return (
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: MUTED,
          display: "block",
          marginBottom: 5,
          letterSpacing: "0.04em",
        }}
      >
        {Icon ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon size={10} />
            {label}
          </span>
        ) : (
          label
        )}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: TEXT,
  fontFamily: FONT,
  background: BG,
  outline: "none",
};

export function SettingsBasicInfoPanel({
  form,
  sports,
  saved,
  onChange,
  onSave,
}) {
  return (
    <SectionCard title="INFORMACIÓN BÁSICA" titleOnly>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="NOMBRE DEL TORNEO">
          <input
            type="text"
            value={form.nombre}
            onChange={(event) => onChange("nombre", event.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="DEPORTE">
          <select
            value={form.deporte}
            onChange={(event) => onChange("deporte", event.target.value)}
            style={{ ...inputStyle, appearance: "none" }}
          >
            {sports.map((sport) => (
              <option key={sport}>{sport}</option>
            ))}
          </select>
        </Field>

        <Field label="TEMPORADA">
          <input
            type="text"
            value={form.temporada}
            placeholder="Ej: 2026-I"
            onChange={(event) => onChange("temporada", event.target.value)}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="FECHA DE INICIO">
            <input
              type="date"
              value={form.fechaInicio}
              onChange={(event) => onChange("fechaInicio", event.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="FECHA DE FIN">
            <input
              type="date"
              value={form.fechaFin}
              onChange={(event) => onChange("fechaFin", event.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="ORGANIZADOR">
          <input
            type="text"
            value={form.organizador}
            onChange={(event) => onChange("organizador", event.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="SEDE PRINCIPAL">
          <input
            type="text"
            value={form.sedePrincipal}
            onChange={(event) => onChange("sedePrincipal", event.target.value)}
            style={inputStyle}
          />
        </Field>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onSave}
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: saved ? PALETTE.success : CU,
          color: "#FFF",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: FONT,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        {saved ? (
          <>
            <Check size={14} />
            Guardado
          </>
        ) : (
          "Guardar cambios"
        )}
      </motion.button>
    </SectionCard>
  );
}

export function SettingsMediaPanel({
  tournament,
  uploading,
  perfilInputRef,
  portadaInputRef,
  onProfileSelect,
  onCoverSelect,
}) {
  return (
    <SectionCard icon={Image} title="IDENTIDAD VISUAL">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <Field label="LOGO / PERFIL">
            <div
              onClick={() => !uploading.perfil && perfilInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && !uploading.perfil) {
                  event.preventDefault();
                  perfilInputRef.current?.click();
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
                border: `2px dashed ${BORDER}`,
                borderRadius: 12,
                padding: 16,
                cursor: uploading.perfil ? "wait" : "pointer",
                background: tournament?.perfil ? "rgba(194,122,66,0.04)" : "transparent",
                minHeight: 170,
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {tournament?.perfil ? (
                <img
                  src={tournament.perfil}
                  alt="Perfil"
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `1px solid ${BORDER}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    background: BG,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Settings size={32} color={BORDER} />
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>
                {uploading.perfil
                  ? "Subiendo logo..."
                  : tournament?.perfil
                    ? "Cambiar logo"
                    : "Elegir archivo"}
              </div>
              <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>
                PNG, JPG o WEBP. Haz clic para cargar o reemplazar el logo del torneo.
              </div>
              <input
                ref={perfilInputRef}
                type="file"
                accept="image/*"
                disabled={uploading.perfil}
                onChange={onProfileSelect}
                style={{ display: "none" }}
              />
            </div>
          </Field>
        </div>

        <div>
          <Field label="FOTO DE PORTADA">
            <div
              onClick={() => !uploading.portada && portadaInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && !uploading.portada) {
                  event.preventDefault();
                  portadaInputRef.current?.click();
                }
              }}
              style={{
                border: `2px dashed ${BORDER}`,
                borderRadius: 12,
                height: 140,
                background: tournament?.portada
                  ? `url(${tournament.portada}) center/cover`
                  : BG,
                position: "relative",
                overflow: "hidden",
                cursor: uploading.portada ? "wait" : "pointer",
              }}
            >
              <input
                ref={portadaInputRef}
                type="file"
                accept="image/*"
                disabled={uploading.portada}
                onChange={onCoverSelect}
                style={{ display: "none" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  background: "rgba(0,0,0,0.4)",
                  color: "#FFF",
                  fontSize: 10,
                  textAlign: "center",
                  padding: "4px 0",
                }}
              >
                {uploading.portada ? "Subiendo..." : "Clic para cambiar portada"}
              </div>
            </div>
          </Field>
        </div>
      </div>
    </SectionCard>
  );
}

export function SettingsDetailsPanel({
  form,
  tournament,
  onChange,
  onRulebookSelect,
}) {
  return (
    <SectionCard icon={Info} title="INFORMACIÓN DETALLADA">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="DESCRIPCIÓN">
          <textarea
            value={form.descripcion}
            onChange={(event) => onChange("descripcion", event.target.value)}
            placeholder="Habla sobre el torneo, reglas básicas, etc..."
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="CONTACTO" icon={Phone}>
            <input
              type="text"
              value={form.contacto}
              onChange={(event) => onChange("contacto", event.target.value)}
              placeholder="WhatsApp / Celular"
              style={inputStyle}
            />
          </Field>
          <Field label="PREMIOS" icon={Gift}>
            <input
              type="text"
              value={form.premios}
              onChange={(event) => onChange("premios", event.target.value)}
              placeholder="Ej. $1.000.000 + Trofeo"
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="VISIBILIDAD" icon={Shield}>
          <div style={{ display: "flex", gap: 10 }}>
            {["publico", "privado"].map((visibility) => (
              <button
                key={visibility}
                type="button"
                onClick={() => onChange("visibilidad", visibility)}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  border: `1px solid ${form.visibilidad === visibility ? CU : BORDER}`,
                  background: form.visibilidad === visibility ? CU_DIM : BG,
                  color: form.visibilidad === visibility ? CU : MUTED,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {visibility}
              </button>
            ))}
          </div>
        </Field>

        <Field label="REGLAMENTO (PDF/DOC)">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {tournament?.reglamentoUrl ? (
              <a
                href={tournament.reglamentoUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  color: CU,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Ver reglamento actual
              </a>
            ) : (
              <span style={{ fontSize: 12, color: MUTED }}>
                No se ha subido reglamento.
              </span>
            )}
            <input type="file" onChange={onRulebookSelect} style={{ fontSize: 10 }} />
          </div>
        </Field>
      </div>
    </SectionCard>
  );
}

export function SettingsSponsorsPanel({
  sponsors,
  onRemoveSponsor,
  onAddSponsor,
}) {
  return (
    <SectionCard icon={Users} title="PATROCINADORES">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            style={{
              position: "relative",
              width: 60,
              height: 60,
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              background: `url(${sponsor.logo}) center/contain no-repeat ${BG}`,
            }}
          >
            <button
              type="button"
              onClick={() => onRemoveSponsor(sponsor.id)}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#EF4444",
                color: "#FFF",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}

        <label
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            border: `2px dashed ${BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: MUTED,
          }}
        >
          <Plus size={20} />
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={onAddSponsor} />
        </label>
      </div>

      <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>
        Añade marcas que patrocinan el torneo. Se mostrarán en un banner dinámico en la vista pública.
      </p>
    </SectionCard>
  );
}

export function SettingsPublicPagePanel({
  isPublished,
  publicUrl,
  copied,
  onCopy,
  onUnpublish,
  onPublish,
}) {
  return (
    <SectionCard icon={Globe} title="VISTA PÚBLICA">
      {isPublished ? (
        <>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, lineHeight: 1.6 }}>
            El torneo es público. Cualquiera con el enlace puede ver el fixture y la tabla de posiciones.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              title="Abrir vista pública"
              style={{
                flex: 1,
                background: BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 11,
                color: TEXT,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              {publicUrl}
            </a>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: copied ? PALETTE.successDim : CU_DIM,
                color: copied ? PALETTE.success : CU,
                border: `1px solid ${copied ? PALETTE.successBorder : CU_BOR}`,
                borderRadius: 8,
                padding: "0 14px",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: FONT,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {copied ? (
                <>
                  <Check size={12} />
                  Copiado
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copiar
                </>
              )}
            </motion.button>
          </div>
          <button
            type="button"
            onClick={onUnpublish}
            style={{
              marginTop: 12,
              background: "none",
              border: "none",
              color: MUTED,
              fontSize: 11,
              fontFamily: FONT,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Despublicar torneo
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 14, lineHeight: 1.6 }}>
            Publica el torneo para generar una URL pública que puedes compartir con equipos y seguidores.
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPublish}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: CU,
              color: "#FFF",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            <Globe size={14} />
            Publicar torneo
          </motion.button>
        </>
      )}
    </SectionCard>
  );
}
