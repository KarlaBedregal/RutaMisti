import createMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/panel", "/admin"];

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Strip locale prefix to check path
  const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, "") || "/";

  const isProtected = protectedPaths.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  );

  if (isProtected) {
    const session = await auth();
    // M1 fix: detectar locale desde el prefijo real del path, nunca desde split
    const locale =
      routing.locales.find((l) => pathname.startsWith(`/${l}/`)) ??
      routing.defaultLocale;

    if (!session) {
      return NextResponse.redirect(new URL(`/${locale}/ingresar`, req.url));
    }
    if (
      pathnameWithoutLocale.startsWith("/admin") &&
      (session.user as { rol?: string }).rol !== "admin"
    ) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
