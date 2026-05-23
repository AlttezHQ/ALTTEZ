import { motion } from "framer-motion";

export default function AuthShell({ children, maxWidth = 1240 }) {
  return (
    <div className="min-h-screen bg-[#F6F1EA] flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
      {/* Grilla sutil de fondo */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "linear-gradient(#EDE8D0 1px, transparent 1px), linear-gradient(90deg, #EDE8D0 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 0%, transparent 80%)"
        }}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ width: "100%", maxWidth, position: "relative", zIndex: 2 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
