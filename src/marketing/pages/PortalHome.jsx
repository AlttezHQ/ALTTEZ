/**
 * @component PortalHome
 * @description Home del Portal Corporativo ALTTEZ.
 * @version 3.0 — Dual Ecosystem + Bento Box Features
 */
import HeroSection from "../sections/HeroSection";
import DualEcosystemSection from "../sections/DualEcosystemSection";
import BentoFeatures from "../sections/BentoFeatures";

export default function PortalHome() {
  return (
    <>
      <HeroSection />
      <DualEcosystemSection />
      <BentoFeatures />
    </>
  );
}
