import { PALETTE } from "../../../../shared/tokens/palette";

const CU = PALETTE.bronce;
const CU_DIM = PALETTE.bronceDim;
const CARD = PALETTE.surface;
const MUTED = PALETTE.textMuted;
const BORDER = PALETTE.border;

export default function StandingsPanel({ rows }) {
  return (
    <div
      style={{
        background: CARD,
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        padding: 24,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${BORDER}`, color: MUTED, textAlign: "center" }}>
            <th style={{ padding: 12, width: 40 }}>#</th>
            <th style={{ padding: 12, textAlign: "left" }}>EQUIPO</th>
            <th style={{ padding: 12 }}>PJ</th>
            <th style={{ padding: 12 }}>PG</th>
            <th style={{ padding: 12 }}>PE</th>
            <th style={{ padding: 12 }}>PP</th>
            <th style={{ padding: 12 }}>DG</th>
            <th style={{ padding: 12, fontWeight: 800, color: CU }}>PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.equipoId} style={{ borderBottom: `1px solid ${BORDER}`, textAlign: "center" }}>
              <td style={{ padding: 12, fontWeight: 800 }}>{index + 1}</td>
              <td style={{ padding: 12, textAlign: "left", fontWeight: 700 }}>{row.nombre}</td>
              <td style={{ padding: 12 }}>{row.pj}</td>
              <td style={{ padding: 12 }}>{row.pg}</td>
              <td style={{ padding: 12 }}>{row.pe}</td>
              <td style={{ padding: 12 }}>{row.pp}</td>
              <td style={{ padding: 12, color: row.dg >= 0 ? PALETTE.success : PALETTE.danger }}>
                {row.dg > 0 ? `+${row.dg}` : row.dg}
              </td>
              <td style={{ padding: 12, fontWeight: 900, color: CU, background: CU_DIM }}>
                {row.pts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
