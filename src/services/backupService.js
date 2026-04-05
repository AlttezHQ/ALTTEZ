/**
 * @module backupService
 * @description Exportar backup JSON completo de todos los datos de ALTTEZ.
 * Si el navegador falla, el usuario no pierde su vida.
 *
 * @author @Data (Mateo-Data_Engine)
 * @version 1.0.0
 */

import { STORAGE_KEYS } from "../constants/initialStates";

/**
 * Genera un backup JSON con todas las keys de ALTTEZ y lo descarga como archivo.
 * Incluye metadata (timestamp, versión, keys exportadas).
 *
 * @returns {boolean} true si descarga exitosa, false si falló
 */
export function exportBackupJSON() {
  try {
    const backup = {
      _meta: {
        app: "ALTTEZ",
        exportedAt: new Date().toISOString(),
        schemaVersion: localStorage.getItem("alttez_schema_version") || "unknown",
        keysExported: STORAGE_KEYS.length,
      },
      data: {},
    };

    STORAGE_KEYS.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        backup.data[key] = raw ? JSON.parse(raw) : null;
      } catch {
        backup.data[key] = null;
      }
    });

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    const clubName = (backup.data["alttez_clubInfo"]?.nombre || "alttez").replace(/\s+/g, "_").toLowerCase();
    a.download = `alttez_backup_${clubName}_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (e) {
    console.error("[backupService] Export failed:", e);
    return false;
  }
}

/**
 * Importa un backup JSON y restaura los datos en localStorage.
 * Valida estructura antes de sobrescribir.
 *
 * @param {string} jsonString - Contenido del archivo de backup
 * @returns {{ success: boolean, error?: string, keysRestored?: number }}
 */
export function importBackupJSON(jsonString) {
  try {
    const backup = JSON.parse(jsonString);

    if (!backup._meta || !backup.data) {
      return { success: false, error: "Formato de backup inválido: falta _meta o data" };
    }

    if (backup._meta.app !== "ALTTEZ" && backup._meta.app !== "Elevate Sports") {
      return { success: false, error: "Este archivo no es un backup valido de ALTTEZ" };
    }

    let keysRestored = 0;
    Object.entries(backup.data).forEach(([key, value]) => {
      if (STORAGE_KEYS.includes(key) && value != null) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          keysRestored++;
        } catch {
          // Quota exceeded — skip this key
        }
      }
    });

    return { success: true, keysRestored };
  } catch {
    return { success: false, error: "Error al parsear el archivo JSON" };
  }
}
