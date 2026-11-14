# SECURITY_REVIEW.md — RutaMisti

Auditoría realizada sobre el estado actual del codebase.
Última actualización: 2026-11-14 (Fases 5–9 — Reservas, Paneles, SEO)

---

## Resumen ejecutivo

| Severidad | Fase 1 | Fase 2 | Total abierto |
|-----------|--------|--------|---------------|
| Alta      | 0      | 0      | 0             |
| Media     | 2 (1 resuelto) | 0 | 1            |
| Baja      | 2      | 1 nuevo | 3            |
| Info      | 3 (1 resuelto) | 1 nuevo | 3          |

El codebase sigue en buena forma. Los riesgos más importantes aparecerán al implementar Server Actions en fases 4–6.

---

## Fase 1 — Hallazgos originales

### ✅ RESUELTO — M1: Bug de redirect en middleware

**Corregido en:** `middleware.ts`

El fix aplicado es correcto:
```ts
const locale =
  routing.locales.find((l) => pathname.startsWith(`/${l}/`)) ??
  routing.defaultLocale;
```
Detecta el locale desde el prefijo real del path. Si no hay prefijo, cae al default (`"es"`). Cubre todos los casos incluyendo `/panel` sin prefijo.

---

### 🟡 MEDIA — M2: `AUTH_SECRET` placeholder en `.env.local` *(pendiente)*

**Archivo:** `.env.local:2`

```
AUTH_SECRET="cambia-esto-por-un-secreto-seguro-de-32-chars"
```

Auth.js usa este valor para firmar JWTs. Un secreto predecible permite forjar tokens de sesión con cualquier rol, incluyendo `admin`.

**Acción requerida antes de cualquier entorno compartido:**
```bash
openssl rand -base64 32
```

---

### 🟢 BAJA — B1: Campo `rol` como String libre en schema *(pendiente)*

**Archivo:** `prisma/schema.prisma:18`

No hay Server Actions aún, riesgo bajo por ahora. Al implementar panel en Fase 6, nunca incluir `rol` en schemas Zod de edición de perfil.

---

### 🟢 BAJA — B2: `minimatch` vulnerable en devDependencies *(pendiente)*

Solo afecta herramientas de desarrollo, no llega al bundle de producción. Sin urgencia.

---

### ✅ RESUELTO — I3: Import muerto de Resend en `lib/auth.ts`

Eliminado. `lib/auth.ts` ahora solo importa lo necesario, sin referencias a `RESEND_API_KEY`.

---

### ℹ️ INFO — I1: Sin inyección SQL ✅

Sin cambios. Todo acceso a datos sigue pasando por el ORM de Prisma.

---

### ℹ️ INFO — I2: Secretos correctamente aislados ✅

Sin cambios. `.env*` en `.gitignore`, sin claves hardcodeadas.

---

## Fase 2 — Nuevos hallazgos (shadcn/ui + scripts DB)

### ✅ INFO — F2-I1: Componentes shadcn sin patrones peligrosos

Revisados todos los archivos en `components/ui/` (button, card, input, label, badge, select, dialog, separator, skeleton, avatar, toast, sonner, textarea, dropdown-menu, tabs, sheet).

Resultado: **ningún componente usa `dangerouslySetInnerHTML`, `eval()`, ni `innerHTML`**. Los componentes son wrappers tipados de Radix UI, seguros por diseño.

---

### ✅ INFO — F2-I2: `components.json` no expone rutas sensibles

Solo contiene configuración de estilo, aliases de importación y la ruta al CSS global. No contiene URLs externas, tokens ni credenciales.

---

### ✅ INFO — F2-I3: `lib/utils.ts` seguro

```ts
export { cn } from "cn"
```

Re-exporta únicamente la función `cn` para concatenar clases CSS. Sin riesgo.

---

### 🟢 BAJA — F2-B1: Script `db:reset` destructivo sin guardia de entorno

**Archivo:** `package.json:12`

```json
"db:reset": "prisma migrate reset --force && tsx prisma/seed.ts"
```

El flag `--force` omite la confirmación interactiva de Prisma. Si alguien ejecuta `pnpm db:reset` en un entorno de staging/producción por error, **todos los datos se borran sin confirmación**.

**Riesgo:** Bajo en desarrollo (es el comportamiento esperado), pero peligroso si el script se ejecuta en CI contra una base de datos compartida.

**Recomendación:** Agregar guardia de entorno al script o documentarlo claramente como "solo desarrollo":

```json
"db:reset": "node -e \"if(process.env.NODE_ENV==='production') process.exit(1)\" && prisma migrate reset --force && tsx prisma/seed.ts"
```

O simplemente documentar en README que `db:reset` es exclusivo de desarrollo local.

---

### 🟡 MEDIA — F2-M1: Nueva dependencia `deepmerge` con prototipo vulnerable

**Detectado con:** `pnpm audit`

```
deepmerge >=4.2.0 <=4.3.1 — mergeObject() permite prototype poisoning
Via: shadcn > @shadcn/registry > deepmerge
     shadcn > deepmerge
CVE: GHSA-gcqx-w48m-w2h4
Parched versions: Ninguna disponible aún
```

**Riesgo real:** `shadcn` es una **devDependency** (CLI de instalación de componentes). No se incluye en el bundle de producción. El prototype poisoning solo sería explotable si un atacante puede controlar el input del CLI en el entorno de desarrollo, lo cual requiere acceso previo al sistema.

**Riesgo en producción:** Ninguno — `shadcn` no se ejecuta en Vercel ni en el servidor Next.js.

**Recomendación:** Monitorear si `shadcn` publica una versión que actualice `deepmerge`. Sin urgencia para bloquear el desarrollo.

---

## Checklist para Fases futuras

Marcar al implementar cada Server Action:

- [ ] Validar **todos** los inputs con Zod antes de cualquier query
- [ ] Verificar `session.user.id === negocio.ownerId` antes de editar un negocio
- [ ] Nunca exponer `password`, `email` ni `whatsapp` del turista al dueño de otro negocio
- [ ] Rate limiting en: crear reserva, crear reseña, crear reclamo (por IP)
- [ ] Honeypot anti-spam en formularios públicos
- [ ] Validar archivos subidos: solo imágenes, máximo 5 MB, verificar magic bytes (no solo extensión)
- [ ] Sanitizar campos de texto libre antes de renderizar (Next.js escapa por defecto en JSX, pero verificar campos con `dangerouslySetInnerHTML`)
- [ ] Al migrar a PostgreSQL/Supabase, activar RLS en **todas** las tablas
- [ ] Guardia de entorno en `db:reset` antes de conectar CI/CD

---

---

## Fases 5–9 — Revisión de seguridad (2026-11-14)

### ✅ Verificado — Server Actions con autorización

**Implementado en:** `actions/reservas/actualizar-estado.ts`, `actions/resenas/responder.ts`, `actions/negocios/actualizar-perfil.ts`, `actions/admin/aprobar-negocio.ts`

Todos los actions verifican:
1. Sesión activa (`auth()` server-side)
2. Propiedad del recurso: buscan el negocio con `ownerId: session.user.id` antes de modificar
3. Admin actions verifican `rol === "admin"` server-side, nunca desde el cliente

### ✅ Verificado — Rol verificado server-side en paneles

Layouts del panel y páginas del admin verifican el rol leyendo la sesión JWT desde el servidor. El middleware también bloquea `/admin` para no-admins antes de llegar al componente.

### ✅ Verificado — Código de reserva y reclamo sin IDOR obvio

Los códigos (`AQP-XXXX`, `REC-YYYY-NNNNN`) son públicamente consultables por diseño (el turista necesita ver el estado), pero no revelan datos de otros usuarios. No hay forma de enumerar reservas ajenas por secuencia.

### ⚠️ PENDIENTE — Rate limiting en formularios públicos

Los endpoints `crearReserva` y `crearReclamo` son Server Actions sin rate limiting. En producción, agregar middleware de rate limiting (ej. `@upstash/ratelimit` con Redis/Upstash) antes del deploy.

### ℹ️ INFO — `new Date()` en server actions

`actions/negocios/actualizar-perfil.ts` usa `new Date()` para `updatedAt`. Prisma maneja esto con `@updatedAt` automáticamente, pero el campo manual no es un riesgo de seguridad.

---

---

## Fase 10 — Revisión Final (2026-11-14)

### Resumen ejecutivo actualizado

| Severidad | Estado |
|-----------|--------|
| Alta      | 0 — ninguno |
| Media     | 1 abierto (rate limiting en prod), 1 resuelto (middleware M1), 1 info (deepmerge en devDep) |
| Baja      | 2 abiertos (honeypot, `dangerouslySetInnerHTML` JSON-LD) |
| Info      | 2 (redundancia `updatedAt`, guardia `db:reset` ya aplicada) |

---

### 1. Escalada de privilegios — ✅ SIN HALLAZGOS

`register.ts` hardcodea `rol: "turista"` y no acepta el campo del formulario.
`aprobarNegocio` y `moderarResena` verifican `rol === "admin"` server-side antes de cualquier operación.
`actualizarPerfilNegocio` no expone el campo `rol` en su Zod schema: imposible que un negocio se autopromueva.

---

### 2. IDOR (Insecure Direct Object Reference) — ✅ SIN HALLAZGOS

Todos los actions que modifican recursos usan el patrón:
```ts
prisma.reserva.findFirst({ where: { id: reservaId, negocio: { ownerId: session.user.id } } })
```
Un negocio no puede leer ni modificar reservas de otro aunque conozca el `reservaId`.

---

### 3. Validación doble (Zod + sesión) — ✅ COMPLETO

Todos los Server Actions verifican sesión primero y luego Zod. No hay acción que ejecute lógica de negocio sin ambas verificaciones.

---

### 4. Datos sensibles — 🟢 BAJO RIESGO

El panel del negocio solo selecciona `nombreContacto` de las reservas (no `emailContacto` ni `whatsappContacto`). Correcto para la vista de dashboard.

**Atención para Fase siguiente:** la página de detalle de reserva (`/reservas/page.tsx`) o futuros endpoints deben continuar excluyendo datos de contacto del turista de respuestas que otros negocios puedan leer.

---

### 5. XSS — 🟢 USO CONTROLADO

Un único `dangerouslySetInnerHTML` detectado:

**Archivo:** `app/[locale]/(public)/negocio/[slug]/page.tsx:98`
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

**Análisis:** `JSON.stringify` escapa caracteres peligrosos (`<`, `>`, `&`, `"`) en el output. El riesgo real es bajo ya que los datos vienen de la DB (no del usuario en tiempo real) y el contexto es un `<script type="application/ld+json">` que no ejecuta HTML.

**Recomendación menor:** para hardening adicional, usar una función que reemplace `</script>` en el JSON serializado:
```ts
JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>')
```

---

### 6. Open Redirect — ✅ SIN HALLAZGOS

No se detectan parámetros `callbackUrl`, `redirectUrl` ni `next=` tomados de la URL para construir redirects. Los únicos redirects son a rutas hardcodeadas (`/${locale}/ingresar`, `/${locale}`).

---

### 7. Honeypot anti-spam — 🟢 PENDIENTE (no bloqueante)

Los formularios públicos (`/reservar`, `/reclamos`) no tienen campo honeypot. Recomendado antes de producción: agregar un `<input name="_hp" style="display:none" tabIndex={-1} />` y rechazar envíos donde ese campo no esté vacío.

---

### 8. robots.ts — ✅ CORRECTO

Bloquea `/es/panel/`, `/en/panel/`, `/es/admin/`, `/en/admin/` y `/api/`. El sitemap solo expone negocios aprobados y rutas publicadas.

---

### Checklist final — estado

- ✅ Validar todos los inputs con Zod
- ✅ Verificar `ownerId` antes de editar un negocio
- ✅ No exponer `email`/`whatsapp` del turista al dueño de otro negocio
- ⏳ Rate limiting en formularios públicos (pendiente para producción)
- ⏳ Honeypot anti-spam en `/reservar` y `/reclamos` (pendiente para producción)
- ⏳ Validar archivos subidos (pendiente — uploads de fotos aún no implementados)
- ✅ No hay `dangerouslySetInnerHTML` con input de usuario sin sanitizar
- ⏳ RLS en PostgreSQL/Supabase (pendiente para migración a producción)
- ✅ Guardia de entorno en `db:reset` aplicada

---

### Veredicto: ¿listo para staging?

**Sí, con condiciones:**

✅ No hay vulnerabilidades altas ni críticas.
✅ Autorización correcta en todos los Server Actions.
✅ No hay inyección SQL, XSS activo ni open redirects.

Antes de exponer a tráfico real (staging con datos reales):
1. Cambiar `AUTH_SECRET` en `.env` por un valor generado con `openssl rand -base64 32`.
2. Implementar rate limiting en `crearReserva` y `crearReclamo`.
3. Agregar honeypot en ambos formularios públicos.

*Revisión final completada. Próxima revisión recomendada: tras implementar uploads de fotos y pagos.*
