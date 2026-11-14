export const instant = false;

import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel · RutaMisti" };

export default async function PanelDashboardPage({
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
    select: {
      id: true,
      nombre: true,
      slug: true,
      estado: true,
      ratingPromedio: true,
      totalResenas: true,
      vistas: true,
      _count: {
        select: {
          reservas: true,
        },
      },
    },
  });

  if (!negocio) redirect(`/${locale}/panel/`);

  const [reservasPendientes, reservasHoy] = await Promise.all([
    prisma.reserva.count({
      where: { negocioId: negocio.id, estado: "pendiente" },
    }),
    prisma.reserva.count({
      where: {
        negocioId: negocio.id,
        fecha: new Date().toISOString().slice(0, 10),
      },
    }),
  ]);

  const ultimasReservas = await prisma.reserva.findMany({
    where: { negocioId: negocio.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      codigo: true,
      nombreContacto: true,
      fecha: true,
      hora: true,
      personas: true,
      estado: true,
    },
  });

  const ESTADO_COLOR: Record<string, string> = {
    pendiente: "#f59e0b",
    confirmada: "#16708e",
    rechazada: "#ef4444",
    cancelada: "#6b7280",
    completada: "#10b981",
    no_asistio: "#9ca3af",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
        >
          Hola, {session.user.name?.split(" ")[0] ?? ""}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Panel de {negocio.nombre}
          {negocio.estado !== "aprobado" && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              {negocio.estado === "pendiente" ? "En revisión" : negocio.estado}
            </span>
          )}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Reservas pendientes", value: reservasPendientes, color: "#f59e0b" },
          { label: "Reservas hoy", value: reservasHoy, color: "var(--primary)" },
          { label: "Total reservas", value: negocio._count.reservas, color: "#6366f1" },
          { label: "Reseñas", value: negocio.totalResenas, color: "#10b981" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p className="text-3xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Rating */}
      {negocio.totalResenas > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-500">Rating promedio</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-2xl font-bold" style={{ color: "var(--yellow, #f8c81c)" }}>
                {negocio.ratingPromedio.toFixed(1)}
              </span>
              <span className="text-yellow-400 text-xl">★</span>
              <span className="text-sm text-gray-400">/ 5</span>
            </div>
          </div>
          <Link
            href={`/${locale}/panel/negocio/resenas`}
            className="ml-auto text-xs font-medium px-3 py-1.5 rounded-lg border"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            Ver reseñas
          </Link>
        </div>
      )}

      {/* Últimas reservas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-sm">Últimas reservas</h2>
          <Link
            href={`/${locale}/panel/negocio/reservas`}
            className="text-xs font-medium"
            style={{ color: "var(--primary)" }}
          >
            Ver todas →
          </Link>
        </div>

        {ultimasReservas.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay reservas aún.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {ultimasReservas.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.nombreContacto}</p>
                  <p className="text-xs text-gray-400">{r.fecha} · {r.hora} · {r.personas} persona{r.personas !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{ color: "var(--primary-dark)" }}
                  >
                    {r.codigo}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: ESTADO_COLOR[r.estado] ?? "#6b7280" }}
                  >
                    {r.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link al perfil público */}
      {negocio.estado === "aprobado" && (
        <div className="mt-6 text-center">
          <Link
            href={`/${locale}/negocio/${negocio.slug}`}
            target="_blank"
            className="text-sm font-medium underline"
            style={{ color: "var(--primary)" }}
          >
            Ver mi perfil público →
          </Link>
        </div>
      )}
    </div>
  );
}
