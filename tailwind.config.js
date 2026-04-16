/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon
        neon:          "var(--color-neon)",
        "neon-glow":   "var(--color-neon-glow)",
        "neon-dim":    "var(--color-neon-dim)",
        // Semantic
        amber:         "var(--color-amber)",
        green:         "var(--color-green)",
        "green-bright":"var(--color-green-bright)",
        violet:        "var(--color-violet)",
        danger:        "var(--color-danger)",
        // Surfaces
        bg:            "var(--color-bg)",
        surface:       "var(--color-surface)",
        // Text
        muted:         "var(--color-text-muted)",
        hint:          "var(--color-text-hint)",
      },
      borderRadius: {
        xs:   "var(--radius-xs)",
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        sm:     "var(--shadow-sm)",
        card:   "var(--shadow-card)",
        panel:  "var(--shadow-panel)",
        modal:  "var(--shadow-modal)",
        neon:   "var(--shadow-neon)",
        violet: "var(--shadow-violet)",
      },
      spacing: {
        1: "var(--sp-1)",
        2: "var(--sp-2)",
        3: "var(--sp-3)",
        4: "var(--sp-4)",
        5: "var(--sp-5)",
        6: "var(--sp-6)",
        8: "var(--sp-8)",
      },
      fontSize: {
        badge:     "var(--fs-badge)",
        tag:       "var(--fs-tag)",
        label:     "var(--fs-label)",
        caption:   "var(--fs-caption)",
        body:      "var(--fs-body)",
        "body-lg": "var(--fs-body-lg)",
        subhead:   "var(--fs-subhead)",
        "title-sm":"var(--fs-title-sm)",
        title:     "var(--fs-title)",
        "title-lg":"var(--fs-title-lg)",
        hero:      "var(--fs-hero)",
        kpi:       "var(--fs-kpi)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
    },
  },
  plugins: [],
}
