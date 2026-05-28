"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MARKETING_BRAND as B, MARKETING_FONTS as F } from "../theme/brand";

const SERVICES = [
  {
    to: "/producto/alttezcrm",
    label: "ALTTEZ CRM",
    tag: "Para Clubes",
  },
  {
    to: "/torneos",
    label: "ALTTEZ Torneos",
    tag: "Para Organizadores",
  }
];

export default function PortalLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => setIsOpen(false));
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: B.bg, position: "relative" }}>
      
      {/* CSS Noise Overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none",
        backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
        opacity: 0.03, mixBlendMode: "overlay"
      }} />

      {/* Fluid Island Nav */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          position: "fixed",
          top: 24,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none", // Allow clicking through the empty space
        }}
      >
        <div style={{
          pointerEvents: "auto",
          background: scrolled ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.9)",
          backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          borderRadius: 999,
          border: `1px solid ${scrolled ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)'}`,
          boxShadow: scrolled ? "0 16px 40px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)" : "0 4px 12px rgba(0,0,0,0.02)",
          padding: "8px 8px 8px 24px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          transition: "all 0.4s cubic-bezier(0.32,0.72,0,1)"
        }}>
          
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/branding/alttez-symbol-transparent.png" alt="ALTTEZ" style={{ height: 20 }} />
            <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 16, color: B.text, letterSpacing: "-0.04em" }}>ALTTEZ.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ display: "none", alignItems: "center", gap: 28 }}>
            <Link href="/" style={navLinkStyle(pathname === "/")}>Inicio</Link>
            
            <div className="nav-dropdown-trigger" style={{ position: "relative", cursor: "pointer", ...navLinkStyle(pathname.includes("/producto") || pathname.includes("/torneos")) }}>
              Ecosistema
              <div className="nav-dropdown-menu" style={{
                position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                paddingTop: 20, opacity: 0, visibility: "hidden", transition: "all 0.2s ease"
              }}>
                <div style={{
                  background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
                  border: "1px solid rgba(0,0,0,0.06)", borderRadius: 20,
                  boxShadow: "0 24px 64px rgba(0,0,0,0.08)", padding: 8,
                  width: 280, display: "flex", flexDirection: "column", gap: 4
                }}>
                  {SERVICES.map((s) => (
                    <Link key={s.to} href={s.to} style={{
                      padding: "14px 16px", borderRadius: 12, textDecoration: "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      color: B.text, transition: "background 0.2s"
                    }} className="nav-dropdown-item">
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F.body }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: B.textMuted, marginTop: 2 }}>{s.tag}</div>
                      </div>
                      <ArrowUpRight size={14} color={B.textMuted} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/quienes-somos" style={navLinkStyle(pathname === "/quienes-somos")}>Compañía</Link>
            <Link href="/precios" style={navLinkStyle(pathname === "/precios")}>Precios</Link>
          </nav>

          <div className="desktop-nav" style={{ display: "none", alignItems: "center", gap: 12 }}>
            <Link href="/auth/login" style={{
              color: B.text, fontSize: 13, fontWeight: 700, textDecoration: "none", padding: "8px 16px"
            }}>Log in</Link>
            <button 
              className="btn-premium"
              onClick={() => router.push("/contacto")}
              style={{
                background: B.text, color: "white", border: "none", padding: "10px 20px",
                borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "all 0.3s cubic-bezier(0.32,0.72,0,1)"
              }}
            >
              Contactar ventas
            </button>
          </div>

          <button className="mobile-toggle" onClick={() => setIsOpen(true)} style={{
            background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, padding: 0, cursor: "pointer"
          }}>
            <Menu size={20} color={B.text} />
          </button>
        </div>
      </motion.header>

      {/* Massive Full-Screen Mobile Menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(255,255,255,0.9)", backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              display: "flex", flexDirection: "column"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", padding: "32px 32px" }}>
              <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 16, color: B.text, letterSpacing: "-0.04em" }}>ALTTEZ.</span>
              <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", padding: 8 }}>
                <X size={24} color={B.text} />
              </button>
            </div>
            
            <div style={{ flex: 1, padding: "0 32px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
              {[
                { to: "/", label: "Inicio" },
                { to: "/producto/alttezcrm", label: "ALTTEZ CRM" },
                { to: "/torneos", label: "ALTTEZ Torneos" },
                { to: "/quienes-somos", label: "Compañía" },
                { to: "/precios", label: "Precios" },
                { to: "/contacto", label: "Contacto" }
              ].map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link href={item.to} onClick={() => setIsOpen(false)} style={{
                    fontSize: 32, fontWeight: 800, fontFamily: F.display, color: B.text, textDecoration: "none",
                    letterSpacing: "-0.04em"
                  }}>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ flex: 1 }}>
        {children}
      </main>

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        .nav-dropdown-trigger:hover .nav-dropdown-menu {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateX(-50%) translateY(4px) !important;
        }
        .nav-dropdown-item:hover {
          background: rgba(0,0,0,0.03) !important;
        }
        .btn-premium:hover {
          transform: scale(0.97);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
}

function navLinkStyle(isActive) {
  return {
    fontSize: 13,
    fontWeight: 600,
    color: isActive ? B.text : B.textMuted,
    textDecoration: "none",
    transition: "color 0.2s",
    fontFamily: F.body
  };
}
