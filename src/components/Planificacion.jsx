import { useState, useRef } from "react";
import DOMPurify from "dompurify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { showToast } from "./Toast";

const SESSION_ID = () => `SES-${Date.now().toString(36).toUpperCase()}`;

const RECOMENDACIONES = {
  tecnico: ["Pressing alto y salida de balón","Juego de posición y circulación","Transiciones defensa-ataque","Juego directo y balón en profundidad","Construcción desde portería"],
  fisico: ["Resistencia aeróbica","Velocidad y aceleración","Fuerza explosiva","Movilidad y flexibilidad","Recuperación activa"],
};

const MATERIALES_COMUNES = ["Balones","Conos","Chalecos","Porterías pequeñas","Escaleras de agilidad","Picas","Vallas","Elásticos","Petos de colores","Cronómetro"];

const TIEMPOS_TEORIA = (total) => ({
  warmup: Math.round(total * 0.15),
  tarea1: Math.round(total * 0.2),
  tarea2: Math.round(total * 0.25),
  tarea3: Math.round(total * 0.25),
  tarea4: Math.round(total * 0.15),
});

// ── Export PDF Button ───────────────────────────────────────────────────────
function ExportPDFButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed,  setPressed]  = useState(false);

  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "11px 14px",
    fontSize: 10,
    fontFamily: "inherit",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    border: "1px solid",
    transition: "background 0.15s, box-shadow 0.15s, transform 0.1s",
    marginTop: 6,
    minHeight: 44,
  };

  const style = hovered
    ? {
        ...base,
        background: "rgba(200,255,0,0.10)",
        borderColor: "#c8ff00",
        color: "#c8ff00",
        boxShadow: "0 0 12px rgba(200,255,0,0.35), inset 0 0 8px rgba(200,255,0,0.05)",
        transform: pressed ? "scale(0.97)" : "scale(1.01)",
      }
    : {
        ...base,
        background: "transparent",
        borderColor: "rgba(200,255,0,0.35)",
        color: "rgba(200,255,0,0.7)",
        boxShadow: "none",
        transform: pressed ? "scale(0.97)" : "scale(1)",
      };

  return (
    <div
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      role="button"
      aria-label="Exportar planificación como PDF"
    >
      {/* Printer / document SVG icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Exportar PDF
    </div>
  );
}

export default function Planificacion({ athletes, clubInfo, sessionCount }) {
  const [sessionId] = useState(SESSION_ID());
  const [duracionTotal, setDuracionTotal] = useState(90);
  const [tiempos, setTiempos] = useState(TIEMPOS_TEORIA(90));
  const [categoria, setCategoria] = useState((clubInfo?.categorias||[])[0] || "Sub-17");
  const [campo, setCampo] = useState((clubInfo?.campos||["Campo principal"])[0] || "Campo principal");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [hora, setHora] = useState("16:00");
  const [showTecRec, setShowTecRec] = useState(false);
  const [showFisRec, setShowFisRec] = useState(false);
  const [objTec, setObjTec] = useState("");
  const [objFis, setObjFis] = useState("");
  const [periodo, setPeriodo] = useState("Competición");
  const [warmupDesc, setWarmupDesc] = useState("");
  const [tareas, setTareas] = useState([
    { objetivo:"", descripcion:"", series:"", tiempo:"", repeticiones:"", imagenPreview:null, svgRec:null, analizando:false },
    { objetivo:"", descripcion:"", series:"", tiempo:"", repeticiones:"", imagenPreview:null, svgRec:null, analizando:false },
    { objetivo:"", descripcion:"", series:"", tiempo:"", repeticiones:"", imagenPreview:null, svgRec:null, analizando:false },
    { objetivo:"", descripcion:"", series:"", tiempo:"", repeticiones:"", imagenPreview:null, svgRec:null, analizando:false },
  ]);
  const [materiales, setMateriales] = useState([
    { nombre:"Balones", cantidad:12 },
    { nombre:"Conos", cantidad:20 },
    { nombre:"Chalecos", cantidad:18 },
  ]);
  const [newMat, setNewMat] = useState("");
  const [newMatQty, setNewMatQty] = useState(1);
  const [showMatRec, setShowMatRec] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState(athletes.map(a=>a.id));
  const [notas, setNotas] = useState("");
  const [charla, setCharla] = useState("");
  const fileRefs = useRef([null,null,null,null]);

  const updateDuracion = (val) => {
    setDuracionTotal(val);
    setTiempos(TIEMPOS_TEORIA(val));
  };

  const updateTarea = (i, key, val) => {
    const t = [...tareas];
    t[i] = { ...t[i], [key]: val };
    setTareas(t);
  };

  const handleImageUpload = (i, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const t = [...tareas];
      t[i] = { ...t[i], imagenPreview: e.target.result, analizando: false, svgRec: null };
      setTareas([...t]);

      // TODO: El análisis IA de diagramas tácticos debe rutear por un backend propio
      // (e.g. POST /api/analyze-diagram) para no exponer la API key de Anthropic en el frontend.
      // La llamada directa a https://api.anthropic.com/v1/messages fue deshabilitada por seguridad.
      alert("El análisis IA de diagramas requiere configuración del servidor. La imagen se guardó como preview.");
    };
    reader.readAsDataURL(file);
  };

  const addMaterial = () => {
    if (!newMat.trim()) return;
    setMateriales([...materiales, { nombre: newMat.trim(), cantidad: newMatQty }]);
    setNewMat(""); setNewMatQty(1); setShowMatRec(false);
  };

  const removeMaterial = (i) => { const m = [...materiales]; m.splice(i,1); setMateriales(m); };
  const updateMaterialQty = (i, qty) => { const m=[...materiales]; m[i]={...m[i],cantidad:qty}; setMateriales(m); };

  const togglePlayer = (id) => {
    setSelectedPlayers(prev => prev.includes(id) ? prev.filter(p=>p!==id) : [...prev, id]);
  };

  const generarPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN = 14;
    const CONTENT_W = PAGE_W - MARGIN * 2;

    // ── Palette (RGB arrays for jsPDF) ────────────────────────────────────
    const NEON     = [200, 255, 0];      // #c8ff00
    const NEON_DIM = [200, 255, 0];      // used at low alpha via setDrawColor
    const DARK     = [5,   10,  20];     // #050a14
    const WHITE    = [255, 255, 255];
    const GRAY_LT  = [240, 242, 236];    // alternating row
    const GRAY_MID = [120, 120, 120];
    const GREEN    = [29,  158, 117];    // semantic green for status
    const AMBER    = [239, 159,  39];    // semantic amber for warnings
    const DANGER   = [226,  75,  74];    // semantic red

    const clubName = clubInfo?.nombre || clubInfo?.name || "Mi Club";
    const today    = new Date().toLocaleDateString("es-ES", { day:"2-digit", month:"long", year:"numeric" });
    const tiemposMins = [tiempos.tarea1, tiempos.tarea2, tiempos.tarea3, tiempos.tarea4];

    // ── HEADER BAND ────────────────────────────────────────────────────────
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PAGE_W, 30, "F");

    // ES badge (neon box)
    doc.setFillColor(0, 0, 0);
    doc.setDrawColor(...NEON_DIM);
    doc.setLineWidth(0.6);
    doc.roundedRect(MARGIN, 6, 14, 14, 2, 2, "FD");
    doc.setTextColor(...NEON);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("ES", MARGIN + 7, 15.5, { align: "center" });

    // Club name + document title
    doc.setTextColor(...WHITE);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(clubName.toUpperCase(), 32, 13);

    doc.setTextColor(...NEON);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("PLANIFICACIÓN DE SESIÓN", 32, 19);

    // Session ID pill (top-right)
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(7);
    doc.text(`ID ${sessionId}  ·  Sesión #${sessionCount + 1}`, PAGE_W - MARGIN, 11, { align: "right" });
    doc.text(`${fecha}  ·  ${hora}  ·  ${duracionTotal} min`, PAGE_W - MARGIN, 17, { align: "right" });

    // Neon bottom line of header
    doc.setDrawColor(...NEON);
    doc.setLineWidth(0.4);
    doc.line(0, 30, PAGE_W, 30);

    // ── META ROW ─────────────────────────────────────────────────────────
    let curY = 38;
    const metaPairs = [
      ["Campo",     campo],
      ["Categoría", categoria],
      ["Período",   periodo],
    ];
    doc.setFontSize(8);
    const colW = CONTENT_W / metaPairs.length;
    metaPairs.forEach(([label, value], idx) => {
      const x = MARGIN + idx * colW;
      doc.setTextColor(...GRAY_MID);
      doc.setFont("helvetica", "normal");
      doc.text(label.toUpperCase(), x, curY - 3);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(value || "—", x, curY + 3);
      doc.setFontSize(8);
    });

    // separator
    curY += 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, curY, PAGE_W - MARGIN, curY);

    // ── OBJETIVOS ─────────────────────────────────────────────────────────
    curY += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("OBJETIVOS", MARGIN, curY);
    doc.setDrawColor(...NEON);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, curY + 1.5, MARGIN + 22, curY + 1.5);

    curY += 7;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("Técnico-táctico:", MARGIN, curY);
    doc.setFont("helvetica", "normal");
    const objTecLines = doc.splitTextToSize(objTec || "—", CONTENT_W - 35);
    doc.text(objTecLines, MARGIN + 34, curY);

    curY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Físico:", MARGIN, curY);
    doc.setFont("helvetica", "normal");
    const objFisLines = doc.splitTextToSize(objFis || "—", CONTENT_W - 35);
    doc.text(objFisLines, MARGIN + 34, curY);

    curY += 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, curY, PAGE_W - MARGIN, curY);

    // ── CALENTAMIENTO ─────────────────────────────────────────────────────
    curY += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("CALENTAMIENTO", MARGIN, curY);
    doc.setDrawColor(...NEON);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, curY + 1.5, MARGIN + 36, curY + 1.5);

    curY += 7;
    doc.setFillColor(...GRAY_LT);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    // left accent bar in neon
    doc.setFillColor(...NEON);
    doc.rect(MARGIN, curY - 3, 1.5, 8, "F");
    doc.setFillColor(245, 248, 240);
    doc.rect(MARGIN + 1.5, curY - 3, CONTENT_W - 1.5, 8, "F");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const warmLines = doc.splitTextToSize(warmupDesc || "Sin descripción de calentamiento.", CONTENT_W - 20);
    doc.text(warmLines, MARGIN + 5, curY + 1.5);
    doc.setTextColor(...GRAY_MID);
    doc.text(`${tiempos.warmup} min`, PAGE_W - MARGIN, curY + 1.5, { align: "right" });

    curY += 14;

    // ── TAREAS TABLE ──────────────────────────────────────────────────────
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("ESTRUCTURA DE LA SESIÓN", MARGIN, curY);
    doc.setDrawColor(...NEON);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, curY + 1.5, MARGIN + 46, curY + 1.5);
    curY += 5;

    const TASK_COLORS_RGB = [
      [29,  158, 117],  // tarea 1 — green
      [239, 159,  39],  // tarea 2 — amber
      [127, 119, 221],  // tarea 3 — purple
      [226,  75,  74],  // tarea 4 — danger
    ];

    autoTable(doc, {
      startY: curY,
      head: [["#", "Objetivo", "Descripción / Notas", "Series", "Tiempo", "Rep.", "Min"]],
      body: tareas.map((t, i) => [
        `T${i + 1}`,
        t.objetivo     || "—",
        t.descripcion  || "—",
        t.series       || "—",
        t.tiempo       || "—",
        t.repeticiones || "—",
        `${tiemposMins[i]} min`,
      ]),
      headStyles: {
        fillColor: DARK,
        textColor: NEON,
        fontSize: 8,
        fontStyle: "bold",
        lineWidth: 0,
      },
      bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: GRAY_LT },
      columnStyles: {
        0: { cellWidth: 8,  halign: "center", fontStyle: "bold" },
        1: { cellWidth: 35 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 14, halign: "center" },
        4: { cellWidth: 14, halign: "center" },
        5: { cellWidth: 10, halign: "center" },
        6: { cellWidth: 14, halign: "center" },
      },
      margin: { left: MARGIN, right: MARGIN },
      // Color the first column per task row
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          const rgb = TASK_COLORS_RGB[data.row.index];
          if (rgb) {
            data.cell.styles.fillColor = rgb;
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
      },
    });

    curY = doc.lastAutoTable.finalY + 10;

    // ── MATERIAL + JUGADORES (two columns) ────────────────────────────────
    const COL_LEFT_W  = 72;
    const COL_RIGHT_W = CONTENT_W - COL_LEFT_W - 6;
    const COL_RIGHT_X = MARGIN + COL_LEFT_W + 6;

    // — Material
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("MATERIAL", MARGIN, curY);
    doc.setDrawColor(...NEON);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, curY + 1.5, MARGIN + 18, curY + 1.5);

    autoTable(doc, {
      startY: curY + 4,
      head: [["Material", "Cant."]],
      body: materiales.map(m => [m.nombre, m.cantidad]),
      headStyles: { fillColor: DARK, textColor: NEON, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: GRAY_LT },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 18, halign: "center" },
      },
      margin: { left: MARGIN, right: COL_RIGHT_X },
      tableWidth: COL_LEFT_W,
    });

    // — Jugadores
    const jugSeleccionados = athletes.filter(a => selectedPlayers.includes(a.id));
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(`DEPORTISTAS CONVOCADOS (${jugSeleccionados.length})`, COL_RIGHT_X, curY);
    doc.setDrawColor(...NEON);
    doc.line(COL_RIGHT_X, curY + 1.5, COL_RIGHT_X + 52, curY + 1.5);

    autoTable(doc, {
      startY: curY + 4,
      head: [["Nombre", "Pos.", "Estado"]],
      body: jugSeleccionados.map(a => [
        a.name,
        a.pos,
        a.status === "P" ? "Disponible" : a.status === "L" ? "Lesionado" : "Ausente",
      ]),
      headStyles: { fillColor: DARK, textColor: NEON, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: GRAY_LT },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 16, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
      },
      margin: { left: COL_RIGHT_X, right: MARGIN },
      tableWidth: COL_RIGHT_W,
      // Status color coding
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const val = data.cell.raw;
          if (val === "Lesionado") data.cell.styles.textColor = AMBER;
          else if (val === "Ausente") data.cell.styles.textColor = DANGER;
          else data.cell.styles.textColor = GREEN;
        }
      },
    });

    const yAfterTables = Math.max(doc.lastAutoTable.finalY, doc.previousAutoTable?.finalY || 0) + 10;
    curY = yAfterTables;

    // ── NOTAS + CHARLA ─────────────────────────────────────────────────────
    if (notas || charla) {
      const notasText  = notas  ? doc.splitTextToSize(notas,  CONTENT_W - 4) : null;
      const charlaText = charla ? doc.splitTextToSize(charla, CONTENT_W - 4) : null;
      const blockH =
        (notasText  ? notasText.length  * 4.5 + 14 : 0) +
        (charlaText ? charlaText.length * 4.5 + 14 : 0);

      // page break guard
      if (curY + blockH > PAGE_H - 20) {
        doc.addPage();
        curY = 20;
      }

      if (notasText) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK);
        doc.text("OBSERVACIONES DEL CUERPO TÉCNICO", MARGIN, curY);
        doc.setDrawColor(...NEON);
        doc.setLineWidth(0.5);
        doc.line(MARGIN, curY + 1.5, MARGIN + 60, curY + 1.5);
        curY += 7;
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(notasText, MARGIN + 2, curY);
        curY += notasText.length * 4.5 + 8;
      }

      if (charlaText) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK);
        doc.text("COMUNICACIÓN PREVIA A LA PLANTILLA", MARGIN, curY);
        doc.setDrawColor(...NEON);
        doc.setLineWidth(0.5);
        doc.line(MARGIN, curY + 1.5, MARGIN + 52, curY + 1.5);
        curY += 7;
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(charlaText, MARGIN + 2, curY);
        curY += charlaText.length * 4.5 + 8;
      }
    }

    // ── FOOTER ─────────────────────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      // neon separator line
      doc.setDrawColor(...NEON);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);
      // footer text
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_MID);
      doc.text(`Generado por Elevate Sports — ${today}`, MARGIN, PAGE_H - 7);
      doc.text(`${sessionId}  ·  Página ${p} de ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 7, { align: "right" });
    }

    doc.save(`planificacion-${sessionId}.pdf`);
    showToast("PDF generado correctamente", "success");
  };

  const inp = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", padding:"7px 10px", fontSize:11, color:"white", fontFamily:"inherit", outline:"none", width:"100%" };
  const lbl = { fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color:"rgba(255,255,255,0.3)", marginBottom:4, display:"block" };
  const panel = { background:"rgba(0,0,0,0.75)", border:"1px solid rgba(255,255,255,0.07)", padding:14, marginBottom:10 };
  const panelTitle = { fontSize:9, textTransform:"uppercase", letterSpacing:"2px", color:"rgba(255,255,255,0.35)", marginBottom:12 };
  const TASK_COLORS = ["#1D9E75","#EF9F27","#7F77DD","#E24B4A"];

  return (
    <div style={{ padding:16, display:"grid", gridTemplateColumns:"1fr 290px", gap:12 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

        {/* INFO SESIÓN */}
        <div style={panel}>
          <div style={panelTitle}>Datos del microciclo</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:10 }}>
            <div>
              <label style={lbl}>ID de sesión</label>
              <div style={{ ...inp, background:"rgba(29,158,117,0.08)", border:"1px solid rgba(29,158,117,0.2)", color:"#1D9E75", fontSize:10, letterSpacing:"0.5px", cursor:"default" }}>{sessionId}</div>
            </div>
            <div>
              <label style={lbl}>Sesión #</label>
              <div style={{ ...inp, background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.5)", cursor:"default", fontSize:12, fontWeight:500 }}>#{sessionCount + 1}</div>
            </div>
            <div>
              <label style={lbl}>Categoría</label>
              <select value={categoria} onChange={e=>setCategoria(e.target.value)} style={inp}>
                {(clubInfo?.categorias||["Sub-17"]).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Duración total (min)</label>
              <input type="number" value={duracionTotal} onChange={e=>updateDuracion(+e.target.value)} min={30} max={180} step={5} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Fecha</label>
              <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Hora</label>
              <input type="time" value={hora} onChange={e=>setHora(e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Campo</label>
              <select value={campo} onChange={e=>setCampo(e.target.value)} style={inp}>
                {(clubInfo?.campos||["Campo principal","Campo auxiliar"]).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Rival próximo</label>
              <input placeholder="Atlético Sur..." style={inp}/>
            </div>
          </div>

          {duracionTotal > 0 && (
            <div style={{ background:"rgba(29,158,117,0.06)", border:"1px solid rgba(29,158,117,0.15)", padding:"10px 12px" }}>
              <div style={{ fontSize:9, color:"#1D9E75", textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>Distribución sugerida para {duracionTotal} min</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {[["Calentamiento",tiempos.warmup],["Tarea 1",tiempos.tarea1],["Tarea 2",tiempos.tarea2],["Tarea 3",tiempos.tarea3],["Tarea 4",tiempos.tarea4]].map(([n,t])=>(
                  <div key={n} style={{ fontSize:10, padding:"3px 10px", background:"rgba(29,158,117,0.1)", border:"1px solid rgba(29,158,117,0.2)", color:"#1D9E75" }}>
                    {n}: <strong>{t} min</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* OBJETIVOS */}
        <div style={panel}>
          <div style={panelTitle}>Objetivos de la sesión</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <div>
              <label style={lbl}>Técnico-tácticos</label>
              <div style={{ position:"relative" }}>
                <input value={objTec} onChange={e=>setObjTec(e.target.value)} onFocus={()=>setShowTecRec(true)} onBlur={()=>setTimeout(()=>setShowTecRec(false),150)} placeholder="Pressing alto..." style={inp}/>
                {showTecRec && (
                  <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#111", border:"1px solid rgba(255,255,255,0.12)", zIndex:20 }}>
                    {RECOMENDACIONES.tecnico.map(r=>(
                      <div key={r} onMouseDown={()=>{setObjTec(r);setShowTecRec(false);}} style={{ padding:"7px 10px", fontSize:11, color:"rgba(255,255,255,0.6)", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{r}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label style={lbl}>Físicos</label>
              <div style={{ position:"relative" }}>
                <input value={objFis} onChange={e=>setObjFis(e.target.value)} onFocus={()=>setShowFisRec(true)} onBlur={()=>setTimeout(()=>setShowFisRec(false),150)} placeholder="Resistencia..." style={inp}/>
                {showFisRec && (
                  <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#111", border:"1px solid rgba(255,255,255,0.12)", zIndex:20 }}>
                    {RECOMENDACIONES.fisico.map(r=>(
                      <div key={r} onMouseDown={()=>{setObjFis(r);setShowFisRec(false);}} style={{ padding:"7px 10px", fontSize:11, color:"rgba(255,255,255,0.6)", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{r}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label style={lbl}>Período</label>
              <select value={periodo} onChange={e=>setPeriodo(e.target.value)} style={inp}>
                {["Pre-temporada","Competición","Transición"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* WARM UP */}
        <div style={panel}>
          <div style={panelTitle}>Calentamiento</div>
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(29,158,117,0.06)", border:"1px solid rgba(29,158,117,0.2)", borderLeft:"3px solid #1D9E75", padding:"8px 12px" }}>
            <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"1.5px", color:"#1D9E75", flexShrink:0 }}>Warm Up</div>
            <input value={warmupDesc} onChange={e=>setWarmupDesc(e.target.value)} placeholder="Descripción del calentamiento..." style={{ ...inp, background:"transparent", border:"none", flex:1 }}/>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4 }}>
              ⏱
              <input value={tiempos.warmup} onChange={e=>setTiempos({...tiempos,warmup:+e.target.value})} type="number" style={{ ...inp, width:44, textAlign:"center", background:"transparent", border:"none", borderBottom:"1px solid rgba(255,255,255,0.15)", padding:"2px 4px" }}/>
              min
            </div>
          </div>
        </div>

        {/* TAREAS */}
        <div style={panel}>
          <div style={panelTitle}>Estructura de la sesión</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {tareas.map((t, i) => (
              <div key={i} style={{ border:"1px solid rgba(255,255,255,0.07)", overflow:"hidden" }}>
                <div style={{ padding:"8px 12px", background:`${TASK_COLORS[i]}18`, borderBottom:`1px solid ${TASK_COLORS[i]}22`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"1.5px", color:TASK_COLORS[i], fontWeight:500 }}>Tarea {i+1}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:9, color:"rgba(255,255,255,0.3)" }}>
                    ⏱
                    <input value={[tiempos.tarea1,tiempos.tarea2,tiempos.tarea3,tiempos.tarea4][i]} onChange={e=>{const k=["tarea1","tarea2","tarea3","tarea4"][i];setTiempos({...tiempos,[k]:+e.target.value});}} type="number" style={{ ...inp, width:36, textAlign:"center", background:"transparent", border:"none", borderBottom:"1px solid rgba(255,255,255,0.15)", padding:"1px 3px", fontSize:11 }}/>
                    min
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 110px" }}>
                  <div style={{ padding:"10px 12px" }}>
                    <div style={{ marginBottom:8 }}>
                      <label style={lbl}>Objetivo</label>
                      <input value={t.objetivo} onChange={e=>updateTarea(i,"objetivo",e.target.value)} placeholder="Objetivo de la tarea..." style={{ ...inp, fontSize:10 }}/>
                    </div>
                    <div style={{ marginBottom:8 }}>
                      <label style={lbl}>Descripción</label>
                      <textarea value={t.descripcion} onChange={e=>updateTarea(i,"descripcion",e.target.value)} rows={3} placeholder="Descripción del ejercicio..." style={{ ...inp, fontSize:10, resize:"none" }}/>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {[["Series","series"],["Tiempo","tiempo"],["Repeticiones","repeticiones"]].map(([l,k])=>(
                        <div key={k} style={{ flex:1 }}>
                          <label style={lbl}>{l}</label>
                          <input value={t[k]} onChange={e=>updateTarea(i,k,e.target.value)} style={{ ...inp, fontSize:10, padding:"4px 6px" }}/>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PIZARRA */}
                  <div style={{ padding:8, background:"rgba(255,255,255,0.02)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderLeft:"1px solid rgba(255,255,255,0.05)", gap:6 }}>
                    {t.analizando ? (
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:9, color:"#1D9E75", textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>Analizando...</div>
                        <div style={{ fontSize:8, color:"rgba(255,255,255,0.3)" }}>Claude está recreando el diagrama</div>
                      </div>
                    ) : t.svgRec ? (
                      <div>
                        <div style={{ fontSize:7, color:"#1D9E75", textTransform:"uppercase", letterSpacing:"1px", marginBottom:4, textAlign:"center" }}>Recreado por IA</div>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.svgRec.replace(/width="[^"]*"/, 'width="94"').replace(/height="[^"]*"/, 'height="100"'), { USE_PROFILES: { svg: true }, FORBID_TAGS: ["script", "use"], FORBID_ATTR: ["onload", "onerror", "onmouseover", "href", "xlink:href"] }) }}/>
                        <div onClick={()=>fileRefs.current[i]?.click()} style={{ fontSize:7, color:"rgba(255,255,255,0.3)", textAlign:"center", cursor:"pointer", marginTop:4 }}>cambiar imagen</div>
                      </div>
                    ) : t.imagenPreview ? (
                      <div>
                        <img src={t.imagenPreview} alt="" style={{ width:94, height:80, objectFit:"contain" }}/>
                        <div onClick={()=>fileRefs.current[i]?.click()} style={{ fontSize:7, color:"rgba(255,255,255,0.3)", textAlign:"center", cursor:"pointer", marginTop:4 }}>cambiar</div>
                      </div>
                    ) : (
                      <div onClick={()=>fileRefs.current[i]?.click()} style={{ textAlign:"center", cursor:"pointer" }}>
                        <svg width="94" height="80" viewBox="0 0 94 80" xmlns="http://www.w3.org/2000/svg">
                          <rect width="94" height="80" fill="#0a2010"/>
                          <rect x="4" y="4" width="86" height="72" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                          <line x1="4" y1="40" x2="90" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
                          <circle cx="47" cy="40" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
                        </svg>
                        <div style={{ fontSize:8, color:"rgba(29,158,117,0.7)", marginTop:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>+ Subir imagen</div>
                        <div style={{ fontSize:7, color:"rgba(255,255,255,0.2)", marginTop:2 }}>Claude la recreará</div>
                      </div>
                    )}
                    <input ref={el=>fileRefs.current[i]=el} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleImageUpload(i, e.target.files[0])}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SIDEBAR DERECHO */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

        {/* JUGADORES */}
        <div style={panel}>
          <div style={panelTitle}>Plantilla — {categoria}</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:10 }}>Deportistas convocados para esta sesión</div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:9, color:"#1D9E75" }}>{selectedPlayers.length} seleccionados</span>
            <div style={{ display:"flex", gap:10 }}>
              <span onClick={()=>setSelectedPlayers(athletes.map(a=>a.id))} style={{ fontSize:9, color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>Todos</span>
              <span onClick={()=>setSelectedPlayers([])} style={{ fontSize:9, color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>Ninguno</span>
            </div>
          </div>
          {["Portero","Defensa","Mediocampista","Delantero"].map(pos => {
            const grupo = athletes.filter(a=>a.pos===pos);
            if (!grupo.length) return null;
            return (
              <div key={pos} style={{ marginBottom:10 }}>
                <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color:"rgba(255,255,255,0.25)", marginBottom:5, borderBottom:"1px solid rgba(255,255,255,0.06)", paddingBottom:4 }}>{pos}s</div>
                {grupo.map(a => {
                  const sel = selectedPlayers.includes(a.id);
                  return (
                    <div key={a.id} onClick={()=>togglePlayer(a.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", cursor:"pointer", background: sel?"rgba(29,158,117,0.08)":"transparent", border:`1px solid ${sel?"rgba(29,158,117,0.2)":"transparent"}`, marginBottom:3 }}>
                      <div style={{ width:8, height:8, border:`1px solid ${sel?"#1D9E75":"rgba(255,255,255,0.2)"}`, background: sel?"#1D9E75":"transparent", flexShrink:0 }}/>
                      <div style={{ fontSize:11, color: sel?"white":"rgba(255,255,255,0.45)" }}>{a.name}</div>
                      {a.status==="L" && <div style={{ fontSize:8, color:"#EF9F27", marginLeft:"auto" }}>LES</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* MATERIALES */}
        <div style={panel}>
          <div style={panelTitle}>Material de sesión</div>
          {materiales.map((m,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              <div style={{ flex:1, fontSize:11, color:"rgba(255,255,255,0.7)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", padding:"5px 10px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.nombre}</div>
              <input type="number" value={m.cantidad} onChange={e=>updateMaterialQty(i,+e.target.value)} min={1} style={{ ...inp, width:52, textAlign:"center", padding:"5px 4px" }}/>
              <span onClick={()=>removeMaterial(i)} style={{ fontSize:11, color:"#E24B4A", cursor:"pointer", padding:"0 4px" }}>✕</span>
            </div>
          ))}
          <div style={{ marginTop:10, borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:10 }}>
            <div style={{ fontSize:8, textTransform:"uppercase", letterSpacing:"1px", color:"rgba(255,255,255,0.25)", marginBottom:6 }}>Registrar material</div>
            <div style={{ position:"relative", marginBottom:6 }}>
              <input value={newMat} onChange={e=>{setNewMat(e.target.value);setShowMatRec(true);}} onBlur={()=>setTimeout(()=>setShowMatRec(false),150)} placeholder="Nombre del material..." style={inp}/>
              {showMatRec && newMat && (
                <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#111", border:"1px solid rgba(255,255,255,0.12)", zIndex:20, maxHeight:160, overflowY:"auto" }}>
                  {MATERIALES_COMUNES.filter(m=>m.toLowerCase().includes(newMat.toLowerCase())).map(m=>(
                    <div key={m} onMouseDown={()=>{setNewMat(m);setShowMatRec(false);}} style={{ padding:"6px 10px", fontSize:11, color:"rgba(255,255,255,0.6)", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{m}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <input type="number" value={newMatQty} onChange={e=>setNewMatQty(+e.target.value)} min={1} placeholder="Cant." style={{ ...inp, width:70 }}/>
              <div onClick={addMaterial} style={{ flex:1, background:"#1D9E75", color:"white", padding:"7px 12px", fontSize:10, textTransform:"uppercase", letterSpacing:"1px", cursor:"pointer", textAlign:"center" }}>+ Registrar</div>
            </div>
          </div>
        </div>

        {/* NOTAS */}
        <div style={panel}>
          <div style={panelTitle}>Observaciones técnicas</div>
          <label style={lbl}>Notas del cuerpo técnico</label>
          <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={3} placeholder="Variables a reforzar, patrones a corregir, carga prevista..." style={{ ...inp, resize:"none", marginBottom:10 }}/>
          <label style={lbl}>Comunicación previa a la plantilla</label>
          <textarea value={charla} onChange={e=>setCharla(e.target.value)} rows={3} placeholder="Mensaje motivacional, énfasis táctico, consignas del microciclo..." style={{ ...inp, resize:"none" }}/>
        </div>

        <div onClick={()=>showToast(`Sesión ${sessionId} registrada`, "success")} style={{ background:"#1D9E75", color:"white", padding:10, fontSize:10, textTransform:"uppercase", letterSpacing:"1.5px", cursor:"pointer", textAlign:"center" }}>
          Confirmar planificación →
        </div>
        <ExportPDFButton onClick={generarPDF} />
        <div onClick={()=>showToast("Plantilla guardada", "info")} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.4)", padding:10, fontSize:10, textTransform:"uppercase", letterSpacing:"1.5px", cursor:"pointer", textAlign:"center", marginTop:6 }}>
          Guardar como plantilla base
        </div>

      </div>
    </div>
  );
}
