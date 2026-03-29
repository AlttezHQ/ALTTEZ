/**
 * @component PortalLayout
 * @description Layout compartido del Portal Corporativo Elevate.
 * Navbar sticky glassmorphism con 3 nodos principales:
 *   "Quiénes Somos" | "Servicios" (dropdown) | "Comunícate con nosotros"
 * Usa React Router <Outlet> para renderizar las sub-rutas.
 *
 * Mobile (<768px): Hamburger menu + Side Drawer con AnimatePresence
 * Desktop (>=768px): Navbar horizontal original sin cambios
 *
 * @author @Arquitecto (Carlos) v4.0 — mobile-first responsive
 */
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Suspense } from "react";
import { PALETTE as C } from "../../constants/palette";
import { useResponsive } from "../../hooks/useResponsive";
import OfflineBanner from "../ui/OfflineBanner";
import UpdateToast from "../ui/UpdateToast";
import InstallAppBanner from "../ui/InstallAppBanner";

// ── Animation variants ──────────────────────────────────────────────────────
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { type: "spring", stiffness: 400, damping: 35 },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 28 },
  },
};

const dropdownItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 350, damping: 28, delay: i * 0.05 },
  }),
};

const drawerVariants = {
  hidden: {
    x: "-100%",
    transition: { type: "spring", stiffness: 380, damping: 38 },
  },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 380, damping: 38 },
  },
};

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

// ── Servicios dropdown data ──────────────────────────────────────────────────
const SERVICES = [
  {
    to: "/servicios/sports-crm",
    label: "Elevate Sports CRM",
    description: "Plataforma integral de gestión deportiva: plantilla, entrenamientos, finanzas y táctica.",
    tag: "Producto principal",
    tagColor: C.neon,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke={C.neon} strokeWidth="1.5"/>
        <path d="M7 12h10M7 8h6M7 16h4" stroke={C.neon} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: "/journal",
    label: "Journal",
    description: "Bitácora de evolución: seguimiento de lesiones, notas de partido y análisis técnico.",
    tag: "Nuevo",
    tagColor: C.purple,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={C.purple} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={C.purple} strokeWidth="1.5"/>
        <path d="M9 7h6M9 11h4" stroke={C.purple} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const LoadingFallback = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 24, height: 24,
        border: `2px solid ${C.neon}`, borderTop: "2px solid transparent",
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
        margin: "0 auto 12px",
      }} />
      <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "2px" }}>
        Cargando
      </div>
    </div>
  </div>
);

// Footer: lista plana de todas las rutas del portal
const FOOTER_LINKS = [
  { to: "/",                     label: "Home",             exact: true  },
  { to: "/quienes-somos",        label: "Quiénes Somos",   exact: false },
  { to: "/servicios/sports-crm", label: "Sports CRM",      exact: false },
  { to: "/journal",              label: "Journal",          exact: false },
  { to: "/contacto",             label: "Contacto",         exact: false },
];

function NavItem({ to, label, exact, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      style={({ isActive }) => ({
        position: "relative",
        padding: "8px 0",
        fontSize: 12,
        fontWeight: isActive ? 600 : 400,
        letterSpacing: "0.5px",
        color: isActive ? "white" : C.textMuted,
        textDecoration: "none",
        cursor: "pointer",
        transition: "color 0.2s",
        minHeight: "auto",
        display: "inline-flex",
        alignItems: "center",
      })}
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              style={{
                position: "absolute",
                bottom: -1,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, ${C.neon}, #7C3AED)`,
                borderRadius: 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/**
 * @component ServicesDropdown
 * @description Trigger "Servicios" + panel desplegable glassmorphism (desktop only).
 */
function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isServicesActive = location.pathname.startsWith("/servicios");

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "8px 0",
          fontSize: 12,
          fontWeight: isServicesActive ? 600 : 400,
          letterSpacing: "0.5px",
          color: open || isServicesActive ? "white" : C.textMuted,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "color 0.2s",
          minHeight: "auto",
          height: "auto",
        }}
      >
        Servicios
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ flexShrink: 0, marginTop: 1 }}
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
        {isServicesActive && !open && (
          <motion.div
            layoutId="nav-indicator"
            style={{
              position: "absolute",
              bottom: -1, left: 0, right: 0,
              height: 2,
              background: `linear-gradient(90deg, ${C.neon}, #7C3AED)`,
              borderRadius: 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: 380,
              background: "rgba(12,12,20,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
              overflow: "hidden",
              zIndex: 200,
            }}
          >
            <div style={{
              padding: "14px 18px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                fontSize: 9, textTransform: "uppercase", letterSpacing: "2.5px",
                color: C.textHint, fontWeight: 600,
              }}>
                Nuestros productos
              </div>
            </div>

            <div style={{ padding: "8px 10px 10px" }}>
              {SERVICES.map((service, i) => (
                <motion.div
                  key={service.to}
                  custom={i}
                  variants={dropdownItemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => { navigate(service.to); setOpen(false); }}
                  whileHover={{
                    background: "rgba(255,255,255,0.05)",
                    transition: { duration: 0.15 },
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "12px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    minHeight: "auto",
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {service.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600, color: "white",
                        letterSpacing: "-0.2px",
                      }}>
                        {service.label}
                      </span>
                      <span style={{
                        fontSize: 8, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "1.5px", color: service.tagColor,
                        background: `${service.tagColor}18`,
                        border: `1px solid ${service.tagColor}40`,
                        padding: "1px 6px", borderRadius: 4, flexShrink: 0,
                      }}>
                        {service.tag}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 11, color: C.textMuted, lineHeight: 1.5,
                      letterSpacing: "0.1px",
                    }}>
                      {service.description}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 4, opacity: 0.35 }}>
                    <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              ))}
            </div>

            <div style={{
              padding: "10px 18px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { navigate("/crm"); setOpen(false); }}
                style={{
                  width: "100%",
                  padding: "9px 0",
                  fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "1.5px",
                  background: `linear-gradient(90deg, ${C.neon}22, rgba(124,58,237,0.2))`,
                  color: C.neon,
                  border: `1px solid ${C.neon}40`,
                  borderRadius: 7,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.2s",
                  minHeight: "auto",
                }}
              >
                Acceder al CRM
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @component HamburgerIcon
 * @description Animated 3-line icon for mobile menu toggle.
 */
function HamburgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <motion.line
        x1="3" y1="6" x2="19" y2="6"
        stroke="white" strokeWidth="1.8" strokeLinecap="round"
        animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      <motion.line
        x1="3" y1="11" x2="19" y2="11"
        stroke="white" strokeWidth="1.8" strokeLinecap="round"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.18 }}
      />
      <motion.line
        x1="3" y1="16" x2="19" y2="16"
        stroke="white" strokeWidth="1.8" strokeLinecap="round"
        animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </svg>
  );
}

/**
 * @component MobileDrawer
 * @description Side drawer for mobile navigation.
 * Nav items stacked vertically. Servicios expands inline.
 * CTA "Acceder al CRM" pinned at bottom.
 */
function MobileDrawer({ open, onClose, navigate, location }) {
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    onClose();
    setServicesOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const isServicesActive = location.pathname.startsWith("/servicios");

  const drawerLinkStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    padding: "14px 24px",
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    letterSpacing: "0.5px",
    color: isActive ? "white" : C.textMuted,
    textDecoration: "none",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    minHeight: 44,
    transition: "background 0.15s, color 0.15s",
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            className="elv-drawer-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.nav
            key="drawer-panel"
            className="elv-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{
              background: "rgba(10,10,18,0.98)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              borderRight: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              paddingTop: "calc(56px + var(--safe-top))",
              paddingBottom: "var(--safe-bottom)",
            }}
          >
            {/* Nav items — scrollable */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {/* Quiénes Somos */}
              <NavLink
                to="/quienes-somos"
                style={({ isActive }) => drawerLinkStyle(isActive)}
                onClick={onClose}
              >
                Quiénes Somos
              </NavLink>

              {/* Servicios inline expansion */}
              <div>
                <button
                  onClick={() => setServicesOpen((v) => !v)}
                  style={{
                    ...drawerLinkStyle(isServicesActive),
                    width: "100%",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span>Servicios</span>
                  <motion.svg
                    animate={{ rotate: servicesOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    width="14" height="14" viewBox="0 0 12 12" fill="none"
                    style={{ flexShrink: 0, opacity: 0.6 }}
                  >
                    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      style={{ overflow: "hidden", background: "rgba(255,255,255,0.02)" }}
                    >
                      {SERVICES.map((service) => (
                        <div
                          key={service.to}
                          onClick={() => { navigate(service.to); onClose(); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "14px 24px 14px 28px",
                            cursor: "pointer",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            minHeight: 44,
                          }}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {service.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "white", letterSpacing: "-0.1px" }}>
                              {service.label}
                            </div>
                            <div style={{ fontSize: 10, color: service.tagColor, marginTop: 2 }}>
                              {service.tag}
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comunícate */}
              <NavLink
                to="/contacto"
                style={({ isActive }) => drawerLinkStyle(isActive)}
                onClick={onClose}
              >
                Comunícate con nosotros
              </NavLink>
            </div>

            {/* CTA pinned at bottom */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { navigate("/crm"); onClose(); }}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  fontSize: 12, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "2px",
                  background: C.neon, color: "#0a0a0f",
                  border: "none", borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  minHeight: 48,
                }}
              >
                Acceder al CRM
              </motion.button>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isMobile }                = useResponsive();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)",
      color: "white",
      fontFamily: "'Barlow', 'Arial Narrow', Arial, sans-serif",
    }}>
      {/* ── PWA: Offline status + SW update + Install CTA ── */}
      <OfflineBanner />
      <UpdateToast />
      <InstallAppBanner />
      {/* ── Navbar Sticky Glassmorphism ── */}
      <motion.nav
        animate={{
          backgroundColor: scrolled ? "rgba(10,10,15,0.92)" : "rgba(10,10,15,0.6)",
          borderBottomColor: scrolled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, zIndex: 100,
          height: 56,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid",
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "0 16px" : "0 32px",
        }}
      >
        {/* Logo */}
        <NavLink
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: isMobile ? 0 : 40,
            flex: isMobile ? 1 : "none",
            minHeight: "auto",
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.neon}, #7C3AED)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#0a0a0f",
            boxShadow: `0 0 20px ${C.neonGlow}`,
            flexShrink: 0,
          }}>
            E
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontSize: 15, fontWeight: 800, letterSpacing: "2px", color: "white",
              fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
              lineHeight: 1,
            }}>
              ELEVATE
            </span>
            {!isMobile && (
              <span style={{
                fontSize: 8, fontWeight: 500, letterSpacing: "3px",
                color: C.textMuted, textTransform: "uppercase", lineHeight: 1,
                marginTop: 2,
              }}>
                Sports Technology
              </span>
            )}
          </div>
        </NavLink>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{
            display: "flex", alignItems: "center", gap: 28,
            flex: 1,
          }}>
            <NavItem to="/quienes-somos" label="Quiénes Somos" />
            <ServicesDropdown />
            <NavItem to="/contacto" label="Comunícate con nosotros" />
          </div>
        )}

        {/* Desktop CTA + Install pill */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <InstallAppBanner compact />
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${C.neonGlow}` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/crm")}
              style={{
                padding: "8px 24px",
                fontSize: 11, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "1.5px",
                background: C.neon, color: "#0a0a0f",
                border: "none", borderRadius: 6,
                cursor: "pointer",
                fontFamily: "'Barlow', Arial, sans-serif",
                minHeight: "auto",
              }}
            >
              Acceder
            </motion.button>
          </div>
        )}

        {/* Mobile hamburger button */}
        {isMobile && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={drawerOpen}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "auto",
              borderRadius: 6,
            }}
          >
            <HamburgerIcon open={drawerOpen} />
          </motion.button>
        )}
      </motion.nav>

      {/* ── Mobile Side Drawer ── */}
      <MobileDrawer
        open={drawerOpen && isMobile}
        onClose={() => setDrawerOpen(false)}
        navigate={navigate}
        location={location}
      />

      {/* ── Content Area ── */}
      <main style={{ paddingTop: 56 }}>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        padding: isMobile ? "32px 20px 24px" : "48px 32px 32px",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        flexWrap: "wrap",
        gap: isMobile ? 20 : 16,
      }}>
        <div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>
            Elevate &mdash; Transformando el deporte colombiano
          </div>
          <div style={{ fontSize: 10, color: C.textHint }}>
            &copy; 2026 Elevate Sports. Todos los derechos reservados.
          </div>
        </div>
        <div style={{
          display: "flex",
          gap: isMobile ? 16 : 20,
          flexWrap: "wrap",
        }}>
          {FOOTER_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              style={{
                fontSize: 11, color: C.textMuted,
                textDecoration: "none", letterSpacing: "0.5px",
                minHeight: "auto",
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </footer>
    </div>
  );
}
