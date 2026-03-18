import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reportes({ athletes, historial, clubInfo }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [destinatario, setDestinatario] = useState("directivos");
  const [generando, setGenerando] = useState(false);

  const inp = {
    fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8,
    padding: "8px 10px", background: "#f9fafb", color: "#111827",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  const sesionesEnRango = historial; // en producción filtrar por fecha

  const totalPresencias = sesionesEnRango.reduce((a, s) => a + s.presentes, 0);
  const totalPosibles = sesionesEnRango.reduce((a, s) => a + s.total, 0);
  const asistenciaGral = totalPosibles > 0 ? ((totalPresencias / totalPosibles) * 100).toFixed(1) : "—";
  const rpes = sesionesEnRango.filter(s => s.rpeAvg).map(s => +s.rpeAvg);
  const rpeGral = rpes.length ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1) : "—";
  const lesionados = athletes.filter(a => a.status === "L");

  const generarPDF = () => {
    setGenerando(true);
    const doc = new jsPDF();
    const verde = [29, 158, 117];
    const gris = [107, 114, 128];
    const negro = [17, 24, 39];

    // Encabezado
    doc.setFillColor(...verde);
    doc.rect(0, 0, 210, 28, "F");

    if (clubInfo?.logo) {
      try { doc.addImage(clubInfo.logo, "PNG", 8, 4, 20, 20); } catch(e) {}
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(clubInfo?.nombre || "Elevate Sports", clubInfo?.logo ? 32 : 14, 13);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${clubInfo?.disciplina || "Fútbol"} — ${clubInfo?.categoria || "Sub-17"} | ${clubInfo?.ciudad || "Medellín"}`, clubInfo?.logo ? 32 : 14, 20);

    const labelDest = { directivos: "Directivos del club", padres: "Padres de familia", interno: "Uso interno" };
    doc.text(`Reporte para: ${labelDest[destinatario]}`, 140, 13);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 140, 20);

    // Período
    doc.setTextColor(...negro);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Período del reporte", 14, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...gris);
    doc.text(`${fechaInicio || "Inicio del ciclo"} — ${fechaFin || "Fecha actual"}`, 14, 45);
    doc.text(`Entrenador: ${clubInfo?.entrenador || "—"}`, 120, 38);
    doc.text(`Sesiones analizadas: ${sesionesEnRango.length}`, 120, 45);

    // Métricas resumen
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, 52, 55, 24, 3, 3, "FD");
    doc.roundedRect(77, 52, 55, 24, 3, 3, "FD");
    doc.roundedRect(140, 52, 55, 24, 3, 3, "FD");

    const metricas = [
      { label: "Asistencia general", value: asistenciaGral + "%", x: 41 },
      { label: "RPE promedio", value: rpeGral, x: 104 },
      { label: "Deportistas activos", value: athletes.filter(a => a.status === "P").length, x: 167 },
    ];
    metricas.forEach(m => {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...verde);
      doc.text(String(m.value), m.x, 66, { align: "center" });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gris);
      doc.text(m.label, m.x, 72, { align: "center" });
    });

    // Tabla asistencia por sesión
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...negro);
    doc.text("Registro de sesiones", 14, 86);

    autoTable(doc, {
      startY: 90,
      head: [["Sesión", "Fecha", "Presentes", "Total", "Asistencia", "RPE prom.", "Tipo"]],
      body: sesionesEnRango.map(s => [
        `#${s.num}`, s.fecha, s.presentes, s.total,
        ((s.presentes / s.total) * 100).toFixed(0) + "%",
        s.rpeAvg ?? "—", s.tipo,
      ]),
      headStyles: { fillColor: verde, textColor: 255, fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9, textColor: negro },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
    });

    // Tabla plantel
    const y2 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...negro);
    doc.text("Plantel de deportistas", 14, y2);

    autoTable(doc, {
      startY: y2 + 4,
      head: [["Nombre", "Posición", "Estado", "RPE última sesión"]],
      body: athletes.map(a => [
        a.name, a.pos,
        a.status === "P" ? "Presente" : a.status === "A" ? "Ausente" : "Lesionado",
        a.rpe ?? "—",
      ]),
      headStyles: { fillColor: verde, textColor: 255, fontSize: 9, fontStyle: "bold" },
      bodyStyles: { fontSize: 9, textColor: negro },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const val = data.cell.raw;
          if (val === "Lesionado") doc.setTextColor(186, 117, 23);
          else if (val === "Ausente") doc.setTextColor(163, 45, 45);
          else doc.setTextColor(15, 110, 86);
        }
      },
    });

    // Notas del entrenador (solo en reporte interno y directivos)
    if (destinatario !== "padres" && sesionesEnRango.some(s => s.nota)) {
      const y3 = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...negro);
      doc.text("Notas del entrenador", 14, y3);
      let yActual = y3 + 6;
      sesionesEnRango.filter(s => s.nota).forEach(s => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...negro);
        doc.text(`Sesión #${s.num} — ${s.fecha}:`, 14, yActual);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gris);
        const lines = doc.splitTextToSize(s.nota, 180);
        doc.text(lines, 14, yActual + 5);
        yActual += 5 + lines.length * 5 + 4;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(229, 231, 235);
      doc.line(14, 285, 196, 285);
      doc.setFontSize(8);
      doc.setTextColor(...gris);
      doc.text(`${clubInfo?.nombre || "Elevate Sports"} — Reporte generado con Elevate Sports`, 14, 290);
      doc.text(`Página ${i} de ${pageCount}`, 196, 290, { align: "right" });
    }

    const nombre = `reporte-${clubInfo?.nombre?.replace(/\s+/g, "-").toLowerCase() || "elevate"}-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(nombre);
    setGenerando(false);
  };

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Generador de reportes
      </div>

      {/* Configuración */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 12 }}>Parámetros del reporte</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Fecha inicio</div>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{ ...inp, width: "100%" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Fecha fin</div>
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ ...inp, width: "100%" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" }}>Destinatario</div>
            <select value={destinatario} onChange={e => setDestinatario(e.target.value)} style={{ ...inp, width: "100%" }}>
              <option value="directivos">Directivos del club</option>
              <option value="padres">Padres de familia</option>
              <option value="interno">Uso interno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview métricas */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 12 }}>Vista previa del contenido</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Sesiones incluidas", value: sesionesEnRango.length, color: "#1D9E75" },
            { label: "Asistencia general", value: asistenciaGral + "%", color: "#1D9E75" },
            { label: "RPE promedio", value: rpeGral, color: "#374151" },
            { label: "Deportistas lesionados", value: lesionados.length, color: lesionados.length > 0 ? "#BA7517" : "#1D9E75" },
          ].map((m, i) => (
            <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>El reporte incluirá:</div>
        {[
          { texto: "Encabezado con logo y datos del club", ok: true },
          { texto: "Registro completo de sesiones con asistencia y RPE", ok: sesionesEnRango.length > 0 },
          { texto: "Plantel completo con estado actual", ok: athletes.length > 0 },
          { texto: "Notas del entrenador por sesión", ok: destinatario !== "padres" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: item.ok ? "#E1F5EE" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: item.ok ? "#1D9E75" : "#9ca3af" }}>{item.ok ? "✓" : "—"}</span>
            </div>
            <span style={{ fontSize: 12, color: item.ok ? "#374151" : "#9ca3af" }}>{item.texto}</span>
          </div>
        ))}
      </div>

      {/* Info del club */}
      {!clubInfo?.nombre && (
        <div style={{ background: "#FAEEDA", border: "1px solid #EF9F27", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#854F0B" }}>
          Completa la información del club en la pestaña "Club" para que aparezca en el reporte.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={generarPDF}
          disabled={generando}
          style={{ background: generando ? "#9ca3af" : "#1D9E75", color: "white", border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 500, cursor: generando ? "not-allowed" : "pointer" }}
        >
          {generando ? "Generando..." : "Generar PDF"}
        </button>
      </div>
    </div>
  );
}
