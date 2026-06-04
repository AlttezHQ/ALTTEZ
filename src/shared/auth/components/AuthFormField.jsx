/**
 * @component AuthFormField
 * @description Campo de formulario reutilizable para pantallas de auth.
 * Incluye label, children slot y mensaje de error inline.
 */
export function AuthFormField({ label, error, children }) {
  return (
    <div className="mb-5">
      <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#1F1F1D]/55 mb-2">
        {label}
      </label>
      {children}
      {error && (
        <div className="text-[11px] font-medium text-[#D95C5C] mt-2">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Retorna las clases de Tailwind base para inputs de auth.
 */
export function mkAuthInput(hasError) {
  // En lugar de retornar un objeto de estilos, ahora retorna un string con las clases.
  // El código legacy puede seguir usando style={mkAuthInput()} y fallará si no lo actualizamos.
  // Para evitar romper los archivos que aún no hemos actualizado, vamos a hacer un truco temporal
  // devolviendo estilos en línea, PERO idealmente los componentes deberían usar className.
  return {
    width: "100%",
    fontSize: "15px",
    fontWeight: 500,
    padding: "14px 16px",
    backgroundColor: "#FFFFFF",
    border: `1px solid ${hasError ? "#D95C5C" : "#E2D9C9"}`,
    borderRadius: "12px",
    color: "#1F1F1D",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    boxShadow: "inset 0 1px 2px rgba(31,31,29,0.04)",
  };
}
