export const instant = false;

import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ResenasPanel from "@/components/panel/ResenasPanel";

export const metadata: Metadata = { title: "Reseñas · Panel RutaMisti" };

export default async function ResenasPanelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/ingresar`);

  const negocio = await prisma.negocio.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, ratingPromedio: true, totalResenas: true },
  });
  if (!negocio) redirect(`/${locale}/panel/`);

  const resenas = await prisma.resena.findMany({
    where: { negocioId: negocio.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      autorNombre: true,
      puntaje: true,
      comentario: true,
      respuestaNegocio: true,
      estado: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
        >
          Reseñas
        </h1>
        {negocio.totalResenas > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-2xl font-bold" style={{ color: "#f8c81c" }}>
              {negocio.ratingPromedio.toFixed(1)}
            </span>
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-400">({negocio.totalResenas})</span>
          </div>
        )}
      </div>
      <ResenasPanel resenas={resenas} />
    </div>
  );
}
