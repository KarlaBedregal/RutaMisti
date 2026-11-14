export const instant = false;

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GaleriaFotos from "@/components/negocio/GaleriaFotos";
import MapaMiniDynamic from "@/components/negocio/MapaMiniDynamic";
import HorarioTabla from "@/components/negocio/HorarioTabla";
import IndicadorAbierto from "@/components/negocio/IndicadorAbierto";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const negocio = await prisma.negocio.findUnique({
    where: { slug, estado: "aprobado" },
    include: { categoria: true },
  });
  if (!negocio) return {};
  const desc = locale === "en" ? negocio.descripcionEn : negocio.descripcionEs;
  return {
    title: negocio.nombre,
    description: desc ?? undefined,
    openGraph: { title: negocio.nombre, description: desc ?? undefined },
  };
}

const PRECIO_LABEL: Record<number, string> = { 1: "S/", 2: "S/S/", 3: "S/S/S/" };

function Estrellas({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#f8c81c" : "#d1d5db", fontSize: 16 }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default async function PerfilNegocioPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("negocio");

  const negocio = await prisma.negocio.findUnique({
    where: { slug, estado: "aprobado" },
    include: {
      categoria: true,
      fotos: { orderBy: [{ esPortada: "desc" }, { orden: "asc" }] },
      servicios: { where: { activo: true } },
      resenas: {
        where: { estado: "visible" },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!negocio) notFound();

  const descripcion = locale === "en" && negocio.descripcionEn
    ? negocio.descripcionEn
    : negocio.descripcionEs;

  const whatsappMsg = encodeURIComponent(
    `Hola, vi su negocio "${negocio.nombre}" en RutaMisti y me gustaría hacer una reserva.`
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: negocio.nombre,
    description: descripcion,
    address: { "@type": "PostalAddress", streetAddress: negocio.direccion, addressLocality: negocio.distrito, addressCountry: "PE" },
    ...(negocio.lat && negocio.lng ? { geo: { "@type": "GeoCoordinates", latitude: negocio.lat, longitude: negocio.lng } } : {}),
    aggregateRating: negocio.totalResenas > 0 ? { "@type": "AggregateRating", ratingValue: negocio.ratingPromedio, reviewCount: negocio.totalResenas } : undefined,
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-3xl mx-auto px-4 py-8 flex-1">
        {/* Galería */}
        <GaleriaFotos fotos={negocio.fotos} nombre={negocio.nombre} />

        {/* Info principal */}
        <div className="mt-5 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge style={{ backgroundColor: "var(--accent)", color: "white" }}>
              {negocio.categoria.nombreEs}
            </Badge>
            {negocio.distrito && (
              <span className="text-sm text-gray-500">📍 {negocio.distrito}</span>
            )}
            <span className="text-sm text-gray-500">{PRECIO_LABEL[negocio.rangoPrecio]}</span>
            {negocio.aceptaYape && (
              <Badge variant="outline" className="text-xs">Acepta Yape</Badge>
            )}
            <IndicadorAbierto
              horario={negocio.horario}
              textoAbierto={t("abierto")}
              textoCerrado={t("cerrado")}
            />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
          >
            {negocio.nombre}
          </h1>
          {negocio.totalResenas > 0 && (
            <div className="flex items-center gap-2">
              <Estrellas rating={negocio.ratingPromedio} />
              <span className="text-sm text-gray-500">
                {negocio.ratingPromedio.toFixed(1)} · {negocio.totalResenas} {t("resenas").toLowerCase()}
              </span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/${locale}/reservar/${slug}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm min-h-[48px]"
            style={{ backgroundColor: "var(--primary)" }}
          >
            📅 {t("reservar")}
          </Link>
          {negocio.whatsapp && (
            <a
              href={`https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm min-h-[48px]"
              style={{ backgroundColor: "var(--whatsapp)" }}
            >
              💬 {t("whatsapp")}
            </a>
          )}
          {negocio.lat && negocio.lng && (
            <a
              href={`https://www.google.com/maps?q=${negocio.lat},${negocio.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm min-h-[48px] border"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              🗺️ {t("comoLlegar")}
            </a>
          )}
        </div>

        <Separator className="my-6" />

        {/* Descripción */}
        {descripcion && (
          <section className="mb-6">
            <p className="text-gray-700 leading-relaxed">{descripcion}</p>
          </section>
        )}

        {/* Servicios */}
        {negocio.servicios.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {t("servicios")}
            </h2>
            <div className="space-y-2">
              {negocio.servicios.map((s) => (
                <div key={s.id} className="flex justify-between items-start bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{locale === "en" && s.nombreEn ? s.nombreEn : s.nombreEs}</p>
                    {s.descripcion && <p className="text-xs text-gray-500 mt-0.5">{s.descripcion}</p>}
                    {s.duracionMin && (
                      <p className="text-xs text-gray-400 mt-0.5">⏱ {s.duracionMin} min</p>
                    )}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: "var(--primary)" }}>
                    S/ {s.precio.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Horario */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            {t("horario")}
          </h2>
          <HorarioTabla horario={negocio.horario} locale={locale} />
        </section>

        {/* Mapa */}
        {negocio.lat && negocio.lng && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {t("ubicacion")}
            </h2>
            <MapaMiniDynamic lat={negocio.lat} lng={negocio.lng} nombre={negocio.nombre} />
            {negocio.direccion && (
              <p className="text-sm text-gray-500 mt-2">📍 {negocio.direccion}, {negocio.distrito}</p>
            )}
          </section>
        )}

        {/* Reseñas */}
        {negocio.resenas.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              {t("resenas")} ({negocio.resenas.length})
            </h2>
            <div className="space-y-4">
              {negocio.resenas.map((r) => (
                <div key={r.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{r.autorNombre}</span>
                      <Badge variant="outline" className="text-xs" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>
                        ✓ {t("resenaVerificada")}
                      </Badge>
                    </div>
                    <Estrellas rating={r.puntaje} />
                  </div>
                  {r.comentario && <p className="text-sm text-gray-700">{r.comentario}</p>}
                  {r.respuestaNegocio && (
                    <div className="mt-3 pl-3 border-l-2 border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">Respuesta del negocio</p>
                      <p className="text-sm text-gray-600">{r.respuestaNegocio}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
