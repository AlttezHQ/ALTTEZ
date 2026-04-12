import { AnimatePresence, motion } from "framer-motion";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useResponsive } from "../../shared/hooks/useResponsive";
import OfflineBanner from "../../shared/ui/OfflineBanner";
import UpdateToast from "../../shared/ui/UpdateToast";
import InstallAppBanner from "../../shared/ui/InstallAppBanner";

const BRAND = {
  bg: "#05070B",
  bgSoft: "#0B1220",
  surface: "rgba(7, 11, 18, 0.92)",
  surfaceSoft: "rgba(10, 16, 28, 0.8)",
  primary: "#2F6BFF",
  primarySoft: "rgba(47, 107, 255, 0.14)",
  primaryGlow: "rgba(47, 107, 255, 0.3)",
  text: "#F5F7FA",
  textMuted: "rgba(226, 232, 240, 0.72)",
  textHint: "rgba(148, 163, 184, 0.68)",
  border: "rgba(148, 163, 184, 0.18)",
  borderStrong: "rgba(148, 163, 184, 0.3)",
};

const SERVICES = [
  {
    to: "/servicios/sports-crm",
    label: "ALTTEZ CRM",
    tag: "Core Platform",
    description: "Plantilla, entrenamiento, calendario, operación y administración en una sola capa operativa.",
  },
  {
    to: "/journal",
    label: "Journal",
    tag: "Insights",
    description: "Decisiones de producto, visión del deporte y análisis sobre operación deportiva moderna.",
  },
];

const FOOTER_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/quienes-somos", label: "Quiénes somos", exact: false },
  { to: "/servicios/sports-crm", label: "Plataforma", exact: false },
  { to: "/journal", label: "Journal", exact: false },
  { to: "/contacto", label: "Contacto", exact: false },
  { to: "/privacidad", label: "Privacidad", exact: false },
];

const WA_NUMBER = "573000000000";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola, quiero conocer ALTTEZ.")}`;

function LoadingFallback() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 24,
            height: 24,
            border: `2px solid ${BRAND.primary}`,
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        <div style={{ fontSize: 10, color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: "2px" }}>
          Inicializando
        </div>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: "linear-gradient(135deg, #0F172A 0%, #1D4ED8 54%, #60A5FA 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 20px ${BRAND.primaryGlow}`,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <img
        src="/branding/alttez-symbol-transparent.png"
        alt="ALTTEZ"
        style={{
          width: 18,
          height: 18,
          objectFit: "contain",
          filter: "invert(1) brightness(1.45) contrast(1.1)",
        }}
      />
    </div>
  );
}

function NavItem({ to, label, exact, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      style={({ isActive }) => ({
        position: "relative",
        color: isActive ? BRAND.text : BRAND.textMuted,
        textDecoration: "none",
        fontSize: 12,
        fontWeight: isActive ? 700 : 500,
        letterSpacing: "0.4px",
        padding: "8px 0",
      })}
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <motion.div
              layoutId="portal-nav-indicator"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -1,
                height: 2,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${BRAND.primary}, #93B4FF)`,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function ServicesDropdown() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = location.pathname.startsWith("/servicios") || location.pathname.startsWith("/journal");

  useEffect(() => {
    const handleOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((value) => !value)}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          color: open || active ? BRAND.text : BRAND.textMuted,
          fontSize: 12,
          fontWeight: active ? 700 : 500,
          letterSpacing: "0.4px",
        }}
      >
        Soluciones
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
        {active && !open && (
          <motion.div
            layoutId="portal-nav-indicator"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -1,
              height: 2,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${BRAND.primary}, #93B4FF)`,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            style={{
              position: "absolute",
              top: "calc(100% + 14px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: 410,
              padding: 10,
              borderRadius: 18,
              background: "rgba(7, 11, 18, 0.97)",
              border: `1px solid ${BRAND.border}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              zIndex: 120,
            }}
          >
            <div style={{ padding: "12px 14px 10px", color: BRAND.textHint, fontSize: 9, textTransform: "uppercase", letterSpacing: "2px" }}>
              Ecosistema ALTTEZ
            </div>
            {SERVICES.map((service) => (
              <button
                key={service.to}
                onClick={() => {
                  navigate(service.to);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "44px 1fr",
                  gap: 14,
                  padding: "14px",
                  borderRadius: 14,
                  border: `1px solid ${BRAND.border}`,
                  background: "rgba(255,255,255,0.02)",
                  textAlign: "left",
                  cursor: "pointer",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: BRAND.primarySoft,
                    border: `1px solid rgba(96,165,250,0.22)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C7D6FF",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {service.label === "Journal" ? "J" : "A"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: BRAND.text, fontSize: 13, fontWeight: 700 }}>{service.label}</span>
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: 999,
                        fontSize: 8,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1.3px",
                        color: "#C7D6FF",
                        background: BRAND.primarySoft,
                        border: "1px solid rgba(96,165,250,0.18)",
                      }}
                    >
                      {service.tag}
                    </span>
                  </div>
                  <div style={{ color: BRAND.textMuted, fontSize: 11, lineHeight: 1.55 }}>{service.description}</div>
                </div>
              </button>
            ))}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                navigate("/crm");
                setOpen(false);
              }}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "11px 14px",
                borderRadius: 12,
                border: "1px solid rgba(96,165,250,0.22)",
                background: BRAND.primarySoft,
                color: "#C7D6FF",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                cursor: "pointer",
              }}
            >
              Acceder al CRM
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HamburgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <motion.line
        x1="3"
        y1="6"
        x2="19"
        y2="6"
        stroke={BRAND.text}
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      <motion.line
        x1="3"
        y1="11"
        x2="19"
        y2="11"
        stroke={BRAND.text}
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.18 }}
      />
      <motion.line
        x1="3"
        y1="16"
        x2="19"
        y2="16"
        stroke={BRAND.text}
        strokeWidth="1.8"
        strokeLinecap="round"
        animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </svg>
  );
}

function MobileDrawer({ open, onClose, navigate, location }) {
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    setServicesOpen(false);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 120 }}
          />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "min(360px, 88vw)",
              zIndex: 121,
              background: "rgba(7, 11, 18, 0.98)",
              borderRight: `1px solid ${BRAND.border}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              display: "flex",
              flexDirection: "column",
              paddingTop: 72,
            }}
          >
            <div style={{ padding: "0 24px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <BrandMark />
                <div>
                  <div style={{ color: BRAND.text, fontSize: 15, fontWeight: 800, letterSpacing: "1.8px" }}>ALTTEZ</div>
                  <div style={{ color: BRAND.textHint, fontSize: 9, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 2 }}>
                    Sports Operating System
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {[
                { to: "/quienes-somos", label: "Quiénes somos" },
                { to: "/contacto", label: "Contacto" },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: "block",
                    padding: "14px 24px",
                    textDecoration: "none",
                    color: isActive ? BRAND.text : BRAND.textMuted,
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    borderTop: `1px solid ${BRAND.border}`,
                  })}
                >
                  {item.label}
                </NavLink>
              ))}

              <button
                onClick={() => setServicesOpen((value) => !value)}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background: "none",
                  border: "none",
                  borderTop: `1px solid ${BRAND.border}`,
                  color: BRAND.textMuted,
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Soluciones
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    style={{ overflow: "hidden" }}
                  >
                    {SERVICES.map((service) => (
                      <button
                        key={service.to}
                        onClick={() => {
                          navigate(service.to);
                          onClose();
                        }}
                        style={{
                          width: "100%",
                          padding: "14px 32px",
                          background: "rgba(255,255,255,0.02)",
                          border: "none",
                          borderTop: `1px solid ${BRAND.border}`,
                          color: BRAND.text,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{service.label}</div>
                        <div style={{ fontSize: 10, color: BRAND.textHint, lineHeight: 1.5 }}>{service.description}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ padding: 24, borderTop: `1px solid ${BRAND.border}` }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  navigate("/crm");
                  onClose();
                }}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  borderRadius: 12,
                  border: "1px solid rgba(96,165,250,0.3)",
                  background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                  cursor: "pointer",
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

function WhatsAppCTA() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.a
        key="wa-cta"
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Habla con nosotros por WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "fixed",
          right: 28,
          bottom: 28,
          zIndex: 110,
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)",
          boxShadow: hovered ? `0 12px 32px ${BRAND.primaryGlow}` : "0 8px 22px rgba(15,23,42,0.38)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
        }}
        whileHover={{ scale: 1.08, rotate: 8 }}
        whileTap={{ scale: 0.96 }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13 2C7.477 2 3 6.477 3 12c0 1.85.502 3.58 1.376 5.06L3 23l6.12-1.348A10 10 0 0013 22c5.523 0 10-4.477 10-10S18.523 2 13 2zm-3.09 5.5c.178 0 .373.003.543.007.234.005.464.018.679.5.247.551.835 2.028.909 2.177.074.148.123.322.025.518-.1.197-.148.32-.296.494-.148.172-.311.385-.444.517-.148.148-.302.309-.13.606.173.296.77 1.27 1.655 2.057.96.85 1.77 1.112 2.066 1.234.296.124.47.104.643-.062.172-.166.74-.863.937-1.159.198-.296.395-.247.667-.148.271.099 1.723.812 2.019.96.296.147.493.222.567.345.074.123.074.714-.173 1.404-.247.69-1.432 1.332-1.974 1.38-.518.046-1.005.23-3.39-.707-2.852-1.1-4.645-4.01-4.78-4.198-.134-.19-1.104-1.467-1.104-2.798 0-1.33.699-1.983.947-2.255.247-.271.543-.34.724-.34z"
            fill="white"
          />
        </svg>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                right: "calc(100% + 12px)",
                top: "50%",
                transform: "translateY(-50%)",
                padding: "7px 12px",
                borderRadius: 10,
                whiteSpace: "nowrap",
                background: "rgba(7,11,18,0.96)",
                border: `1px solid ${BRAND.border}`,
                color: BRAND.text,
                fontSize: 11,
                fontWeight: 600,
                boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                pointerEvents: "none",
              }}
            >
              Habla con nosotros
            </motion.div>
          )}
        </AnimatePresence>
      </motion.a>
    </AnimatePresence>
  );
}

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = useMemo(
    () => [
      { to: "/quienes-somos", label: "Quiénes somos", exact: false },
      { to: "/contacto", label: "Contacto", exact: false },
    ],
    [],
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${BRAND.bg} 0%, ${BRAND.bgSoft} 46%, #06080d 100%)`,
        color: BRAND.text,
        fontFamily: "'Exo 2', Arial, sans-serif",
      }}
    >
      <OfflineBanner />
      <UpdateToast />
      <InstallAppBanner />

      <motion.nav
        animate={{
          backgroundColor: scrolled ? "rgba(7,11,18,0.94)" : "rgba(7,11,18,0.72)",
          borderBottomColor: scrolled ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.08)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 56,
          borderBottom: "1px solid",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "0 16px" : "0 32px",
        }}
      >
        <NavLink
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
            marginRight: isMobile ? 0 : 42,
            flex: isMobile ? 1 : "none",
          }}
        >
          <BrandMark />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: BRAND.text,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "2px",
                fontFamily: "'Orbitron', 'Exo 2', Arial, sans-serif",
                lineHeight: 1,
              }}
            >
              ALTTEZ
            </span>
            {!isMobile && (
              <span
                style={{
                  color: BRAND.textMuted,
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: "2.8px",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  marginTop: 2,
                }}
              >
                Sports Operating System
              </span>
            )}
          </div>
        </NavLink>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 28, flex: 1 }}>
            {navLinks.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} exact={item.exact} />
            ))}
            <ServicesDropdown />
          </div>
        )}

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <InstallAppBanner compact />
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: `0 12px 28px ${BRAND.primaryGlow}` }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/crm")}
              style={{
                padding: "9px 22px",
                borderRadius: 10,
                border: "1px solid rgba(96,165,250,0.3)",
                background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Acceder
            </motion.button>
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setDrawerOpen((value) => !value)}
            aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
            style={{
              background: "none",
              border: "none",
              padding: 8,
              cursor: "pointer",
              borderRadius: 8,
            }}
          >
            <HamburgerIcon open={drawerOpen} />
          </button>
        )}
      </motion.nav>

      <MobileDrawer open={drawerOpen && isMobile} onClose={() => setDrawerOpen(false)} navigate={navigate} location={location} />

      <main style={{ paddingTop: 56 }}>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <WhatsAppCTA />

      <footer
        style={{
          padding: isMobile ? "32px 20px 24px" : "48px 32px 32px",
          borderTop: `1px solid ${BRAND.border}`,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: BRAND.textMuted, marginBottom: 4 }}>
            ALTTEZ &mdash; infraestructura operativa para clubes de alto rendimiento
          </div>
          <div style={{ fontSize: 10, color: BRAND.textHint }}>&copy; 2026 ALTTEZ. Todos los derechos reservados.</div>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 16 : 20, flexWrap: "wrap" }}>
          {FOOTER_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              style={{
                color: BRAND.textMuted,
                textDecoration: "none",
                fontSize: 11,
                letterSpacing: "0.45px",
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
