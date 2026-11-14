# Guía de Desarrollo — RutaMisti

> Referencia técnica para desarrolladores que continúan el proyecto.

---

## 1. Requisitos

| Herramienta | Versión mínima | Verificar con |
|-------------|---------------|---------------|
| Node.js | 20.19+ | `node --version` |
| pnpm | 12+ | `pnpm --version` |
| Git | cualquiera | `git --version` |

> Si no tienes pnpm: `curl -fsSL https://get.pnpm.io/install.sh | sh -`

---

## 2. Instalación local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo> && cd RutaMisti

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores (ver sección 8)

# 4. Generar la base de datos y aplicar migraciones
DATABASE_URL="file:./prisma/dev.db" pnpm prisma migrate deploy

# 5. Cargar datos de prueba
DATABASE_URL="file:./prisma/dev.db" pnpm db:seed

# 6. Levantar el servidor de desarrollo
DATABASE_URL="file:./prisma/dev.db" AUTH_SECRET="tu-secreto-aqui" pnpm dev
```

La app estará en `http://localhost:3000`. Ir a `/es` para la versión en español.

---

## 3. Estructura del proyecto

```
RutaMisti/
├── app/
│   ├── [locale]/               # Todas las páginas bajo prefijo de idioma
│   │   ├── layout.tsx          # Layout raíz: fuentes, NextIntl, SessionProvider
│   │   ├── page.tsx            # Home
│   │   ├── (auth)/             # Grupo sin layout propio (ingresar, registro, recuperar)
│   │   ├── (public)/           # Páginas públicas (explorar, negocio, rutas, reservar...)
│   │   ├── panel/negocio/      # Dashboard del negocio (protegido)
│   │   └── admin/              # Panel admin (protegido, solo rol=admin)
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Route handler de Auth.js
│   │   └── negocios/           # JSON público de negocios para el mapa
│   ├── sitemap.ts              # Sitemap dinámico
│   └── robots.ts               # robots.txt
│
├── actions/                    # Server Actions (mutaciones)
│   ├── auth/register.ts        # Registro de usuarios
│   └── reservas/crear.ts       # Crear reserva con código AQP-XXXX
│
├── components/
│   ├── ui/                     # Componentes shadcn/ui (no editar directamente)
│   ├── layout/                 # Header, Footer
│   ├── negocio/                # NegocioCard, ExplorarFiltros, MapaNegocios...
│   ├── ruta/                   # MapaRuta
│   └── Providers.tsx           # SessionProvider wrapper para Auth.js
│
├── lib/
│   ├── prisma.ts               # Cliente Prisma singleton
│   └── auth.ts                 # Configuración Auth.js v5
│
├── i18n/
│   ├── routing.ts              # Locales: ["es", "en"], default: "es"
│   └── request.ts              # Carga de mensajes por locale
│
├── messages/
│   ├── es.json                 # Textos en español
│   └── en.json                 # Textos en inglés
│
├── prisma/
│   ├── schema.prisma           # Modelos de base de datos
│   ├── seed.ts                 # Datos de prueba
│   ├── dev.db                  # SQLite (desarrollo, no commitear)
│   └── migrations/             # Historial de migraciones SQL
│
├── proxy.ts                    # Middleware: i18n routing + protección de rutas
├── .env.local                  # Variables de entorno (no commitear)
└── .env.example                # Template de variables de entorno
```

---

## 4. Convenciones de código

### Server Components vs Client Components

```tsx
// Server Component (default) — puede usar async/await y Prisma directamente
// app/[locale]/(public)/explorar/page.tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function ExplorarPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);           // necesario para static rendering
  const t = await getTranslations("explorar");
  const negocios = await prisma.negocio.findMany(...);
  return <div>...</div>;
}

// Client Component — para estado, eventos, hooks de browser
// components/negocio/ExplorarFiltros.tsx
"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
```

### Server Actions

Toda mutación va en `actions/`. Template:

```ts
// actions/ejemplo/crear.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  campo: z.string().min(1),
});

export async function crearEjemplo(data: z.infer<typeof schema>) {
  // 1. Validar con Zod (nunca confiar en el cliente)
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: "Datos inválidos" };

  // 2. Verificar sesión si es necesario
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  // 3. Verificar autorización (nunca asumir por el rol solo)
  // Ej: const negocio = await prisma.negocio.findUnique(...)
  // if (negocio.ownerId !== session.user.id) return { error: "Sin permiso" };

  // 4. Mutar la base de datos
  const result = await prisma.ejemplo.create({ data: parsed.data });
  return { success: true, id: result.id };
}
```

**Reglas de seguridad obligatorias:**
- Nunca incluir `rol` en el schema Zod de formularios de usuario
- Siempre verificar `ownerId === session.user.id` antes de editar registros ajenos
- Rate limiting en acciones públicas (reserva, reseña, reclamo) — pendiente de implementar

### Naming

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Páginas | kebab-case en carpeta | `app/[locale]/(public)/explorar/page.tsx` |
| Componentes | PascalCase | `NegocioCard.tsx` |
| Actions | camelCase | `crearReserva` |
| Variables Zod | camelCase + Schema | `crearReservaSchema` |

---

## 5. Agregar una nueva página

Ejemplo: agregar `/es/nosotros`.

```bash
mkdir -p app/\[locale\]/\(public\)/nosotros
```

```tsx
// app/[locale]/(public)/nosotros/page.tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function NosotrosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nosotros"); // agregar clave en messages/

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1>{t("titulo")}</h1>
      </main>
      <Footer />
    </>
  );
}
```

Agregar las claves en `messages/es.json` y `messages/en.json`:
```json
"nosotros": {
  "titulo": "Sobre RutaMisti"
}
```

---

## 6. Agregar una nueva Server Action

Ver sección 4 para el template completo. Consideraciones adicionales:

- Colocar en `actions/<dominio>/<nombre>.ts`
- Marcar con `"use server"` al inicio del archivo
- Importar desde `@/lib/prisma` y `@/lib/auth`
- Retornar siempre `{ success, error }` para manejo uniforme en el cliente
- Llamar desde un Client Component con `import { miAction } from "@/actions/..."`

---

## 7. Migrando a Supabase/PostgreSQL

Cuando estés listo para producción, el cambio es de 3 pasos:

**Paso 1: Cambiar el provider en `prisma/schema.prisma`**
```prisma
datasource db {
  provider = "postgresql"           // era "sqlite"
  url      = env("DATABASE_URL")
}
```

**Paso 2: Actualizar variables de entorno**
```bash
# .env.local (producción)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."   # solo servidor, nunca exponer al cliente
```

**Paso 3: Activar Row Level Security en Supabase**
En el SQL Editor de Supabase, ejecutar por cada tabla:
```sql
ALTER TABLE "Negocio" ENABLE ROW LEVEL SECURITY;
-- Política: solo negocios aprobados son visibles públicamente
CREATE POLICY "negocios_publicos" ON "Negocio"
  FOR SELECT USING (estado = 'aprobado');
-- Política: el dueño puede editar los suyos
CREATE POLICY "negocio_owner" ON "Negocio"
  FOR ALL USING (auth.uid()::text = "ownerId");
```

---

## 8. Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | ✅ | Ruta SQLite (`file:./prisma/dev.db`) o URL PostgreSQL |
| `AUTH_SECRET` | ✅ | Secreto para firmar JWT de sesión. Generar con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ dev | URL base de la app. Ej: `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL pública del sitio (para OG, sitemap) |
| `NEXT_PUBLIC_SUPABASE_URL` | prod | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | prod | Clave de servicio (solo servidor) |

---

## 9. Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Servidor de desarrollo en `localhost:3000` |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | Linter ESLint |
| `pnpm db:seed` | Carga datos de prueba en la DB |
| `pnpm db:reset` | Resetea la DB y recarga el seed (solo dev) |
| `pnpm db:studio` | Abre Prisma Studio (UI visual de la DB) |
| `pnpm prisma migrate dev --name <nombre>` | Crea y aplica una nueva migración |
| `pnpm prisma generate` | Regenera el cliente Prisma tras cambios en el schema |

---

## 10. Rutas de la aplicación

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/es` | Página de inicio | Público |
| `/es/explorar` | Listado de negocios con filtros y mapa | Público |
| `/es/negocio/[slug]` | Perfil del negocio | Público |
| `/es/rutas` | Listado de rutas temáticas | Público |
| `/es/rutas/[slug]` | Detalle de ruta con mapa | Público |
| `/es/reservar/[slug]` | Formulario de reserva | Público (sin cuenta) |
| `/es/reserva/[codigo]` | Estado de una reserva | Público (con código) |
| `/es/ingresar` | Login | Público |
| `/es/registro` | Registro | Público |
| `/es/recuperar` | Recuperar contraseña | Público |
| `/es/panel/negocio` | Dashboard del negocio | Rol: negocio/admin |
| `/es/panel/negocio/reservas` | Gestión de reservas | Rol: negocio/admin |
| `/es/panel/negocio/resenas` | Gestión de reseñas | Rol: negocio/admin |
| `/es/panel/negocio/perfil` | Edición del perfil | Rol: negocio/admin |
| `/es/admin` | Dashboard admin | Rol: admin |
| `/es/admin/negocios` | Aprobar/rechazar negocios | Rol: admin |
| `/es/admin/resenas` | Moderar reseñas | Rol: admin |
| `/es/admin/reclamos` | Libro de reclamaciones | Rol: admin |
| `/es/terminos` | Términos y condiciones | Público |
| `/es/privacidad` | Política de privacidad | Público |
| `/es/reclamos` | Formulario público de reclamos | Público |

---

## 11. Contacto y contribuciones

Proyecto desarrollado para Arequipa, Perú. Para contribuir:

1. Crea un fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Haz tus cambios y agrega tests si corresponde
4. Crea un Pull Request con descripción clara

**Fases pendientes (hoja de ruta):**
- Fase 10: Tests E2E con Playwright, despliegue en Vercel
- Fase 2 (producto): Login con Google, favoritos, emails con Resend, PWA
- Fase 3 (producto): Pagos con Culqi/Izipay, suscripciones, WhatsApp Business API

---

*RutaMisti · Arequipa, Perú 🇵🇪 · © 2026*
