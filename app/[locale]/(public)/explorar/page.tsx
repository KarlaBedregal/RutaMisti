export const instant = false;

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NegocioCard from "@/components/negocio/NegocioCard";
import ExplorarFiltros from "@/components/negocio/ExplorarFiltros";
import MapaWrapper from "@/components/negocio/MapaWrapper";
import { LayoutGrid, Map } from "lucide-react";
import Link from "next/link";


type SearchParams = {
  categoria?: string;
  distrito?: string;
  precio?: string;
  busqueda?: string;
  vista?: string;
  yape?: string;
};

export default async function ExplorarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations("explorar");

  const vista = sp.vista === "mapa" ? "mapa" : "lista";

  // Filtros
  const where: Prisma.NegocioWhereInput = {
    estado: "aprobado",
    ...(sp.categoria && {
      categoria: { slug: sp.categoria },
    }),
    ...(sp.distrito && { distrito: sp.distrito }),
    ...(sp.precio && { rangoPrecio: parseInt(sp.precio) }),
    ...(sp.yape === "1" && { aceptaYape: true }),
    ...(sp.busqueda && {
      OR: [
        { nombre: { contains: sp.busqueda } },
        { descripcionEs: { contains: sp.busqueda } },
        { descripcionEn: { contains: sp.busqueda } },
      ],
    }),
  };

  const [negocios, categorias] = await Promise.all([
    prisma.negocio.findMany({
      where,
      orderBy: { ratingPromedio: "desc" },
      include: {
        categoria: { select: { nombreEs: true, nombreEn: true, icono: true, slug: true } },
        fotos: { select: { url: true, esPortada: true }, orderBy: { orden: "asc" } },
      },
    }),
    prisma.categoria.findMany({ orderBy: { nombreEs: "asc" } }),
  ]);

  const count = negocios.length;
  const countLabel =
    count === 1 ? t("resultados", { count }) : t("resultadosPlural", { count });

  const baseUrl = `/${locale}/explorar`;
  const spClean = Object.fromEntries(
    Object.entries(sp).filter(([, v]) => v !== undefined)
  ) as Record<string, string>;

  return (
    <>
      <Header />
      <main className="flex-1" style={{ backgroundColor: "var(--bg-light)" }}>
        {/* Encabezado */}
        <div
          className="py-10 px-4 text-white text-center"
          style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--primary))" }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {t("titulo")}
          </h1>
          <p className="text-blue-100 text-sm">{t("subtitulo")}</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
          {/* Filtros */}
          <Suspense>
            <ExplorarFiltros categorias={categorias} locale={locale} />
          </Suspense>

          {/* Toggle vista + conteo */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600 font-medium">{countLabel}</p>

            <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              <Link
                href={`${baseUrl}?${new URLSearchParams({ ...spClean, vista: "lista" }).toString()}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  vista === "lista"
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={vista === "lista" ? { backgroundColor: "var(--primary)" } : {}}
              >
                <LayoutGrid size={15} />
                {t("vistaLista")}
              </Link>
              <Link
                href={`${baseUrl}?${new URLSearchParams({ ...spClean, vista: "mapa" }).toString()}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  vista === "mapa"
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={vista === "mapa" ? { backgroundColor: "var(--primary)" } : {}}
              >
                <Map size={15} />
                {t("vistaMapa")}
              </Link>
            </div>
          </div>

          {/* Contenido */}
          {count === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-semibold text-gray-700">{t("sinResultados")}</p>
              <p className="text-sm text-gray-500 mt-1">{t("sinResultadosDesc")}</p>
            </div>
          ) : vista === "lista" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {negocios.map((n) => (
                <NegocioCard key={n.id} negocio={n} locale={locale} />
              ))}
            </div>
          ) : (
            <MapaWrapper negocios={negocios} locale={locale} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
