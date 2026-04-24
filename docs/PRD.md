# PRD - ALTTEZ Sports Management Platform

## 1. Resumen

ALTTEZ es una plataforma de gestion deportiva para clubes de futbol y organizaciones formativas en Latinoamerica. El producto unifica operaciones deportivas, administrativas y de seguimiento de rendimiento en una sola experiencia web instalable, con enfoque offline-first y soporte multi-tenant por club.

El objetivo del producto es reemplazar flujos fragmentados basados en hojas de calculo, chats y herramientas desconectadas por un sistema unico que permita administrar plantilla, entrenamientos, partidos, calendario, asistencia, finanzas y salud del deportista.

## 2. Problema

Hoy muchos clubes gestionan su operacion con una combinacion de:

- hojas de calculo para pagos, asistencia y plantilla
- grupos de WhatsApp para comunicacion y RSVP
- memoria del cuerpo tecnico para carga, fatiga y seguimiento
- herramientas aisladas para tactica, rendimiento y reportes

Esto genera errores operativos, baja trazabilidad, poca disciplina de datos y decisiones tardias sobre carga, riesgo y administracion del club.

## 3. Vision del producto

Construir la plataforma de gestion deportiva de referencia para clubes latinoamericanos, comenzando por futbol formativo y semiprofesional, con una experiencia profesional, accesible y basada en datos.

## 4. Objetivos

### Objetivos de negocio

- Centralizar la operacion del club en una sola plataforma.
- Mejorar la retencion de clubes gracias al valor diario del sistema.
- Diferenciar el producto mediante ciencia deportiva aplicada y experiencia offline-first.

### Objetivos del usuario

- Reducir tiempo administrativo semanal del staff.
- Tener visibilidad clara de asistencia, pagos, carga y rendimiento.
- Tomar decisiones mas rapidas sobre disponibilidad, riesgo y planificacion.

## 5. Usuarios y perfiles

### Administrador del club

Responsable de configuracion general, pagos, movimientos, gestion de usuarios y control operativo.

### Entrenador

Responsable de sesiones, asistencia, carga RPE, seguimiento de atletas, calendario y decisiones deportivas.

### Staff de apoyo

Responsable de apoyo administrativo o deportivo con permisos limitados.

### Atleta o acudiente

Usuario indirecto del sistema a traves de confirmaciones publicas de asistencia y posiblemente futuras experiencias de consulta.

## 6. Propuesta de valor

- Una sola plataforma para operacion deportiva y administrativa.
- Funciona aun sin conexion y sincroniza cuando vuelve internet.
- Datos aislados por club con seguridad basada en `club_id`.
- Algoritmos simples de entender para entrenadores, pero respaldados por metodologia documentada.
- Experiencia visual premium orientada al contexto deportivo.

## 7. Alcance actual del producto

### Modulos en produccion

- Portal comercial y paginas publicas.
- Autenticacion y acceso por roles.
- Dashboard operativo.
- Gestion de plantilla.
- Pizarra tactica interactiva.
- Modulo de entrenamiento con registro RPE y asistencia.
- Calendario de eventos y RSVP publico.
- Match Center para registro post-partido.
- Finanzas y movimientos.
- Configuracion del club.
- Reportes operativos.

### Capacidades clave

- Registro y administracion de atletas.
- Importacion masiva de atletas.
- Registro de sesiones y seguimiento de carga percibida.
- Evaluacion basica de salud deportiva mediante RPE.
- Registro de estadisticas de partido y score compuesto.
- Confirmacion publica de asistencia a eventos.
- Persistencia local con sincronizacion a Supabase.
- Instalacion como PWA.

## 8. Casos de uso principales

1. Como administrador, quiero registrar y mantener la informacion del club para operar la plataforma con datos confiables.
2. Como entrenador, quiero registrar entrenamientos y RPE para monitorear carga y riesgo.
3. Como entrenador, quiero gestionar la plantilla y usar una pizarra tactica para planificar sesiones y partidos.
4. Como staff, quiero consultar calendario y asistencia para organizar la semana del equipo.
5. Como administrador, quiero registrar pagos y movimientos para controlar morosidad y flujo financiero.
6. Como entrenador, quiero registrar el resultado y las estadisticas de un partido para evaluar rendimiento.
7. Como atleta o acudiente, quiero confirmar asistencia a un evento desde un enlace publico.

## 9. Requisitos funcionales

### Autenticacion y acceso

- El sistema debe permitir registro e inicio de sesion.
- El sistema debe crear y vincular perfil de usuario a un club.
- El sistema debe restringir acceso por roles `admin`, `coach` y `staff`.

### Gestion del club y plantilla

- El sistema debe permitir crear y editar informacion del club.
- El sistema debe permitir registrar, editar y consultar atletas.
- El sistema debe permitir carga masiva de atletas por archivo.

### Entrenamiento y salud

- El sistema debe permitir registrar sesiones de entrenamiento.
- El sistema debe permitir registrar asistencia por atleta.
- El sistema debe calcular indicadores de salud basados en RPE.
- El sistema debe mostrar alertas de riesgo de forma comprensible.

### Tactica y partido

- El sistema debe ofrecer una pizarra tactica interactiva.
- El sistema debe permitir registrar estadisticas post-partido.
- El sistema debe calcular un score de rendimiento por atleta.

### Calendario y RSVP

- El sistema debe permitir crear eventos del calendario.
- El sistema debe permitir confirmar asistencia desde una ruta publica.

### Finanzas

- El sistema debe permitir registrar pagos y movimientos.
- El sistema debe ofrecer visibilidad sobre estado financiero y morosidad.

### Plataforma y datos

- El sistema debe seguir operando sin conexion para flujos criticos.
- El sistema debe sincronizar con backend al recuperar conectividad.
- El sistema debe aislar datos por club en todas las operaciones persistentes.

## 10. Requisitos no funcionales

- La experiencia debe estar disponible como PWA instalable.
- La interfaz debe estar en espanol para mercado latinoamericano.
- La plataforma debe priorizar rendimiento aceptable en dispositivos moviles.
- La arquitectura debe soportar operacion offline-first.
- La persistencia remota debe usar controles de seguridad por RLS en Supabase.
- El producto debe considerar cumplimiento de tratamiento de datos personales aplicable al contexto colombiano.

## 11. Principios de producto

- Claridad antes que complejidad: las metricas deben traducirse en acciones comprensibles.
- El deportista primero: las alertas deben priorizar prevencion y cuidado.
- Un solo origen operativo: evitar duplicidad entre modulos y canales externos.
- Continuidad operativa: el club debe poder seguir trabajando aun con mala conectividad.

## 12. Metricas de exito sugeridas

- Clubes activos semanalmente.
- Sesiones de entrenamiento registradas por club por semana.
- Porcentaje de atletas con RPE registrado en los ultimos 7 dias.
- Tasa de confirmacion RSVP sobre eventos creados.
- Porcentaje de pagos registrados vs. cartera esperada.
- Frecuencia de uso de modulos clave: plantilla, entrenamiento, calendario, finanzas.
- Tasa de sincronizacion exitosa tras uso offline.

## 13. Limitaciones conocidas

- El modelo actual de RPE no incluye duracion de la sesion.
- Aun no existe ACWR completo para carga aguda vs. cronica.
- Parte del flujo offline depende de `localStorage`, con riesgos de sincronizacion y manipulacion local.
- La cobertura automatizada de pruebas sigue siendo limitada frente al alcance funcional.
- Existen zonas del producto con fuerte concentracion de estado y logica, lo que dificulta escalar nuevas capacidades.

## 14. Oportunidades y roadmap de producto

### Corto plazo

- Formalizar el PRD y alinear backlog con objetivos de producto.
- Mejorar cobertura de pruebas en flujos criticos.
- Reducir acoplamiento de estado en la aplicacion principal.

### Mediano plazo

- Agregar `duracionMinutos` a sesiones y evolucionar el motor de carga.
- Incorporar ACWR cuando exista suficiente historico por atleta.
- Sincronizar snapshots de salud de forma multi-dispositivo.
- Fortalecer validacion de estados locales y seguridad del fallback offline.

### Largo plazo

- Calibrar el score de rendimiento con datos reales.
- Introducir modelos de riesgo de lesion con mayor profundidad.
- Expandir reportes y analitica para toma de decisiones por club.

## 15. Fuera de alcance por ahora

- Modelos predictivos avanzados de lesion listos para produccion.
- Calibracion estadistica completa por posicion del score de rendimiento.
- Experiencias avanzadas para atletas finales dentro de la misma app autenticada.
- Soporte multi-deporte formal mas alla del enfoque actual en futbol.

## 16. Dependencias

- Supabase para autenticacion, base de datos y politicas RLS.
- Persistencia local del navegador para continuidad offline.
- Infraestructura web para despliegue del frontend.
- Disciplina operativa del club para captura consistente de datos.

## 17. Riesgos

- Captura incompleta de datos puede degradar el valor de las metricas.
- La dependencia parcial de almacenamiento local puede producir inconsistencia entre dispositivos.
- Una arquitectura de estado muy concentrada puede ralentizar futuras iteraciones.
- Si el producto no demuestra valor diario, los clubes pueden volver a herramientas informales.

## 18. Criterios de exito del PRD

Este documento se considera util si permite:

- alinear negocio, producto y tecnologia sobre que problema resuelve ALTTEZ
- distinguir claramente alcance actual, limitaciones y proximo roadmap
- servir como base para backlog, priorizacion y conversaciones con stakeholders

## 19. Fuentes base

Este PRD fue sintetizado a partir de la documentacion actual del repositorio:

- `README.md`
- `docs/001-project-analysis-gap-assessment.md`
- `docs/architecture.md`
- `docs/DATA_METHODOLOGY.md`
- `.omc/project-memory.json`

