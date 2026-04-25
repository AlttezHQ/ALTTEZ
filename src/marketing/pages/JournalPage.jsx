import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { DEMO_JOURNAL } from "../data/portalData";
import { MARKETING_BRAND as B, MARKETING_GRADIENTS as G, MARKETING_FONTS as F } from "../theme/brand";

const CATEGORY_TABS = [
  { key: "all", label: "Todos" },
  { key: "feature", label: "Producto" },
  { key: "news", label: "Clubes" },
  { key: "announcement", label: "Vertical" },
  { key: "update", label: "Updates" },
];

const CATEGORY_COLORS = {
  announcement: B.primary,
  feature: B.warning,
  news: B.primary,
  update: B.textMuted,
};

const CATEGORY_LABELS = {
  announcement: "Anuncio",
  feature: "Feature",
  news: "Noticia",
  update: "Update",
};

function FeaturedArticle({ entry }) {
  const accent = CATEGORY_COLORS[entry.category] || B.primary;

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      style={{
        position: "relative",
        padding: "34px 32px",
        borderRadius: 30,
        background: G.panel,
        border: `1px solid ${B.borderStrong}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.38)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 92% 14%, ${accent}22 0%, transparent 22%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span
            style={{
              padding: "7px 12px",
              borderRadius: 999,
              background: `${accent}18`,
              border: `1px solid ${accent}44`,
              color: accent,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {CATEGORY_LABELS[entry.category]}
          </span>
          <span style={{ fontSize: 13, color: B.textHint }}>{entry.published_at}</span>
        </div>

        <h2
          style={{
            margin: "18px 0 14px",
            fontSize: "clamp(30px, 5vw, 48px)",
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            fontFamily: F.display,
            maxWidth: 760,
          }}
        >
          {entry.title}
        </h2>

        <p style={{ margin: 0, maxWidth: 760, color: B.textMuted, fontSize: 17, lineHeight: 1.85 }}>{entry.excerpt}</p>
        {entry.content ? <p style={{ marginTop: 18, color: B.textHint, lineHeight: 1.8, maxWidth: 760 }}>{entry.content}</p> : null}
      </div>
    </motion.article>
  );
}

function ArticleCard({ entry, index }) {
  const accent = CATEGORY_COLORS[entry.category] || B.primary;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      style={{
        padding: 24,
        borderRadius: 26,
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${B.border}`,
        boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
        display: "grid",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: `${accent}18`,
            border: `1px solid ${accent}40`,
            color: accent,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {CATEGORY_LABELS[entry.category]}
        </span>
        <span style={{ color: B.textHint, fontSize: 12 }}>{entry.published_at}</span>
      </div>

      <h3 style={{ margin: 0, fontSize: 28, lineHeight: 1.02, fontWeight: 700, letterSpacing: "-0.04em", fontFamily: F.display }}>
        {entry.title}
      </h3>
      <p style={{ margin: 0, color: B.textMuted, lineHeight: 1.8, fontSize: 15 }}>{entry.excerpt}</p>
      <div style={{ color: accent, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 700 }}>
        Leer desarrollo
      </div>
    </motion.article>
  );
}

export default function JournalPage() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 640px) {
        .journal-page section {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = DEMO_JOURNAL.filter((entry) => {
    const matchTab = activeTab === "all" || entry.category === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || entry.title.toLowerCase().includes(q) || entry.excerpt.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const featured = filtered[0] || null;
  const rest = filtered.slice(1);

  return (
    <div className="journal-page" style={{ minHeight: "100vh", background: G.hero, color: B.text }}>
      <section
        ref={headerRef}
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "84px 32px 30px",
          position: "relative",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 820 }}
        >
          <div style={{ fontSize: 11, color: B.warning, textTransform: "uppercase", letterSpacing: "0.24em", fontWeight: 700 }}>
            ALTTEZ Journal
          </div>
          <h1
            style={{
              margin: "18px 0 18px",
              fontSize: "clamp(42px, 7vw, 84px)",
              lineHeight: 0.96,
              fontWeight: 800,
              letterSpacing: "-0.06em",
              fontFamily: F.display,
            }}
          >
            Ideas, decisiones y señales sobre hacia dónde está creciendo el producto.
          </h1>
          <p style={{ maxWidth: 700, color: B.textMuted, fontSize: 18, lineHeight: 1.82 }}>
            Este espacio traduce producto y visión en mensajes editoriales. Sirve para reforzar autoridad, explicar cambios y dar al cliente razones para confiar en la evolución del ecosistema.
          </p>
        </motion.div>
      </section>

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en el journal..."
            style={{
              flex: "1 1 220px",
              padding: "13px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${B.border}`,
              color: B.text,
              fontSize: 14,
              outline: "none",
              minWidth: 200,
            }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: `1px solid ${activeTab === tab.key ? B.primary : B.border}`,
                  background: activeTab === tab.key ? B.primarySoft : "rgba(255,255,255,0.02)",
                  color: activeTab === tab.key ? B.primary : B.textMuted,
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  transition: "all 160ms ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px 26px" }}>
          <FeaturedArticle entry={featured} />
        </section>
      )}

      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 32px 96px" }}>
        {rest.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 18 }}>
            {rest.map((entry, index) => (
              <ArticleCard key={entry.slug} entry={entry} index={index} />
            ))}
          </div>
        ) : !featured && (
          <p style={{ color: B.textMuted, textAlign: "center", fontSize: 15 }}>No hay artículos que coincidan con la búsqueda.</p>
        )}
      </section>
    </div>
  );
}
