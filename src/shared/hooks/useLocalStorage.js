import { useState, useEffect } from "react";

// Callback global para errores de storage — inyectado desde App via setStorageErrorHandler
let _hookErrorHandler = null;
export function setHookErrorHandler(handler) { _hookErrorHandler = handler; }

/**
 * Custom hook that syncs a state value with localStorage.
 * Errores de cuota/corrupcion se reportan visual y audiblemente (no silenciosos).
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - fallback value if nothing in storage or parsing fails
 * @returns {[*, Function]} - [value, setValue] like useState
 */
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading "${key}":`, error.message);
      if (_hookErrorHandler) {
        _hookErrorHandler(`Error leyendo datos guardados (${key}). Usando valores por defecto.`);
      }
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`[useLocalStorage] Error writing "${key}":`, error.name);
      if (_hookErrorHandler) {
        _hookErrorHandler(`Error guardando datos (${error.name}). Libera espacio en tu navegador.`);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
