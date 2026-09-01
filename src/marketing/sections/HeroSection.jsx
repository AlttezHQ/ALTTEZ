"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardPreview from "./DashboardPreview";

const PROOF = [
  "Clubes y competiciones en una sola infraestructura",
  "Operación privada y portales públicos conectados",
  "Datos, calendario y gestión con trazabilidad",
];

export default function HeroSection() {
  const router = useRouter();
  return (
    <section className="alttez-hero">
      <div className="alttez-hero__grid" aria-hidden="true" />
      <div className="alttez-hero__frame">
        <div className="alttez-hero__copy">
          <p className="alttez-hero__kicker">Infraestructura operativa deportiva</p>
          <h1>El deporte exige<span>control.</span></h1>
          <p className="alttez-hero__lede">ALTTEZ conecta la gestión de clubes, competiciones y operación deportiva en un sistema preparado para trabajar todos los días.</p>
          <div className="alttez-hero__actions">
            <button className="alttez-hero__primary" onClick={() => router.push("/contacto?origen=hero")}>
              Hablar con ALTTEZ <span aria-hidden="true"><ArrowRight size={17} /></span>
            </button>
            <button className="alttez-hero__secondary" onClick={() => document.getElementById("ecosistema-alttez")?.scrollIntoView({ behavior: "smooth" })}>Explorar el ecosistema</button>
          </div>
          <ul className="alttez-hero__proof" aria-label="Capacidades principales">
            {PROOF.map((item) => <li key={item}><CheckCircle2 size={15} aria-hidden="true" />{item}</li>)}
          </ul>
        </div>
        <div className="alttez-hero__product" aria-label="Vista del ecosistema ALTTEZ">
          <div className="alttez-hero__product-label"><span>ALTTEZ / Ecosistema</span><span>Operación conectada</span></div>
          <DashboardPreview />
        </div>
      </div>
      <style>{`
        .alttez-hero{position:relative;width:100vw;max-width:100%;min-height:100dvh;overflow:hidden;background:#111315;color:#F5F7F8;padding:clamp(132px,14vw,190px) 0 clamp(72px,8vw,112px)}
        .alttez-hero__grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(245,247,248,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(245,247,248,.045) 1px,transparent 1px);background-size:64px 64px;mask-image:linear-gradient(to bottom,black 0%,transparent 88%)}
        .alttez-hero__frame{position:relative;width:calc(100% - 48px);max-width:1480px;margin:0 auto;display:grid;grid-template-columns:minmax(340px,.82fr) minmax(560px,1.18fr);gap:clamp(48px,6vw,104px);align-items:center}.alttez-hero__copy{max-width:640px;min-width:0}
        .alttez-hero__kicker{margin:0 0 28px;color:#C27A42;font:600 12px/1 var(--font-inter),sans-serif;letter-spacing:.13em;text-transform:uppercase}.alttez-hero h1{margin:0;font-family:var(--font-sora),sans-serif;font-size:clamp(58px,6.6vw,108px);font-weight:700;line-height:.92;letter-spacing:-.06em;text-wrap:balance}.alttez-hero h1 span{display:block;color:#C27A42}.alttez-hero__lede{width:100%;max-width:590px;margin:34px 0 0;color:#B7BDC2;font:400 clamp(17px,1.45vw,21px)/1.6 var(--font-inter),sans-serif;text-wrap:pretty;overflow-wrap:anywhere}
        .alttez-hero__actions{display:flex;align-items:center;gap:12px;margin-top:38px}.alttez-hero__actions button{min-height:52px;border-radius:8px;font:650 14px/1 var(--font-inter),sans-serif;cursor:pointer;transition:transform 180ms cubic-bezier(.22,1,.36,1),background-color 180ms cubic-bezier(.22,1,.36,1),border-color 180ms cubic-bezier(.22,1,.36,1)}.alttez-hero__actions button:active{transform:scale(.98)}.alttez-hero__actions button:focus-visible{outline:3px solid rgba(194,122,66,.42);outline-offset:3px}
        .alttez-hero__primary{display:inline-flex;align-items:center;gap:18px;padding:5px 6px 5px 20px;border:1px solid #C27A42;background:#C27A42;color:#F5F7F8}.alttez-hero__primary span{width:40px;height:40px;display:grid;place-items:center;border-radius:5px;background:#111315;transition:transform 180ms cubic-bezier(.22,1,.36,1)}.alttez-hero__primary:hover{background:#D48E56;border-color:#D48E56}.alttez-hero__primary:hover span{transform:translateX(2px)}.alttez-hero__secondary{padding:0 20px;color:#F5F7F8;background:transparent;border:1px solid #3A3E42}.alttez-hero__secondary:hover{border-color:#747A80;background:#191C1F}
        .alttez-hero__proof{list-style:none;padding:26px 0 0;margin:34px 0 0;border-top:1px solid #303438;display:grid;gap:11px}.alttez-hero__proof li{display:flex;gap:10px;align-items:center;color:#92999F;font:500 12px/1.45 var(--font-inter),sans-serif}.alttez-hero__proof svg{color:#C27A42;flex:none}.alttez-hero__product{min-width:0}.alttez-hero__product-label{display:flex;justify-content:space-between;margin-bottom:12px;color:#7E858B;font:600 10px/1 var(--font-inter),sans-serif;letter-spacing:.1em;text-transform:uppercase}
        @media(max-width:1050px){.alttez-hero__frame{grid-template-columns:minmax(0,1fr)}.alttez-hero__copy{max-width:760px}}@media(max-width:640px){.alttez-hero{padding-top:116px}.alttez-hero__frame{width:calc(100vw - 32px);max-width:calc(100vw - 32px);gap:48px}.alttez-hero h1{font-size:clamp(50px,17vw,72px)}.alttez-hero__actions{width:100%;align-items:stretch;flex-direction:column}.alttez-hero__actions button{width:100%;max-width:100%;justify-content:center}.alttez-hero__primary{justify-content:space-between!important}.alttez-hero__product-label span:last-child{display:none}}@media(prefers-reduced-motion:reduce){.alttez-hero *{scroll-behavior:auto!important;transition-duration:.01ms!important}}
      `}</style>
    </section>
  );
}
