/**
 * @component AuthFormField
 * @description Campo de formulario reutilizable para pantallas de auth.
 * Incluye label, children slot y mensaje de error inline.
 */
export function AuthFormField({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-[#1F1F1D]/70 mb-1.5 ml-1">
        {label}
      </label>
      {children}
      {error && (
        <div className="text-[11px] font-medium text-[#D95C5C] mt-1.5 ml-1">
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
    fontSize: "14px",
    padding: "14px 16px",
    backgroundColor: "#FFFFFF",
    border: `1px solid ${hasError ? "#D95C5C" : "#EDE8D0"}`,
    borderRadius: "12px",
    color: "#1F1F1D",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  };
}
