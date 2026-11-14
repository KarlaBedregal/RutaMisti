"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer
      className="mt-auto py-10 px-4"
      style={{ backgroundColor: "var(--primary-dark)", color: "white" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Marca */}
        <div>
          <span
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ruta<span style={{ color: "var(--accent)" }}>Misti</span>
          </span>
          <p className="mt-2 text-sm text-gray-300">{t("descripcion")}</p>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
            {t("legal")}
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link href={`/${locale}/terminos`} className="hover:text-white transition-colors">
                {t("terminos")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/privacidad`} className="hover:text-white transition-colors">
                {t("privacidad")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/libro-de-reclamaciones`} className="hover:text-white transition-colors">
                {t("reclamos")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/nosotros`} className="hover:text-white transition-colors">
                {t("nosotros")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Copy */}
        <div className="text-sm text-gray-400 md:text-right">
          <p>© 2026 RutaMisti</p>
          <p>{t("derechos")}</p>
          <p className="mt-1">Arequipa, Perú 🇵🇪</p>
        </div>
      </div>
    </footer>
  );
}
