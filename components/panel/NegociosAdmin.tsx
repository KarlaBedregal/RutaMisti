"use client";

import { useTransition } from "react";
import { aprobarNegocio } from "@/actions/admin/aprobar-negocio";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  distrito: string | null;
  estado: string;
  createdAt: Date;
  descripcionEs: string | null;
  ruc: string | null;
  categoria: { nombreEs: string; icono: string };
  owner: { name: string | null; email: string | null };
};

export default function NegociosAdmin({
  negocios,
  estadoActual,
  locale,
}: {
  negocios: Negocio[];
  estadoActual: string;
  locale: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const tabs = [
    { value: "pendiente", label: "Pendientes" },
    { value: "aprobado", label: "Aprobados" },
    { value: "rechazado", label: "Rechazados" },
    { value: "suspendido", label: "Suspendidos" },
  ];

  function cambiarEstado(negocioId: string, estado: string) {
    startTransition(async () => {
      await aprobarNegocio({ negocioId, estado });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/${locale}/admin/negocios?estado=${t.value}`}
            className="text-sm px-4 py-2 rounded-xl font-medium border transition-colors"
            style={
              estadoActual === t.value
                ? { backgroundColor: "#111827", color: "white", borderColor: "#111827" }
                : { borderColor: "#e5e7eb", color: "#6b7280" }
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {negocios.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
          No hay negocios con este estado.
        </div>
      ) : (
        <div className="space-y-3">
          {negocios.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{n.categoria.icono}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{n.nombre}</h3>
                    <span className="text-xs text-gray-400">{n.categoria.nombreEs}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    📍 {n.distrito ?? "Sin distrito"} · Propietario: {n.owner.name ?? n.owner.email}
                  </p>
                  {n.ruc && <p className="text-xs text-gray-400 mt-0.5">RUC: {n.ruc}</p>}
                  {n.descripcionEs && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{n.descripcionEs}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Registrado: {new Date(n.createdAt).toLocaleDateString("es-PE")}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 mt-4 flex-wrap">
                <Link
                  href={`/${locale}/negocio/${n.slug}`}
                  target="_blank"
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                  style={{ borderColor: "#e5e7eb", color: "#374151" }}
                >
                  Ver perfil →
                </Link>
                {n.estado !== "aprobado" && (
                  <button
                    onClick={() => cambiarEstado(n.id, "aprobado")}
                    disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    ✓ Aprobar
                  </button>
                )}
                {n.estado !== "rechazado" && (
                  <button
                    onClick={() => cambiarEstado(n.id, "rechazado")}
                    disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    ✗ Rechazar
                  </button>
                )}
                {n.estado !== "suspendido" && n.estado === "aprobado" && (
                  <button
                    onClick={() => cambiarEstado(n.id, "suspendido")}
                    disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                  >
                    ⏸ Suspender
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
