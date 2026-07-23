import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Los motores de torneos son funciones puras → entorno node basta.
    // Tests que necesiten DOM pueden declarar // @vitest-environment jsdom por archivo.
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    // Tests legacy huérfanos de la era CRM (pre-migración a Next.js): importan
    // react-router-dom / @testing-library / módulos inexistentes, o asumen jsdom.
    // Nunca corrieron (no había config de vitest). Quedan como deuda a triagear,
    // no como guardarraíl. Ver docs/adr cuando se aborde la limpieza.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "src/tests/crm/**",
      "src/tests/auth/**",
      "src/tests/shared/healthService.test.js",
    ],
    globals: true,
  },
});
