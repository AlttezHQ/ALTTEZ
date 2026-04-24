# GO TO MARKET - 3 SEMANAS

## Objetivo

Salir a mercado con una version comercial controlada de ALTTEZ para captar y activar los primeros 1 a 3 clubes pagantes sin prometer un lanzamiento abierto de autoservicio.

## Enfoque

- Vender una implementacion guiada, no una plataforma totalmente autoservicio.
- Congelar features nuevas salvo cambios que destraben comercializacion, confianza y operacion.
- Priorizar continuidad operativa, claridad comercial y activacion del primer club.

## Semana 1 - Bloqueos P0

### Infraestructura y release

- Mover despliegue a plan comercial valido de Vercel.
- Mover Supabase a plan sin auto-pause y con backups.
- Definir dominio canonico del producto y app.
- Configurar variables de entorno reales de contacto, privacidad y WhatsApp.
- Dejar `build`, `test` y `lint` en estado ejecutable para release.

### Confianza comercial

- Activar correo comercial real.
- Activar canal real de demo: WhatsApp o agenda comercial.
- Corregir pagina de privacidad con contacto valido y fecha vigente.
- Definir propuesta comercial base: piloto guiado, alcance, tiempo de implementacion y soporte.

## Semana 2 - Bloqueos P1

### Activacion del primer club

- Crear checklist de onboarding operativo.
- Estandarizar flujo de alta del club, usuario admin y datos iniciales.
- Validar importacion de plantilla con un caso real.
- Validar calendario, RSVP, pagos y registro de sesiones con un club piloto.

### Marketing y ventas

- Cerrar hero, CTA y pagina de contacto con mensaje claro para comprador institucional.
- Preparar demo guiada de 15 a 20 minutos con datos creibles.
- Definir pricing piloto y condiciones comerciales.
- Crear una propuesta PDF o one-pager para envio comercial.

## Semana 3 - Cierre P1/P2

### Operacion minima

- Configurar monitoreo de errores.
- Definir canal y SLA de soporte inicial.
- Preparar respaldo manual y procedimiento de contingencia.
- Documentar incidencias conocidas y limites del piloto.

### Cierre comercial

- Cerrar terminos comerciales y tratamiento de datos con el primer club.
- Ejecutar demo con 5 a 10 prospectos.
- Convertir 1 a 3 pilotos con onboarding asistido.

## Criterios de salida

Se puede salir a mercado cuando se cumpla lo siguiente:

- El sitio tiene CTA funcional a contacto real.
- Hay dominio y correo de marca definidos.
- El producto puede mostrarse en demo sin flujos rotos evidentes.
- Existe un camino claro para activar un club nuevo.
- Hay un responsable de soporte y seguimiento comercial.

## Riesgos a vigilar

- Vender demasiado alcance antes de estabilizar la operacion.
- Lanzar sin canal real de soporte o contacto.
- Mantener mensajes de marketing mas aspiracionales que reales.
- Depender de configuraciones placeholder en produccion.
