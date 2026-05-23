import { motion } from "framer-motion";
import { ArrowRight, LogIn, Activity, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";
import { usePageTitle } from "../../shared/hooks/usePageTitle";

export default function TemporaryPortal() {
  usePageTitle("Portal de Acceso — ALTTEZ");
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: F.body,
      padding: 24,
      background: "#0A0A0A"
    }}>
      
      {/* Background Image with Heavy Overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1518605368461-1e1e114051bf?q=80&w=2000&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 0,
        opacity: 0.4
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at center, transparent 0%, #0A0A0A 80%)",
        zIndex: 1
      }} />
      
      {/* Content Container */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1000, display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 80 }}
        >
          <img src="/branding/alttez-symbol-transparent.png" alt="ALTTEZ" style={{ height: 40, filter: "invert(1)" }} />
          <span style={{ color: "white", fontSize: 28, fontWeight: 800, fontFamily: F.display, letterSpacing: "-0.04em" }}>ALTTEZ</span>
        </motion.div>

        {/* Portal Access Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          width: "100%"
        }}>
          
          {/* CRM Access */}
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            onClick={() => router.push("/auth/login")}
            className="portal-card"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 24,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.3s cubic-bezier(0.32,0.72,0,1)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div className="card-glow" style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(206,137,70,0.15) 0%, transparent 60%)", opacity: 0, transition: "opacity 0.3s" }} />
            
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(206,137,70,0.1)", color: "#CE8946", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(206,137,70,0.2)", position: "relative", zIndex: 2 }}>
              <Activity size={24} />
            </div>
            
            <h2 style={{ color: "white", fontSize: 24, fontWeight: 800, fontFamily: F.display, marginBottom: 12, position: "relative", zIndex: 2 }}>ALTTEZ CRM</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.5, marginBottom: 32, position: "relative", zIndex: 2 }}>Acceso al sistema de gestión deportiva y logística para tu club o academia.</p>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "white", fontWeight: 700, fontSize: 15, position: "relative", zIndex: 2 }}>
              Iniciar Sesión <ArrowRight size={18} />
            </div>
          </motion.button>

          {/* Torneos Access */}
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            onClick={() => router.push("/auth/login")}
            className="portal-card"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 24,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.3s cubic-bezier(0.32,0.72,0,1)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div className="card-glow" style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(47,165,111,0.15) 0%, transparent 60%)", opacity: 0, transition: "opacity 0.3s" }} />
            
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(47,165,111,0.1)", color: "#2FA56F", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: "1px solid rgba(47,165,111,0.2)", position: "relative", zIndex: 2 }}>
              <Trophy size={24} />
            </div>
            
            <h2 style={{ color: "white", fontSize: 24, fontWeight: 800, fontFamily: F.display, marginBottom: 12, position: "relative", zIndex: 2 }}>ALTTEZ Torneos</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.5, marginBottom: 32, position: "relative", zIndex: 2 }}>Acceso al gestor de competiciones, cuadros y portal público en vivo.</p>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "white", fontWeight: 700, fontSize: 15, position: "relative", zIndex: 2 }}>
              Iniciar Sesión <ArrowRight size={18} />
            </div>
          </motion.button>

        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: 60, color: "rgba(255,255,255,0.4)", fontSize: 14 }}
        >
          &copy; {new Date().getFullYear()} ALTTEZ. Todos los derechos reservados.
        </motion.div>

      </div>

      <style>{`
        .portal-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.3) !important;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4);
        }
        .portal-card:hover .card-glow {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
