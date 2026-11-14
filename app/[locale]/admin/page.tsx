export const instant = false;

import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin · RutaMisti" };

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if ((session?.user as { rol?: string })?.rol !== "admin") redirect(`/${locale}`);

  const [
    negociosPendientes,
    negociosAprobados,
    negociosSuspendidos,
    resenasPendientes,
    totalReservas,
    reclamosPendientes,
  ] = await Promise.all([
    prisma.negocio.count({ where: { estado: "pendiente" } }),
    prisma.negocio.count({ where: { estado: "aprobado" } }),
    prisma.negocio.count({ where: { estado: "suspendido" } }),
    prisma.resena.count({ where: { estado: "pendiente" } }),
    prisma.reserva.count(),
    prisma.reclamo.count({ where: { estado: "pendiente" } }),
  ]);

  const ultimosNegocios = await prisma.negocio.findMany({
    where: { estado: "pendiente" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { categoria: { select: { nombreEs: true, icono: true } } },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "#111827" }}
      >
        Panel de Administración
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Negocios pendientes", value: negociosPendientes, color: "#f59e0b", href: `/${locale}/admin/negocios` },
          { label: "Negocios aprobados", value: negociosAprobados, color: "#10b981", href: `/${locale}/admin/negocios?estado=aprobado` },
          { label: "Negocios suspendidos", value: negociosSuspendidos, color: "#ef4444", href: `/${locale}/admin/negocios?estado=suspendido` },
          { label: "Reseñas pendientes", value: resenasPendientes, color: "#6366f1", href: `/${locale}/admin/resenas` },
          { label: "Total reservas", value: totalReservas, color: "#0ea5e9", href: null },
          { label: "Reclamos pendientes", value: reclamosPendientes, color: "#f97316", href: `/${locale}/admin/reclamos` },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold" style={{ color: m.color }}>{m.value}</p>
              {m.href && (
                <Link href={m.href} className="text-xs underline text-gray-400">ver →</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {ultimosNegocios.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm">Negocios pendientes de aprobación</h2>
            <Link
              href={`/${locale}/admin/negocios`}
              className="text-xs font-medium"
              style={{ color: "var(--primary)" }}
            >
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {ultimosNegocios.map((n) => (
              <div key={n.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xl">{n.categoria.icono}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{n.nombre}</p>
                  <p className="text-xs text-gray-400">{n.categoria.nombreEs} · {n.distrito ?? "Sin distrito"}</p>
                </div>
                <Link
                  href={`/${locale}/admin/negocios?estado=pendiente`}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "var(--primary)", color: "white" }}
                >
                  Revisar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
