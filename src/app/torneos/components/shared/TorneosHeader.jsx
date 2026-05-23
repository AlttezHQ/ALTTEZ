import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Moon, Sun, User, Menu, ChevronDown, Activity, LogOut, Settings as SettingsIcon, X, Clock } from "lucide-react";
import { PALETTE, ELEVATION } from "../../../../shared/tokens/palette";

const CARD   = PALETTE.surface;
const TEXT   = PALETTE.text;
const MUTED  = PALETTE.textMuted;
const BORDER = PALETTE.border;
const BG     = PALETTE.bg;
const FONT   = "var(--font-inter), sans-serif";
const CU     = PALETTE.bronce;

export default function TorneosHeader({ onLogout, onDeleteAccount, userName = "", userEmail = "", onMenuToggle }) {
  const displayName = userName || "Club Alttez";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState([
    { title: "Nuevo equipo registrado", desc: "Sporting Club se ha unido al torneo de Verano.", time: "Hace 5 min" },
    { title: "Partido aplazado", desc: "El encuentro de la Fecha 4 ha sido reprogramado.", time: "Hace 1 hora" },
    { title: "Actualización de sistema", desc: "Se han aplicado mejoras en el módulo de Fixture.", time: "Ayer" },
  ]);
  
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{
      height: 64, background: CARD, borderBottom: `1px solid ${BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0, fontFamily: FONT, position: "relative", zIndex: 40,
    }}>
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center rounded-lg p-2 transition-colors"
          style={{ background: BG, border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", minHeight: 36 }}
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <Activity size={18} color={MUTED} />
          <span style={{ fontWeight: 500, fontSize: 14, color: MUTED }}>Ecosistema Operativo Deportivo</span>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
          <AnimatePresence>
            {searchOpen && (
              <motion.input
                initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                autoFocus placeholder="Buscar..." 
                style={{ position: "absolute", right: 30, height: 36, padding: "0 14px", borderRadius: 18, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 13, outline: "none", fontFamily: FONT }}
              />
            )}
          </AnimatePresence>
          <motion.button onClick={() => setSearchOpen(!searchOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: "none", border: "none", cursor: "pointer", color: searchOpen ? CU : MUTED, zIndex: 2 }}>
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </motion.button>
        </div>
        
        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <motion.button onClick={() => setNotifOpen(!notifOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: "none", border: "none", cursor: "pointer", color: notifOpen ? CU : MUTED }}>
            <Bell size={20} />
          </motion.button>
          {notifications.length > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4, background: CU, color: "#fff",
              fontSize: 10, fontWeight: 800, width: 16, height: 16, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none"
            }}>
              {notifications.length}
            </span>
          )}
          
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute", top: "100%", right: -60, marginTop: 12, width: 320,
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16,
                  boxShadow: ELEVATION?.panel || "0 10px 30px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 50
                }}
              >
                <div style={{ padding: "16px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Notificaciones</div>
                  {notifications.length > 0 && (
                    <div onClick={() => setNotifications([])} style={{ fontSize: 11, fontWeight: 600, color: CU, cursor: "pointer" }}>Marcar leídas</div>
                  )}
                </div>
                <div style={{ maxHeight: 300, overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <style>{`
                    .notif-scroll::-webkit-scrollbar { display: none; }
                  `}</style>
                  <div className="notif-scroll">
                    {notifications.length === 0 ? (
                      <div style={{ padding: "40px 20px", textAlign: "center", color: MUTED, fontSize: 13 }}>
                        No tienes nuevas notificaciones
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} style={{ padding: 16, borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 12, cursor: "pointer" }} className="hover:bg-black/20 transition-colors">
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Bell size={16} color={CU} /></div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{n.title}</div>
                            <div style={{ fontSize: 12, color: MUTED, marginBottom: 6, lineHeight: 1.4 }}>{n.desc}</div>
                            <div style={{ fontSize: 10, color: MUTED, display: "flex", gap: 4, alignItems: "center" }}><Clock size={10} /> {n.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {notifications.length > 0 && (
                  <div style={{ padding: 12, textAlign: "center", borderTop: `1px solid ${BORDER}`, background: BG, fontSize: 12, fontWeight: 600, color: MUTED, cursor: "pointer" }}>Ver todas</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <motion.button onClick={() => setIsDark(!isDark)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}>
          {isDark ? <Moon size={20} /> : <Sun size={20} color={CU} />}
        </motion.button>

        <div style={{ width: 1, height: 24, background: BORDER, margin: "0 4px" }} />

        <div ref={menuRef} style={{ position: "relative" }}>
          <div 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "4px 8px", borderRadius: 8, background: userMenuOpen ? BG : "transparent", transition: "background 0.2s" }}
          >
            <div style={{ 
              width: 36, height: 36, borderRadius: "50%", background: "#2A2E33", 
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14, fontWeight: 700 
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{displayName}</div>
              <div style={{ fontSize: 11, color: MUTED }}>Admin</div>
            </div>
            <ChevronDown size={14} color={MUTED} style={{ transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </div>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 8, width: 220,
                  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
                  boxShadow: ELEVATION?.panel || "0 10px 30px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 50
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, background: BG }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{userEmail || "admin@alttez.com"}</div>
                </div>
                <div style={{ padding: 8 }}>
                  <button onClick={() => setUserMenuOpen(false)} style={{ width: "100%", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: TEXT, fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 8, textAlign: "left" }} className="hover:bg-black/20 transition-colors">
                    <User size={16} color={MUTED} /> Mi Perfil
                  </button>
                  <button onClick={() => setUserMenuOpen(false)} style={{ width: "100%", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: TEXT, fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 8, textAlign: "left" }} className="hover:bg-black/20 transition-colors">
                    <SettingsIcon size={16} color={MUTED} /> Configuración
                  </button>
                  <div style={{ height: 1, background: BORDER, margin: "4px 0" }} />
                  <button onClick={() => { setUserMenuOpen(false); if (onLogout) onLogout(); }} style={{ width: "100%", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: PALETTE.danger || "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 8, textAlign: "left" }} className="hover:bg-red-500/10 transition-colors">
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
