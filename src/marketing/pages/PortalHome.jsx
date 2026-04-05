/**
 * @component PortalHome
 * @description Home del Portal Corporativo ALTTEZ.
 * SOLO Hero + Ecosistema. Servicios y Journal viven en sus propias rutas.
 * @author @Arquitecto (Julian) + @Desarrollador (Andres)
 * @version 2.0 — Multi-ruta (veto v1 one-page)
 */
import HeroSection from "../sections/HeroSection";
import EcosystemSection from "../sections/EcosystemSection";

export default function PortalHome() {
  return (
    <>
      <HeroSection />
      <EcosystemSection />
    </>
  );
}
