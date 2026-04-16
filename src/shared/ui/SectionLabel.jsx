/**
 * @component SectionLabel
 * @description Etiqueta de sección uppercase. Reemplaza el patrón
 * fontSize:9 + textTransform:uppercase + letterSpacing duplicado en 20+ archivos.
 *
 * Props:
 *  accent  {string}  Color para border-left de 2px (opcional)
 *  as      {string}  Elemento HTML (default "div")
 */
export default function SectionLabel({ accent, as: Tag = "div", className = "", style = {}, children, ...rest }) {
  return (
    <Tag
      className={`section-label ${className}`}
      style={{
        ...(accent ? { borderLeft: `2px solid ${accent}`, paddingLeft: 7 } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
