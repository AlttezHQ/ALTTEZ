import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import {
  SettingsBasicInfoPanel,
  SettingsDetailsPanel,
  SettingsMediaPanel,
  SettingsPublicPagePanel,
  SettingsSponsorsPanel,
} from "../components/settings/SettingsPanels";
import { selectSettingsPageViewModel } from "../domain/settings/settingsSelectors";
import { useTorneosStore } from "../store/useTorneosStore";
import { uploadImage } from "../utils/storageHelper";
import { PALETTE } from "../../../shared/tokens/palette";

const TEXT = PALETTE.text;
const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
const EASE = [0.22, 1, 0.36, 1];
const SPORTS = ["Fútbol", "Básquet", "Vóleibol", "Tenis", "Pádel", "Rugby", "Otro"];

function AjustesPageContent({
  torneoActivoId,
  viewModel,
  actualizarTorneo,
  publicarTorneo,
}) {
  const [form, setForm] = useState(viewModel.formDefaults);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState({
    perfil: false,
    portada: false,
    sponsor: false,
  });

  const perfilInputRef = useRef(null);
  const portadaInputRef = useRef(null);

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    await actualizarTorneo(torneoActivoId, { ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    if (!viewModel.publicUrl) return;
    navigator.clipboard.writeText(viewModel.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = async (file, folder, field) => {
    if (!file) return;
    setUploading((current) => ({ ...current, [field]: true }));
    try {
      const url = await uploadImage(file, folder);
      if (url) {
        await actualizarTorneo(viewModel.tournament.id, { [field]: url });
      }
    } finally {
      setUploading((current) => ({ ...current, [field]: false }));
    }
  };

  const handleRulebookSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await uploadImage(file, "docs");
    if (url) {
      await actualizarTorneo(viewModel.tournament.id, { reglamentoUrl: url });
    }
  };

  const handleRemoveSponsor = async (sponsorId) => {
    await actualizarTorneo(viewModel.tournament.id, {
      patrocinadores: viewModel.sponsors.filter((item) => item.id !== sponsorId),
    });
  };

  const handleAddSponsor = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading((current) => ({ ...current, sponsor: true }));
    try {
      const url = await uploadImage(file, "sponsors");
      if (url) {
        await actualizarTorneo(viewModel.tournament.id, {
          patrocinadores: [
            ...viewModel.sponsors,
            { id: Date.now().toString(), nombre: file.name, logo: url },
          ],
        });
      }
    } finally {
      setUploading((current) => ({ ...current, sponsor: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{ fontFamily: FONT, maxWidth: 560 }}
    >
      <h2
        style={{
          margin: "0 0 20px",
          fontSize: 20,
          fontWeight: 700,
          color: TEXT,
          letterSpacing: "-0.02em",
        }}
      >
        Ajustes del torneo
      </h2>

      <SettingsBasicInfoPanel
        form={form}
        sports={SPORTS}
        saved={saved}
        onChange={handleFormChange}
        onSave={handleSave}
      />

      <SettingsMediaPanel
        tournament={viewModel.tournament}
        uploading={uploading}
        perfilInputRef={perfilInputRef}
        portadaInputRef={portadaInputRef}
        onProfileSelect={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          await handleImageUpload(file, "perfil", "perfil");
        }}
        onCoverSelect={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          await handleImageUpload(file, "portada", "portada");
        }}
      />

      <SettingsDetailsPanel
        form={form}
        tournament={viewModel.tournament}
        onChange={handleFormChange}
        onRulebookSelect={handleRulebookSelect}
      />

      <SettingsSponsorsPanel
        sponsors={viewModel.sponsors}
        onRemoveSponsor={handleRemoveSponsor}
        onAddSponsor={handleAddSponsor}
      />

      <SettingsPublicPagePanel
        isPublished={viewModel.isPublished}
        publicUrl={viewModel.publicUrl}
        copied={copied}
        onCopy={handleCopy}
        onUnpublish={async () =>
          actualizarTorneo(torneoActivoId, { publicado: false, estado: "borrador" })
        }
        onPublish={async () => publicarTorneo(torneoActivoId)}
      />
    </motion.div>
  );
}

export default function AjustesPage({ onGoTorneos }) {
  const torneoActivoId = useTorneosStore((state) => state.torneoActivoId);
  const torneos = useTorneosStore((state) => state.torneos);
  const actualizarTorneo = useTorneosStore((state) => state.actualizarTorneo);
  const publicarTorneo = useTorneosStore((state) => state.publicarTorneo);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const viewModel = useMemo(
    () => selectSettingsPageViewModel({ torneoActivoId, torneos, origin }),
    [origin, torneoActivoId, torneos],
  );

  if (!torneoActivoId || !viewModel.tournament) {
    return (
      <ModuleEmptyState
        icon={Settings}
        title="Selecciona un torneo"
        subtitle="Abre un torneo para ver y editar sus ajustes."
        ctaLabel="Ver torneos"
        onCta={onGoTorneos}
      />
    );
  }

  return (
    <AjustesPageContent
      key={viewModel.tournament.id}
      torneoActivoId={torneoActivoId}
      viewModel={viewModel}
      actualizarTorneo={actualizarTorneo}
      publicarTorneo={publicarTorneo}
    />
  );
}
