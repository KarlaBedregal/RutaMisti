# Decisiones técnicas — RutaMisti

## 2026-11-13

---

### 1. Base de datos: SQLite en desarrollo, PostgreSQL en producción

- **Problema:** necesitamos una base de datos que sea simple de levantar localmente (sin Docker, sin credenciales externas) pero que escale a producción con RLS, backups y acceso concurrente.
- **Decisión:** SQLite (`file:./dev.db`) en desarrollo via Prisma. En producción se migrará a PostgreSQL/Supabase cambiando solo dos líneas en `prisma/schema.prisma` (`provider = "postgresql"` y `url = env("DATABASE_URL")`). El schema Prisma es compatible con ambos sin cambios en el código de aplicación.
- **Alternativas descartadas:**
  - PostgreSQL local desde el inicio: añade complejidad de setup (Docker o instalación nativa) sin beneficio en esta etapa.
  - MySQL: menos soporte de Prisma para features avanzadas; Supabase usa PostgreSQL.
- **Consecuencias:** los tipos `String` usados para `fecha` en `Reserva` y los campos `horario`/`idiomasAtencion` almacenados como JSON string funcionan en SQLite. Al migrar a PostgreSQL conviene cambiarlos a `Date` y `Json` nativos respectivamente. Las migraciones Prisma manejarán esto automáticamente.

---

### 2. No hay backend separado — todo en Next.js

- **Problema:** el spec pedía código real con base de datos, autenticación y despliegue. Un backend separado (Express, FastAPI, NestJS) duplica la infraestructura, añade CORS, dos repositorios y dos deploys.
- **Decisión:** todo el backend vive dentro de Next.js 16 App Router mediante:
  - **Server Components**: lecturas públicas (negocios, rutas, perfiles) con SSR/ISR.
  - **Server Actions**: todas las mutaciones con validación Zod obligatoria antes de tocar Prisma.
  - **Route Handlers** (`/api/...`): endpoints JSON públicos (mapa, QR en PNG/SVG) y webhooks.
- **Alternativas descartadas:**
  - Express + Next.js: dos servidores, CORS, dos deploys. Overkill para el MVP.
  - FastAPI: requiere Python, otro lenguaje, otra infraestructura.
  - tRPC: añade complejidad de tipos sin beneficio claro dado que ya tenemos Server Actions tipadas.
- **Consecuencias:** si en el futuro se necesita una API pública para apps móviles de terceros, los Route Handlers existentes ya son esa API. Para un crecimiento mayor se puede extraer a un servicio separado sin reescribir la lógica de negocio.

---

### 3. Prisma 5.22.0 en vez de Prisma 7/8 RC

- **Problema:** `pnpm add -D prisma` resolvió a Prisma 8.0.0-rc.33, que eliminó el campo `url` de `datasource` en `schema.prisma` y requiere un nuevo `prisma.config.ts` con driver adapters. Esto rompe `@auth/prisma-adapter` y la compatibilidad con SQLite estándar.
- **Decisión:** fijar Prisma en `^5.22.0` tanto para CLI como para `@prisma/client`. Es la última versión estable con la API convencional de `schema.prisma`.
- **Alternativas descartadas:**
  - Drizzle ORM: excelente alternativa moderna, pero el usuario eligió Prisma explícitamente. Fácil de migrar si se necesita.
  - Prisma 7 estable: también cambió la API de datasource de forma incompatible.
- **Consecuencias:** cuando Prisma 6/7 estabilice la nueva API de configuración habrá una migración necesaria. Se debe revisar `@auth/prisma-adapter` para confirmar compatibilidad antes de actualizar.

---

### 4. Auth.js v5 beta con estrategia JWT

- **Problema:** necesitamos autenticación con email/contraseña, magic link y soporte futuro para OAuth (Google). Debe integrarse con Prisma y con el sistema de roles (`turista`, `negocio`, `admin`).
- **Decisión:** `next-auth@5.0.0-beta.32` (Auth.js v5) con:
  - `PrismaAdapter` de `@auth/prisma-adapter` para persistir sesiones y cuentas OAuth.
  - `strategy: "jwt"` porque SQLite no necesita consultar la DB en cada request para verificar la sesión.
  - Callbacks `jwt` y `session` para propagar `id` y `rol` al token y a la sesión.
  - Contraseñas hasheadas con `bcryptjs` (cost factor por defecto = 10).
- **Alternativas descartadas:**
  - Auth.js v4: API diferente, menos compatible con App Router.
  - Lucia Auth: más control manual, más código a mantener.
  - Better Auth: más nuevo, buena DX, pero Auth.js tiene más ecosistema y el `PrismaAdapter` oficial.
  - `strategy: "database"`: requiere query a DB en cada request de ruta protegida. Con SQLite y un único servidor es viable, pero JWT es más eficiente para escalar.
- **Consecuencias:** el rol del usuario está en el JWT. Si un admin cambia el rol de un usuario, el cambio se reflejará en la próxima sesión (cuando el JWT expire o el usuario re-inicie sesión). Aceptable para el MVP.

---

### 5. Tailwind CSS v4 sin `tailwind.config.ts`

- **Problema:** `create-next-app` con Next.js 16 instala Tailwind CSS v4 por defecto, que usa una arquitectura completamente diferente a v3: configuración vía directivas CSS en vez de `tailwind.config.ts`.
- **Decisión:** usar Tailwind v4 con `@theme inline` en `globals.css` para definir los tokens de color y fuente del proyecto. Las variables CSS nativas (`:root`) exponen los colores de la paleta y se referencian con `var(--primary)` donde Tailwind no alcanza.
- **Alternativas descartadas:**
  - Downgrade a Tailwind v3: requiere reinstalar y reconfigurar. No vale dado que v4 compila más rápido con Turbopack.
- **Consecuencias:** shadcn/ui puede requerir ajustes en sus tokens al inicializarse con Tailwind v4. Se debe verificar la compatibilidad de cada componente instalado.

---

### 6. next-intl con prefijo de idioma (`/es/...`, `/en/...`)

- **Problema:** la plataforma debe servirse en español (turistas locales, dueños de negocios) e inglés (turistas extranjeros europeos). La detección automática por header `Accept-Language` no es suficiente porque los links compartidos deben ser reproducibles y el SEO requiere URLs distintas por idioma.
- **Decisión:** `next-intl@4.15.1` con `defineRouting({ locales: ["es", "en"], defaultLocale: "es" })`. Todas las rutas públicas tienen prefijo: `/es/explorar`, `/en/explore`. El middleware redirige automáticamente `/` a `/{locale}`.
- **Alternativas descartadas:**
  - `i18next` + `react-i18next`: más configuración manual, no integrado con App Router.
  - Solo inglés o solo español: descarta a turistas extranjeros o a dueños de negocios locales.
  - Subdominios (`en.rutamisti.com`): más complejo de configurar en Vercel, mayor fricción para el usuario.
- **Consecuencias:** todos los `Link` y `redirect` deben incluir el prefijo de locale. Se recomienda crear un helper `useLocalizedPath` si la cantidad de links crece.

---

### 7. Fuentes vía `next/font/google` en vez de `@import` en CSS

- **Problema:** Tailwind v4 con Turbopack procesa el CSS en un orden específico. Un `@import url("https://fonts.googleapis.com/...")` ubicado después de `@import "tailwindcss"` genera el error `@import rules must precede all other rules`, rompiendo el build y el servidor de desarrollo.
- **Decisión:** cargar Poppins y Nunito mediante `next/font/google` en `app/[locale]/layout.tsx`. Next.js descarga y sirve las fuentes localmente (sin petición a Google en runtime), inyecta las variables CSS `--font-heading` y `--font-body` automáticamente, y garantiza zero layout shift.
- **Alternativas descartadas:**
  - Poner `@import url(...)` antes de `@import "tailwindcss"`: funciona pero descarga fuentes desde Google en cada visita (latencia, privacidad GDPR).
  - Fuentes del sistema: no cumple la identidad visual del proyecto.
- **Consecuencias:** las variables `--font-heading` (Poppins) y `--font-body` (Nunito) están disponibles globalmente como CSS custom properties. Referenciarlas con `font-family: var(--font-heading)` en cualquier componente o hoja de estilos.

---

### 8. shadcn/ui sobre Bootstrap o MUI

- **Problema:** necesitamos componentes UI pre-construidos y bien diseñados que se vean profesionales sin tener que construirlos desde cero, pero manteniendo la identidad visual del proyecto (paleta turquesa, bordes redondeados, estilo cálido).
- **Decisión:** `shadcn/ui` inicializado con `pnpm dlx shadcn@latest init`. Los componentes se copian al repositorio (en `components/ui/`), lo que permite modificarlos completamente sin restricciones.
- **Alternativas descartadas:**
  - Bootstrap: impone su propio sistema de diseño (colores, tipografía, grid). Difícil de hacer que se vea "propio" sin sobreescribir mucho CSS. No está pensado para Tailwind ni para App Router.
  - Material UI (MUI): excelente para dashboards de empresa, pero su estética es muy "Google" y choca con el estilo cálido y local que busca RutaMisti. Además añade ~300 KB al bundle.
  - Radix UI directo: shadcn/ui ya es Radix UI + Tailwind; usarlo directo implicaría reescribir lo que shadcn ya hace.
- **Consecuencias:** los componentes de `components/ui/` son código nuestro — se pueden modificar libremente. Las actualizaciones de shadcn son opt-in (`pnpm dlx shadcn@latest add <componente> --overwrite`). La accesibilidad base (ARIA, navegación por teclado) viene incluida por Radix UI.

---

### 9. Colores de marca en oklch para compatibilidad con shadcn/ui (Tailwind v4)

- **Problema:** `shadcn init` sobreescribió las variables `--primary` y `--accent` de RutaMisti con valores en espacio de color `oklch` (ej: `oklch(0.205 0 0)`). Usar hex junto a oklch en el mismo `@theme` de Tailwind v4 genera inconsistencias en las mezclas de color de shadcn (hover states, opacidades, etc.).
- **Decisión:** convertir los colores de marca de RutaMisti al espacio oklch para que todo el sistema de tokens sea coherente:
  - `--primary: oklch(0.46 0.09 215)` ≈ `#16708e`
  - `--primary-dark: oklch(0.36 0.08 215)` ≈ `#0f5670`
  - `--accent: oklch(0.69 0.1 210)` ≈ `#3db5d0`
  - Los colores planos (`--yellow`, `--bg-light`, `--text`, `--whatsapp`) se mantienen en hex porque no son tokens de shadcn y no participan en mezclas automáticas.
- **Por qué oklch es mejor que hex para sistemas de diseño:** oklch es perceptualmente uniforme — un paso de luminosidad (`L`) produce el mismo cambio visual independientemente del matiz, lo que hace que hover states y gradientes generados automáticamente sean predecibles. Con hex, un mismo incremento numérico produce cambios visuales muy distintos según el color.
- **Alternativas descartadas:**
  - Mantener hex para todo: funciona pero los hover states de shadcn (que usan `color-mix`) producen resultados inesperados.
  - Mantener oklch genérico de shadcn y perder identidad de marca: descartado porque la paleta turquesa es parte del brief del proyecto.
- **Consecuencias:** al ajustar colores en el futuro, usar una herramienta como `oklch.com` para convertir y verificar contraste. Los valores oklch son aproximados al hex original; la diferencia visual es imperceptible (< 1 ΔE).

---

### 10. Script `db:reset` restringido a desarrollo

- **Problema:** se añadió `"db:reset": "prisma migrate reset --force && tsx prisma/seed.ts"` como script de conveniencia para limpiar y repoblar la base de datos en desarrollo.
- **Decisión:** documentar explícitamente que este script **nunca debe ejecutarse en producción**. `prisma migrate reset --force` elimina todas las tablas y los datos sin confirmación.
- **Consecuencias:** en producción solo usar `prisma migrate deploy` (aplica migraciones pendientes sin resetear). Para el seed inicial en producción, correr `tsx prisma/seed.ts` directamente con las variables de entorno de producción, revisando que el seed use `upsert` (idempotente).
