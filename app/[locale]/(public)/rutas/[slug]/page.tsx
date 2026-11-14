export const instant = false;

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import MapaRutaDynamic from "@/components/ruta/MapaRutaDynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const ruta = await prisma.ruta.findUnique({ where: { slug, publicada: true } });
  if (!ruta) return {};
  const titulo = locale === "en" && ruta.tituloEn ? ruta.tituloEn : ruta.tituloEs;
  const desc = locale === "en" && ruta.descripcionEn ? ruta.descripcionEn : ruta.descripcionEs;
  return { title: titulo, description: desc ?? undefined };
}

export default async function RutaDetallePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("negocio");

  const ruta = await prisma.ruta.findUnique({
    where: { slug, publicada: true },
    include: {
      paradas: {
        orderBy: { orden: "asc" },
        include: {
          negocio: {
            include: {
              fotos: { where: { esPortada: true }, take: 1 },
              categoria: true,
            },
          },
        },
      },
    },
  });

  if (!ruta) notFound();

  const titulo = locale === "en" && ruta.tituloEn ? ruta.tituloEn : ruta.tituloEs;
  const desc = locale === "en" && ruta.descripcionEn ? ruta.descripcionEn : ruta.descripcionEs;

  const paradasParaMapa = ruta.paradas.map((p) => ({
    orden: p.orden,
    nombre: p.negocio.nombre,
    slug: p.negocio.slug,
    lat: p.negocio.lat,
    lng: p.negocio.lng,
  }));

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        {/* Header de la ruta */}
        {ruta.portadaUrl && (
          <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
            <Image src={ruta.portadaUrl} alt={titulo} fill className="object-cover" sizes="800px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {titulo}
              </h1>
            </div>
          </div>
        )}

        {!ruta.portadaUrl && (
          <h1
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
          >
            {titulo}
          </h1>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {ruta.duracionEstimada && (
            <Badge variant="outline">⏱ {ruta.duracionEstimada}</Badge>
          )}
          {ruta.dificultad && (
            <Badge variant="outline">🥾 {ruta.dificultad}</Badge>
          )}
          <Badge variant="outline">
            {ruta.paradas.length} {locale === "en" ? "stops" : "paradas"}
          </Badge>
        </div>

        {desc && <p className="text-gray-600 mb-6 leading-relaxed">{desc}</p>}

        {/* Mapa */}
        <section className="mb-8">
          <MapaRutaDynamic paradas={paradasParaMapa} />
        </section>

        <Separator className="mb-8" />

        {/* Paradas */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {locale === "en" ? "Stops" : "Paradas"}
          </h2>
          <div className="space-y-4">
            {ruta.paradas.map((parada) => {
              const fotoUrl = parada.negocio.fotos[0]?.url;
              const nota = locale === "en" && parada.notaEn ? parada.notaEn : parada.notaEs;
              return (
                <div key={parada.id} className="flex gap-4 items-start">
                  {/* Número */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {parada.orden}
                  </div>
                  {/* Foto */}
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                    {fotoUrl ? (
                      <Image src={fotoUrl} alt={parada.negocio.nombre} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl"
                        style={{ background: "var(--bg-light)" }}
                      >
                        🏪
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/negocio/${parada.negocio.slug}`}
                      className="font-semibold text-sm hover:underline"
                      style={{ color: "var(--primary-dark)" }}
                    >
                      {parada.negocio.nombre}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{parada.negocio.categoria.nombreEs}</p>
                    {nota && <p className="text-xs text-gray-600 mt-1">{nota}</p>}
                    <Link
                      href={`/${locale}/reservar/${parada.negocio.slug}`}
                      className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      {t("reservar")} aquí
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
