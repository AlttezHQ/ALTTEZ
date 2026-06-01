const DEFAULT_STATS = [
  { label: "Precision de pase", value: "91%", trend: "+4%", tone: "accent" },
  { label: "Duelos ganados", value: "18", trend: "+6", tone: "neutral" },
  { label: "Recuperaciones", value: "27", trend: "+9", tone: "neutral" },
  { label: "xG generado", value: "2.4", trend: "+0.8", tone: "accent" },
];

export default function QuickStatsCard({
  title = "Estadisticas Rapidas",
  subtitle = "Lectura inmediata del rendimiento competitivo",
  phase = "Actualizado al 89'",
  badge = "MatchCenter",
  stats = DEFAULT_STATS,
}) {
  return (
    <article
      style={{
        background: "#181B2A",
        border: "1px solid rgba(194, 122, 66, 0.18)",
        boxShadow: "0 18px 40px rgba(5, 8, 20, 0.32)",
      }}
      className="relative overflow-hidden rounded-[24px] p-5 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(194, 122, 66, 0) 0%, rgba(194, 122, 66, 0.75) 50%, rgba(194, 122, 66, 0) 100%)",
        }}
      />

      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
            style={{
              background: "#0F111A",
              border: "1px solid rgba(194, 122, 66, 0.16)",
              color: "#9EACBF",
            }}
          >
            {badge}
          </span>
          <div>
            <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[#F5F7FA]">{title}</h3>
            <p className="mt-1 text-sm text-[#9EACBF]">{subtitle}</p>
          </div>
        </div>

        <div
          className="min-w-[112px] rounded-[18px] px-4 py-3 text-right"
          style={{
            background: "#0F111A",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6F7D93]">Estado</div>
          <div className="mt-2 text-sm font-medium text-[#F5F7FA]">{phase}</div>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <section
            key={stat.label}
            className="rounded-[18px] p-4"
            style={{
              background: "#0F111A",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6F7D93]">{stat.label}</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <strong className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-[#F5F7FA]">
                {stat.value}
              </strong>
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: stat.tone === "accent" ? "rgba(194, 122, 66, 0.14)" : "rgba(255, 255, 255, 0.04)",
                  color: stat.tone === "accent" ? "#D48E56" : "#9EACBF",
                  border:
                    stat.tone === "accent"
                      ? "1px solid rgba(194, 122, 66, 0.18)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                {stat.trend}
              </span>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
