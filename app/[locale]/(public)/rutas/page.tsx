export const instant = false;

import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Themed Routes" : "Rutas Temáticas",
    description:
      locale === "en"
        ? "Curated tours through the best of Arequipa"
        : "Recorridos armados por expertos locales en Arequipa",
  };
}

export default async function RutasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const rutas = await prisma.ruta.findMany({
    where: { publicada: true },
    include: { paradas: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
        >
          {t("rutasTitle")}
        </h1>
        <p className="text-gray-500 mb-8">{t("rutasSubtitle")}</p>

        {rutas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🗺️</p>
            <p>{locale === "en" ? "No routes available yet." : "Aún no hay rutas disponibles."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rutas.map((ruta) => {
              const titulo = locale === "en" && ruta.tituloEn ? ruta.tituloEn : ruta.tituloEs;
              const desc = locale === "en" && ruta.descripcionEn ? ruta.descripcionEn : ruta.descripcionEs;
              return (
                <Link
                  key={ruta.id}
                  href={`/${locale}/rutas/${ruta.slug}`}
                  className="group block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-44 bg-gray-100">
                    {ruta.portadaUrl ? (
                      <Image
                        src={ruta.portadaUrl}
                        alt={titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-5xl"
                        style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--accent))" }}
                      >
                        🗺️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {ruta.duracionEstimada && (
                        <Badge variant="outline" className="text-xs">⏱ {ruta.duracionEstimada}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {ruta.paradas.length} {locale === "en" ? "stops" : "paradas"}
                      </Badge>
                    </div>
                    <h2 className="font-bold text-base mt-1" style={{ color: "var(--primary-dark)" }}>
                      {titulo}
                    </h2>
                    {desc && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{desc}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
