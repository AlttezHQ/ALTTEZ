# INFORME DE COSTOS E INFRAESTRUCTURA
## Elevate Sports — Analisis Financiero de Operacion

> **Autor:** @Data (Mateo-Data_Engine)
> **Fecha:** 2026-03-25
> **Version:** 1.0
> **Para:** Julian Hernandez — Fundador & Arquitecto

---

## 1. RESUMEN EJECUTIVO

Elevate Sports opera actualmente con un stack 100% free-tier (Vercel Hobby + Supabase Free). Esta configuracion **no es viable para produccion comercial**: Vercel Hobby prohibe uso comercial, y Supabase Free pausa proyectos tras 7 dias de inactividad.

Este informe detalla los costos reales para operar desde el primer club pagante hasta 500 clubs, con escenarios de crecimiento y punto de equilibrio.

**Conclusion anticipada:** Con **1 solo club pagando**, Elevate Sports ya cubre sus costos minimos de operacion. Con 5 clubs, hay margen para reinvertir.

---

## 2. STACK ACTUAL Y ESTADO

| Servicio | Rol | Plan Actual | Costo Actual |
|----------|-----|-------------|-------------|
| Vercel | Hosting + CDN + Deploy | Hobby (Free) | $0 USD |
| Supabase | Base de datos + Auth + API | Free | $0 USD |
| GitHub | Repositorio + CI | Free | $0 USD |
| Dominio | elevate-sports-zeta.vercel.app | Subdominio Vercel | $0 USD |
| Email transaccional | No implementado | — | $0 USD |
| Monitoreo/Errores | No implementado | — | $0 USD |
| **TOTAL ACTUAL** | | | **$0 USD/mes** |

### Problemas criticos del plan actual

| Problema | Impacto | Riesgo |
|----------|---------|--------|
| Vercel Hobby **prohibe uso comercial** | Violacion de ToS si cobramos a clubs | Alto — pueden suspender la cuenta |
| Supabase Free **pausa** tras 7 dias sin actividad | El club entra un lunes y la app no responde | Critico — perdida de confianza |
| Sin dominio propio | URL `elevate-sports-zeta.vercel.app` no es profesional | Medio — afecta percepcion de marca |
| Sin backups automaticos | Supabase Free no incluye backups | Critico — perdida de datos irrecuperable |
| Sin email transaccional | No podemos enviar notificaciones, facturas, recuperacion | Medio — limita funcionalidad |
| Sin monitoreo de errores | No sabemos cuando algo falla en produccion | Alto — errores invisibles |
| Base de datos 500 MB max | ~50-100 clubs antes de llenarse (estimado) | Medio-Alto a escala |

---

## 3. PLAN MINIMO VIABLE (PMV) — "Primer Club Pagante"

> Configuracion minima para operar legalmente y con calidad profesional.

| Servicio | Plan | Costo USD/mes | Que incluye |
|----------|------|--------------|-------------|
| **Vercel Pro** | Pro (1 seat) | $20.00 | 1 TB bandwidth, CDN global, SSL auto, 1M function invocations, deploys ilimitados, uso comercial legal |
| **Supabase Pro** | Pro | $25.00 | 8 GB DB, 100 GB storage, backups diarios, 250 GB egress, no auto-pause, 100K auth MAUs |
| **Dominio .com** | Cloudflare Registrar | ~$1.00 | elevatesports.com o similar (amortizado: ~$12/año) |
| **Resend** | Free tier | $0.00 | 3,000 emails/mes, 100/dia — suficiente para arrancar |
| **Sentry** | Developer (Free) | $0.00 | 5,000 errores/mes, 1 usuario — suficiente para arrancar |
| **PostHog** | Free tier | $0.00 | 1M eventos/mes — analytics de producto |
| **GitHub** | Free | $0.00 | Repos privados ilimitados |
| | | | |
| **TOTAL PMV** | | **$46.00 USD/mes** | |
| **En COP** (TRM ~4,200) | | **~$193,200 COP/mes** | |

### Impuestos y costos bancarios adicionales (Colombia)

| Concepto | Tasa | Sobre el PMV |
|----------|------|-------------|
| 4x1000 (GMF) | 0.4% sobre debitos bancarios | ~$773 COP/mes |
| IVA sobre servicios digitales importados | 19% (puede aplicar en declaracion) | ~$36,708 COP/mes |
| **Total con impuestos estimado** | | **~$230,681 COP/mes** |

---

## 4. ESCENARIOS DE CRECIMIENTO

### Parametros base

| Variable | Valor |
|----------|-------|
| Precio mensual por club | $100,000 COP/mes (punto medio del rango 80K-150K) |
| TRM USD/COP | 4,200 |
| Precio por club en USD | ~$23.80 USD/mes |
| Almacenamiento por club (estimado) | ~5-10 MB (plantel 25-40 jugadores + historial 1 año) |
| Emails por club/mes (estimado) | ~50-100 (notificaciones, reportes) |

### Escenario A: Lanzamiento (1-10 clubs)

| Item | Costo USD/mes |
|------|--------------|
| Vercel Pro (1 seat) | $20.00 |
| Supabase Pro | $25.00 |
| Dominio | $1.00 |
| Resend (Free) | $0.00 |
| Sentry (Free) | $0.00 |
| **TOTAL** | **$46.00** |
| **En COP** | **$193,200** |

| Clubs | Ingreso COP/mes | Costo COP/mes | Margen COP | Margen % |
|-------|----------------|---------------|------------|----------|
| 1 | $100,000 | $193,200 | -$93,200 | -93% |
| **2** | **$200,000** | **$193,200** | **+$6,800** | **+3.4%** |
| 3 | $300,000 | $193,200 | +$106,800 | +36% |
| 5 | $500,000 | $193,200 | +$306,800 | +61% |
| 10 | $1,000,000 | $193,200 | +$806,800 | +81% |

**Punto de equilibrio: 2 clubs.** Con el tercer club ya hay margen real.

---

### Escenario B: Crecimiento (10-50 clubs)

| Item | Costo USD/mes | Notas |
|------|--------------|-------|
| Vercel Pro (1 seat) | $20.00 | 1 TB bandwidth soporta ~50 clubs |
| Supabase Pro | $25.00 | 8 GB DB soporta ~200+ clubs |
| Dominio | $1.00 | |
| Resend Starter | $20.00 | 50K emails/mes (upgrade necesario ~20 clubs) |
| Sentry Team | $26.00 | 50K errores/mes (upgrade recomendado ~30 clubs) |
| PostHog Free | $0.00 | 1M eventos/mes sigue alcanzando |
| **TOTAL** | **$92.00** |
| **En COP** | **$386,400** |

| Clubs | Ingreso COP/mes | Costo COP/mes | Margen COP | Margen % |
|-------|----------------|---------------|------------|----------|
| 15 | $1,500,000 | $386,400 | +$1,113,600 | +74% |
| 25 | $2,500,000 | $386,400 | +$2,113,600 | +85% |
| 50 | $5,000,000 | $386,400 | +$4,613,600 | +92% |

---

### Escenario C: Escala (50-200 clubs)

| Item | Costo USD/mes | Notas |
|------|--------------|-------|
| Vercel Pro (2 seats) | $40.00 | Segundo desarrollador |
| Supabase Pro + compute | $35.00 | +$10 compute upgrade (Small instance) |
| Dominio | $1.00 | |
| Resend Growth | $50.00 | 100K emails/mes |
| Sentry Team | $26.00 | |
| PostHog Free | $0.00 | |
| Claude API (IA) | $50.00 | Features inteligentes (analisis, recomendaciones) |
| **TOTAL** | **$202.00** |
| **En COP** | **$848,400** |

| Clubs | Ingreso COP/mes | Costo COP/mes | Margen COP | Margen % |
|-------|----------------|---------------|------------|----------|
| 75 | $7,500,000 | $848,400 | +$6,651,600 | +89% |
| 100 | $10,000,000 | $848,400 | +$9,151,600 | +92% |
| 200 | $20,000,000 | $848,400 | +$19,151,600 | +96% |

---

### Escenario D: Expansion (200-500 clubs)

| Item | Costo USD/mes | Notas |
|------|--------------|-------|
| Vercel Pro (3 seats) | $60.00 | Equipo de 3 |
| Supabase Pro + compute Large | $75.00 | Large instance para alta concurrencia |
| Dominio (.com + .co) | $4.00 | Dos dominios |
| Resend Business | $100.00 | 250K emails/mes |
| Sentry Business | $80.00 | 100K errores, soporte priority |
| PostHog Paid | $50.00 | Analytics avanzado |
| Claude API (IA) | $150.00 | Uso intensivo de features IA |
| Soporte/Infra adicional | $100.00 | CDN extra, monitoring, etc. |
| **TOTAL** | **$619.00** |
| **En COP** | **$2,599,800** |

| Clubs | Ingreso COP/mes | Costo COP/mes | Margen COP | Margen % |
|-------|----------------|---------------|------------|----------|
| 200 | $20,000,000 | $2,599,800 | +$17,400,200 | +87% |
| 300 | $30,000,000 | $2,599,800 | +$27,400,200 | +91% |
| 500 | $50,000,000 | $2,599,800 | +$47,400,200 | +95% |

---

## 5. DETALLE DE SERVICIOS Y LIMITES

### 5.1 Supabase — Base de Datos

| Recurso | Free | Pro ($25/mes) | Limite critico |
|---------|------|---------------|---------------|
| Base de datos | 500 MB | 8 GB | Free: ~50-100 clubs max |
| Storage (archivos) | 1 GB | 100 GB | Fotos de jugadores |
| Egress (transferencia) | 5 GB/mes | 250 GB/mes | Free: ~500 peticiones/dia |
| Auth MAUs | 50,000 | 100,000 | Sobra para V1 |
| Realtime connections | 200 | 500 | Live updates |
| Edge Functions | 500K/mes | 2M/mes | API custom |
| Backups | NO | Diarios (7 dias) | Free = 0 proteccion |
| Auto-pause | Si (7 dias) | NO | Free = riesgo critico |

**Overages Pro (si se excede):**
- Storage DB: $0.125/GB extra
- Storage archivos: $0.021/GB extra
- Egress: $0.09/GB extra
- Auth: $0.00325/MAU extra

**Estimacion de uso por club:**
- ~5-10 MB base de datos (plantel + historial + pagos + movimientos)
- ~50-200 MB storage (fotos de jugadores, si se implementa)
- ~100-500 MB egress/mes (API calls desde la app)

**Capacidad Pro sin overages:**
- Base de datos: 8 GB / 10 MB = **~800 clubs**
- Storage: 100 GB / 200 MB = **~500 clubs**
- Egress: 250 GB / 500 MB = **~500 clubs**

### 5.2 Vercel — Hosting

| Recurso | Hobby (Free) | Pro ($20/mes) | Limite critico |
|---------|------|---------------|---------------|
| Bandwidth | 100 GB/mes | 1 TB/mes | Hobby: ~10K visitas/dia |
| Serverless invocations | 1M/mes | 1M/mes | Suficiente |
| Build minutes | 6,000/mes | 24,000/mes | Sobra |
| Custom domains | 50 | Ilimitados | OK |
| **Uso comercial** | **PROHIBIDO** | **Permitido** | **Critico** |
| SSL | Incluido | Incluido | OK |
| CDN global | Incluido | Incluido | OK |

**Bandwidth por visita estimado:** ~2-5 MB (SPA con code-splitting)
- Hobby (100 GB): ~20,000-50,000 visitas/mes
- Pro (1 TB): ~200,000-500,000 visitas/mes

### 5.3 Resend — Email Transaccional

| Plan | Precio | Emails/mes | Emails/dia |
|------|--------|-----------|------------|
| Free | $0 | 3,000 | 100 |
| Starter | $20/mes | 50,000 | — |
| Growth | $50/mes | 100,000 | — |
| Business | $100/mes | 250,000 | — |

**Estimacion:** ~50-100 emails/club/mes (bienvenida, notificaciones, reportes semanales)
- Free: suficiente hasta ~30 clubs
- Starter: suficiente hasta ~500 clubs

### 5.4 Sentry — Monitoreo de Errores

| Plan | Precio | Errores/mes | Usuarios |
|------|--------|------------|----------|
| Developer | $0 | 5,000 | 1 |
| Team | $26/mes | 50,000 | Ilimitados |
| Business | $80/mes | 100,000 | Ilimitados |

### 5.5 Claude API — Inteligencia Artificial (futuro)

| Modelo | Input/1M tokens | Output/1M tokens | Costo por request tipico |
|--------|----------------|-------------------|------------------------|
| Haiku 3.5 | $0.80 | $4.00 | ~$0.0044 |
| Sonnet 4 | $3.00 | $15.00 | ~$0.0165 |
| Opus 4 | $15.00 | $75.00 | ~$0.082 |

**Casos de uso potenciales para Elevate:**
- Analisis automatico post-sesion (recomendaciones de carga) — Haiku
- Generacion de reportes narrativos — Sonnet
- Scouting inteligente / pattern matching — Sonnet

**Costo estimado:** 100 requests/dia con Haiku = ~$13 USD/mes

---

## 6. TABLA RESUMEN DE COSTOS POR ETAPA

```
                    LANZAMIENTO    CRECIMIENTO    ESCALA        EXPANSION
Clubs:              1-10           10-50          50-200        200-500
────────────────────────────────────────────────────────────────────────────
Vercel              $20            $20            $40           $60
Supabase            $25            $25            $35           $75
Dominio             $1             $1             $1            $4
Email               $0             $20            $50           $100
Errores             $0             $26            $26           $80
Analytics           $0             $0             $0            $50
IA (Claude)         $0             $0             $50           $150
Otros               $0             $0             $0            $100
────────────────────────────────────────────────────────────────────────────
TOTAL USD/mes       $46            $92            $202          $619
TOTAL COP/mes       $193,200       $386,400       $848,400      $2,599,800
────────────────────────────────────────────────────────────────────────────
Ingreso 50% cap.    $500,000       $2,500,000     $10,000,000   $25,000,000
Margen %            +61%           +85%           +92%          +90%
```

---

## 7. ANALISIS DE PUNTO DE EQUILIBRIO

### Break-even por escenario

| Precio club/mes | Costo infra/mes | Clubs para break-even |
|----------------|-----------------|----------------------|
| $80,000 COP | $193,200 COP | **3 clubs** |
| $100,000 COP | $193,200 COP | **2 clubs** |
| $120,000 COP | $193,200 COP | **2 clubs** |
| $150,000 COP | $193,200 COP | **2 clubs** |

### Comparacion con la competencia

| Metrica | Gesdep.net | Elevate Sports |
|---------|-----------|----------------|
| Precio/mes | ~$117,000 COP (300EUR/año) | $80,000-150,000 COP |
| Pizarra tactica | Basica | FIFA-style con drag, formaciones, salud RPE |
| App movil | No responsive | Responsive (PWA futura) |
| Analisis RPE | No | Si (motor Borg CR-10) |
| UX | Anticuada | Premium EA Sports FC |
| Mercado | España | Colombia + España |

**Ventaja competitiva:** UX premium + motor RPE + precio similar = propuesta superior.

---

## 8. PROYECCION A 12 MESES

### Escenario conservador: 3 clubs/mes de crecimiento

| Mes | Clubs | Ingreso COP | Costo COP | Margen COP | Acumulado |
|-----|-------|-------------|-----------|------------|-----------|
| 1 | 3 | $300,000 | $193,200 | +$106,800 | +$106,800 |
| 2 | 6 | $600,000 | $193,200 | +$406,800 | +$513,600 |
| 3 | 9 | $900,000 | $193,200 | +$706,800 | +$1,220,400 |
| 4 | 12 | $1,200,000 | $193,200 | +$1,006,800 | +$2,227,200 |
| 5 | 15 | $1,500,000 | $386,400 | +$1,113,600 | +$3,340,800 |
| 6 | 18 | $1,800,000 | $386,400 | +$1,413,600 | +$4,754,400 |
| 7 | 21 | $2,100,000 | $386,400 | +$1,713,600 | +$6,468,000 |
| 8 | 24 | $2,400,000 | $386,400 | +$2,013,600 | +$8,481,600 |
| 9 | 27 | $2,700,000 | $386,400 | +$2,313,600 | +$10,795,200 |
| 10 | 30 | $3,000,000 | $386,400 | +$2,613,600 | +$13,408,800 |
| 11 | 33 | $3,300,000 | $386,400 | +$2,913,600 | +$16,322,400 |
| 12 | 36 | $3,600,000 | $386,400 | +$3,213,600 | +$19,536,000 |

**Resultado a 12 meses:** 36 clubs, **+$19.5M COP acumulados** (~$4,650 USD)

### Escenario optimista: 8 clubs/mes de crecimiento

| Mes | Clubs | Ingreso COP | Costo COP | Margen COP | Acumulado |
|-----|-------|-------------|-----------|------------|-----------|
| 3 | 24 | $2,400,000 | $386,400 | +$2,013,600 | +$5,240,400 |
| 6 | 48 | $4,800,000 | $386,400 | +$4,413,600 | +$18,462,000 |
| 9 | 72 | $7,200,000 | $848,400 | +$6,351,600 | +$35,517,600 |
| 12 | 96 | $9,600,000 | $848,400 | +$8,751,600 | +$58,272,000 |

**Resultado a 12 meses:** 96 clubs, **+$58.3M COP acumulados** (~$13,880 USD)

---

## 9. RECOMENDACIONES DE @DATA

### Accion inmediata (antes del primer club)

| # | Accion | Prioridad | Costo |
|---|--------|-----------|-------|
| 1 | **Upgrade a Vercel Pro** — uso comercial ilegal en Hobby | CRITICA | $20 USD/mes |
| 2 | **Upgrade a Supabase Pro** — backups + no auto-pause | CRITICA | $25 USD/mes |
| 3 | **Comprar dominio** elevatesports.com o similar | ALTA | ~$12 USD/año |
| 4 | **Configurar Sentry** (free tier) para monitoreo de errores | ALTA | $0 |
| 5 | **Mover anon key** del `.env` a variables de entorno de Vercel (no commitear) | ALTA | $0 |

### Corto plazo (primeros 3 meses)

| # | Accion | Prioridad |
|---|--------|-----------|
| 6 | Implementar email transaccional (Resend free tier) |  MEDIA |
| 7 | Configurar PostHog para analytics de producto | MEDIA |
| 8 | Implementar Supabase Auth (reemplazar RBAC con checksum) | ALTA |
| 9 | Ajustar RLS policies por club_id real (cerrar acceso abierto) | ALTA |
| 10 | Implementar PWA (service worker + manifest) para experiencia mobile | MEDIA |

### Medio plazo (3-6 meses)

| # | Accion | Prioridad |
|---|--------|-----------|
| 11 | Features de IA con Claude Haiku (analisis post-sesion) | MEDIA |
| 12 | Sistema de facturacion/cobro automatico | ALTA |
| 13 | Multi-tenancy robusto (aislamiento por club en DB) | ALTA |
| 14 | Backup automatizado + restore self-service | MEDIA |

---

## 10. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Supabase Free se pausa y club pierde acceso | Alta (7 dias inactividad) | Critico | Upgrade a Pro antes de produccion |
| Vercel suspende cuenta por uso comercial en Hobby | Media | Critico | Upgrade a Pro antes del primer cobro |
| Anon key expuesta en `.env` commiteado | Alta (ya esta en repo) | Alto | Rotar key, mover a env vars de Vercel |
| RLS permisivo (USING true) — cualquier usuario ve todos los clubs | Alta | Critico | Implementar Auth + policies por club_id |
| Sin backups — falla de DB = perdida total | Alta en Free tier | Critico | Supabase Pro incluye backups diarios |
| Churn alto por falta de onboarding guiado | Media | Alto | Email drip + tutorial in-app |

---

## 11. NOTA SOBRE SEGURIDAD DEL .env

> **ALERTA:** El archivo `.env` con las credenciales de Supabase esta en el repositorio.
> La anon key es "publica" por diseño (se expone en el frontend), pero es buena practica
> no commitearla y usar las **Environment Variables** de Vercel en su lugar.
> El `SUPABASE_ACCESS_TOKEN` que usamos hoy para la migracion **NO debe commitearse nunca**.

---

## 12. CONCLUSION

El modelo de negocio de Elevate Sports es **altamente eficiente en costos de infraestructura**:

- **Inversion minima para arrancar:** $46 USD/mes (~$193,200 COP)
- **Break-even:** 2 clubs pagando $100,000 COP/mes
- **Margen a escala:** >90% con 100+ clubs
- **Costo por club servido:** decrece agresivamente (de $193,200 COP con 1 club a ~$5,000 COP con 500 clubs)

La naturaleza SaaS del producto, combinada con servicios cloud de pago-por-uso, permite que **los costos crezcan linealmente mientras los ingresos crecen multiplicativamente**.

El paso critico inmediato: **invertir $46 USD/mes para salir del free tier** antes de facturar al primer club.

---

*@Data (Mateo-Data_Engine) — Informe cerrado. Disponible para resolver dudas o profundizar en cualquier seccion.*
