import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import DashboardPreview from "./DashboardPreview";

export default function HeroSection() {
  return (
    <section className="relative pt-[180px] pb-[120px] bg-grafito overflow-hidden" style={{
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px"
    }}>
      {/* Soft Structuralism Radial Mesh */}
      <div 
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] opacity-30 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at top, var(--color-cobre) 0%, transparent 60%)`,
        }} 
      />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-marfil/70 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-cobre" />
              El Nuevo Estándar Operativo
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="m-0 text-[clamp(56px,9vw,110px)] font-[var(--font-sora)] font-extrabold text-marfil leading-[0.9] tracking-[-0.05em] max-w-[1100px]"
          >
            Menos gestión.<br/>
            <span className="text-cobre">Más fútbol.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="mt-8 mb-12 text-[clamp(18px,2.5vw,24px)] text-marfil/70 leading-relaxed max-w-[680px]"
          >
            El sistema operativo definitivo que automatiza la logística de tu club y la gestión de tus competiciones.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="flex gap-4 items-center"
          >
            <button className="group flex items-center gap-4 py-2 pr-2 pl-8 bg-marfil text-grafito border-none rounded-full text-base font-bold cursor-pointer transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:scale-[0.98]">
              Solicitar Demo
              <div className="w-10 h-10 rounded-full bg-grafito/10 flex items-center justify-center transition-all duration-300 group-hover:bg-grafito group-hover:text-marfil">
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-[0.5px]" />
              </div>
            </button>

            <button className="flex items-center gap-3 px-8 py-4 bg-transparent text-marfil border border-white/20 rounded-full text-base font-bold cursor-pointer transition-colors hover:bg-white/5">
              <Play size={18} />
              Ver plataforma
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview Injection */}
        <div className="mt-[100px]">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
