export const instant = false;

import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FormularioReserva from "@/components/reserva/FormularioReserva";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const negocio = await prisma.negocio.findUnique({
    where: { slug, estado: "aprobado" },
    select: { nombre: true },
  });
  if (!negocio) return {};
  return { title: `Reservar en ${negocio.nombre} · RutaMisti` };
}

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const negocio = await prisma.negocio.findUnique({
    where: { slug, estado: "aprobado" },
    include: {
      categoria: { select: { nombreEs: true, nombreEn: true, icono: true } },
      fotos: { where: { esPortada: true }, take: 1 },
      servicios: {
        where: { activo: true },
        select: { id: true, nombreEs: true, nombreEn: true, precio: true },
      },
    },
  });

  if (!negocio) notFound();

  const portada = negocio.fotos[0]?.url;
  const catNombre =
    locale === "en" ? negocio.categoria.nombreEn : negocio.categoria.nombreEs;

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8 flex-1">
        {/* Info del negocio */}
        <div className="flex gap-4 items-center mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
            {portada ? (
              <Image src={portada} alt={negocio.nombre} fill className="object-cover" sizes="64px" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl"
                style={{ background: "var(--bg-light)" }}
              >
                {negocio.categoria.icono}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1
              className="font-bold text-base leading-tight truncate"
              style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
            >
              {negocio.nombre}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                className="text-xs"
                style={{ backgroundColor: "var(--accent)", color: "white" }}
              >
                {catNombre}
              </Badge>
              {negocio.distrito && (
                <span className="text-xs text-gray-500">📍 {negocio.distrito}</span>
              )}
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2
            className="text-lg font-semibold mb-5"
            style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
          >
            {locale === "en" ? "Reservation details" : "Detalles de la reserva"}
          </h2>
          <FormularioReserva
            negocioSlug={slug}
            negocioNombre={negocio.nombre}
            whatsapp={negocio.whatsapp}
            servicios={negocio.servicios}
            locale={locale}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
