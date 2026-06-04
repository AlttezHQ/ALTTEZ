"use client";

/**
 * @component ProposalsWorkspace
 * @description App INTERNA standalone de propuestas comerciales ALTTEZ.
 * Shell propio (sidebar + topbar) con 5 secciones: Dashboard, Propuestas,
 * Clientes, Analytics, Administrativo. Independiente del CRM — no comparte navegación.
 *
 * @version 1.1.0
 */

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { setProposalsClubId } from "../../shared/services/proposalsService";
import { MARFIL, SIDEBAR_WIDTH } from "./shell/proposalsTokens";
import ProposalsSidebar from "./shell/ProposalsSidebar";
import ProposalsTopbar from "./shell/ProposalsTopbar";
import ProposalsAdminModule from "./ProposalsAdminModule";
import ProposalsDashboard from "./sections/ProposalsDashboard";
import ProposalsClientes from "./sections/ProposalsClientes";
import ProposalsAnalytics from "./sections/ProposalsAnalytics";
import ProposalsAdministrativo from "./sections/ProposalsAdministrativo";

const TITLES = {
  dashboard: "Resumen",
  propuestas: "Propuestas comerciales",
  clientes: "Clientes",
  analytics: "Analytics",
  administrativo: "Administrativo",
};

const DEFAULT_SECTION = "dashboard";
const VALID_SECTIONS = new Set(Object.keys(TITLES));

export default function ProposalsWorkspace({ clubId, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const resolvedSection = VALID_SECTIONS.has(sectionParam) ? sectionParam : DEFAULT_SECTION;
  const [section, setSection] = useState(resolvedSection);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setSection(resolvedSection);
  }, [resolvedSection]);

  const handleSectionChange = (nextSection) => {
    setSection(nextSection);

    const params = new URLSearchParams(searchParams.toString());
    if (nextSection === DEFAULT_SECTION) {
      params.delete("section");
    } else {
      params.set("section", nextSection);
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  if (clubId) setProposalsClubId(clubId);

  return (
    <div style={{ minHeight: "100vh", background: MARFIL, position: "relative" }}>
      <ProposalsSidebar
        section={section}
        onSelect={handleSectionChange}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className="alttez-pworkspace"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <ProposalsTopbar title={TITLES[section] || "Propuestas"} onMenuClick={() => setMobileOpen(true)} />

        <div style={{ flex: 1, minHeight: 0 }}>
          {section === "dashboard"      && <ProposalsDashboard clubId={clubId} onGoToProposals={() => handleSectionChange("propuestas")} />}
          {section === "propuestas"     && <ProposalsAdminModule clubId={clubId} />}
          {section === "clientes"       && <ProposalsClientes clubId={clubId} />}
          {section === "analytics"      && <ProposalsAnalytics clubId={clubId} />}
          {section === "administrativo" && <ProposalsAdministrativo clubId={clubId} />}
        </div>
      </div>

      <style>{`
        .alttez-pworkspace { margin-left: ${SIDEBAR_WIDTH}px; }
        @media (max-width: 767px) { .alttez-pworkspace { margin-left: 0; } }
      `}</style>
    </div>
  );
}
