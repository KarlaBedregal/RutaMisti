"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const otherLocale = locale === "es" ? "en" : "es";
  const switchPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const rol = (session?.user as { rol?: string })?.rol;
  const panelHref = rol === "admin"
    ? `/${locale}/admin`
    : `/${locale}/panel/negocio`;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span
            className="text-xl font-bold"
            style={{ color: "var(--primary)", fontFamily: "var(--font-heading)" }}
          >
            Ruta<span style={{ color: "var(--accent)" }}>Misti</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={`/${locale}/explorar`}
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            {t("explorar")}
          </Link>
          <Link
            href={`/${locale}/rutas`}
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            {t("rutas")}
          </Link>

          {session ? (
            <Link
              href={panelHref}
              className="text-sm font-medium px-4 py-2 rounded-full text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {t("miPanel")}
            </Link>
          ) : (
            <>
              <Link
                href={`/${locale}/registra-tu-negocio`}
                className="text-sm font-medium px-4 py-2 rounded-full border"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                {t("registraNegocio")}
              </Link>
              <Link
                href={`/${locale}/ingresar`}
                className="text-sm font-medium px-4 py-2 rounded-full text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {t("ingresar")}
              </Link>
            </>
          )}
        </nav>

        {/* Selector de idioma */}
        <button
          onClick={() => router.push(switchPath)}
          className="text-xs font-semibold uppercase px-2 py-1 rounded border border-gray-200 text-gray-500 hover:border-primary transition-colors ml-4"
          aria-label={`Cambiar a ${otherLocale}`}
        >
          {otherLocale}
        </button>
      </div>
    </header>
  );
}
