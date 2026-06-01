import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Menu,
  ChevronDown,
  Activity,
  LogOut,
  Settings as SettingsIcon,
  X,
  Clock,
  ArrowRight,
  FolderSearch,
} from "lucide-react";
import { PALETTE, ELEVATION } from "../../../../shared/tokens/palette";

const THEME_STORAGE_KEY = "alttez_torneos_theme";
const CARD = PALETTE.surface;
const TEXT = PALETTE.text;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;
const BG = PALETTE.bg;
const FONT = "var(--font-inter), sans-serif";
const CU = PALETTE.bronce;

function getInitialThemeState() {
  if (typeof window === "undefined") return true;
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light") return false;
  if (storedTheme === "dark") return true;
  return !(window.matchMedia?.("(prefers-color-scheme: light)")?.matches ?? false);
}

export default function TorneosHeader({
  onLogout,
  onDeleteAccount,
  userName = "",
  userEmail = "",
  onMenuToggle,
  onSearchNavigate,
  searchItems = [],
  notifications = [],
}) {
  const displayName = userName || "Club Alttez";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(getInitialThemeState);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState([]);

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches ?? false;
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : prefersLight
          ? "light"
          : "dark";

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, initialTheme);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification?.id && !dismissedNotificationIds.includes(notification.id),
      ),
    [dismissedNotificationIds, notifications],
  );

  const filteredSearchItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return searchItems.slice(0, 8);
    }

    return searchItems
      .filter((item) => {
        const haystack = [item.label, item.description, item.keywords]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [searchItems, searchQuery]);

  const applyTheme = (nextTheme) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setIsDark(nextTheme === "dark");
  };

  const handleSearchSelect = (item) => {
    setSearchOpen(false);
    setSearchQuery("");
    onSearchNavigate?.(item);
  };

  const getNotificationAccent = (tone) => {
    if (tone === "danger") return PALETTE.danger;
    if (tone === "warning") return PALETTE.amber;
    if (tone === "success") return PALETTE.success;
    return CU;
  };

  return (
    <div
      style={{
        height: 64,
        background: CARD,
        borderBottom: `1px solid ${BORDER}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        fontFamily: FONT,
        position: "relative",
        zIndex: 40,
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center rounded-lg p-2 transition-colors"
          style={{ background: BG, border: `1px solid ${BORDER}`, color: MUTED, cursor: "pointer", minHeight: 36 }}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <Activity size={18} color={MUTED} />
          <span style={{ fontWeight: 500, fontSize: 14, color: MUTED }}>Ecosistema Operativo Deportivo</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div ref={searchRef} style={{ display: "flex", alignItems: "center", position: "relative" }}>
          <AnimatePresence>
            {searchOpen && (
              <>
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar modulo, categoria, equipo..."
                  style={{
                    position: "absolute",
                    right: 30,
                    height: 38,
                    padding: "0 14px",
                    borderRadius: 18,
                    border: `1px solid ${BORDER}`,
                    background: BG,
                    color: TEXT,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: FONT,
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    right: 0,
                    width: 340,
                    background: CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 16,
                    boxShadow: ELEVATION?.panel || "0 10px 30px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    zIndex: 60,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderBottom: `1px solid ${BORDER}`,
                      fontSize: 11,
                      fontWeight: 700,
                      color: MUTED,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Busqueda operativa
                  </div>

                  {filteredSearchItems.length === 0 ? (
                    <div style={{ padding: "26px 18px", color: MUTED, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                      <FolderSearch size={16} />
                      No encontramos resultados para tu busqueda.
                    </div>
                  ) : (
                    filteredSearchItems.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSearchSelect(item)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 14,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: TEXT,
                          textAlign: "left",
                          borderBottom: index < filteredSearchItems.length - 1 ? `1px solid ${BORDER}` : "none",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{item.description}</div>
                        </div>
                        <ArrowRight size={14} color={MUTED} />
                      </button>
                    ))
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setSearchOpen((value) => !value)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ background: "none", border: "none", cursor: "pointer", color: searchOpen ? CU : MUTED, zIndex: 2 }}
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </motion.button>
        </div>

        <div ref={notifRef} style={{ position: "relative" }}>
          <motion.button
            onClick={() => setNotifOpen((value) => !value)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ background: "none", border: "none", cursor: "pointer", color: notifOpen ? CU : MUTED }}
          >
            <Bell size={20} />
          </motion.button>
          {visibleNotifications.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: CU,
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                width: 16,
                height: 16,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              {visibleNotifications.length}
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
                  position: "absolute",
                  top: "100%",
                  right: -60,
                  marginTop: 12,
                  width: 340,
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 16,
                  boxShadow: ELEVATION?.panel || "0 10px 30px rgba(0,0,0,0.2)",
                  overflow: "hidden",
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderBottom: `1px solid ${BORDER}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Notificaciones</div>
                  {visibleNotifications.length > 0 && (
                    <div
                      onClick={() => setDismissedNotificationIds(visibleNotifications.map((notification) => notification.id))}
                      style={{ fontSize: 11, fontWeight: 600, color: CU, cursor: "pointer" }}
                    >
                      Marcar leidas
                    </div>
                  )}
                </div>

                <div style={{ maxHeight: 320, overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <style>{`.notif-scroll::-webkit-scrollbar { display: none; }`}</style>
                  <div className="notif-scroll">
                    {visibleNotifications.length === 0 ? (
                      <div style={{ padding: "40px 20px", textAlign: "center", color: MUTED, fontSize: 13 }}>
                        No hay alertas operativas por ahora
                      </div>
                    ) : (
                      visibleNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (notification.module) {
                              handleSearchSelect({
                                id: notification.id,
                                module: notification.module,
                                label: notification.title,
                                description: notification.desc,
                              });
                            }
                          }}
                          style={{
                            padding: 16,
                            borderBottom: `1px solid ${BORDER}`,
                            display: "flex",
                            gap: 12,
                            cursor: notification.module ? "pointer" : "default",
                          }}
                          className="hover:bg-black/20 transition-colors"
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: BG,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Bell size={16} color={getNotificationAccent(notification.tone)} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{notification.title}</div>
                            <div style={{ fontSize: 12, color: MUTED, marginBottom: 6, lineHeight: 1.4 }}>{notification.desc}</div>
                            <div style={{ fontSize: 10, color: MUTED, display: "flex", gap: 4, alignItems: "center" }}>
                              <Clock size={10} /> {notification.time}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={() => applyTheme(isDark ? "light" : "dark")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}
          aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          aria-pressed={isDark}
          title={isDark ? "Cambiar a claro" : "Cambiar a oscuro"}
        >
          {isDark ? <Sun size={20} color={CU} /> : <Moon size={20} />}
        </motion.button>

        <div style={{ width: 1, height: 24, background: BORDER, margin: "0 4px" }} />

        <div ref={menuRef} style={{ position: "relative" }}>
          <div
            onClick={() => setUserMenuOpen((value) => !value)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 8,
              background: userMenuOpen ? BG : "transparent",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#2A2E33",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
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
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  width: 220,
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  boxShadow: ELEVATION?.panel || "0 10px 30px rgba(0,0,0,0.2)",
                  overflow: "hidden",
                  zIndex: 50,
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, background: BG }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{userEmail || "admin@alttez.com"}</div>
                </div>
                <div style={{ padding: 8 }}>
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    style={{ width: "100%", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: TEXT, fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 8, textAlign: "left" }}
                    className="hover:bg-black/20 transition-colors"
                  >
                    <User size={16} color={MUTED} /> Mi Perfil
                  </button>
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    style={{ width: "100%", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: TEXT, fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 8, textAlign: "left" }}
                    className="hover:bg-black/20 transition-colors"
                  >
                    <SettingsIcon size={16} color={MUTED} /> Configuracion
                  </button>
                  <div style={{ height: 1, background: BORDER, margin: "4px 0" }} />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{ width: "100%", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", color: PALETTE.danger || "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: 8, textAlign: "left" }}
                    className="hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} /> Cerrar sesion
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
