"use client";

import { useTransition } from "react";
import { moderarResena } from "@/actions/admin/aprobar-negocio";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Resena = {
  id: string;
  autorNombre: string;
  puntaje: number;
  comentario: string | null;
  estado: string;
  createdAt: Date;
  negocio: { nombre: string; slug: string };
};

function Estrellas({ puntaje }: { puntaje: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= puntaje ? "#f8c81c" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );
}

function FilaResena({ resena, locale }: { resena: Resena; locale: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function moderar(estado: "visible" | "oculta") {
    startTransition(async () => {
      await moderarResena({ resenaId: resena.id, estado });
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{resena.autorNombre}</span>
            <Estrellas puntaje={resena.puntaje} />
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={
                resena.estado === "visible"
                  ? { backgroundColor: "#d1fae5", color: "#065f46" }
                  : { backgroundColor: "#fee2e2", color: "#991b1b" }
              }
            >
              {resena.estado}
            </span>
          </div>
          <Link
            href={`/${locale}/negocio/${resena.negocio.slug}`}
            target="_blank"
            className="text-xs underline"
            style={{ color: "var(--primary)" }}
          >
            {resena.negocio.nombre}
          </Link>
          {resena.comentario && (
            <p className="text-sm text-gray-700 mt-1">{resena.comentario}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(resena.createdAt).toLocaleDateString("es-PE")}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {resena.estado !== "visible" && (
            <button
              onClick={() => moderar("visible")}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Publicar
            </button>
          )}
          {resena.estado !== "oculta" && (
            <button
              onClick={() => moderar("oculta")}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600"
            >
              Ocultar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResenasAdminPanel({
  resenas,
  locale,
}: {
  resenas: Resena[];
  locale: string;
}) {
  if (resenas.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
        No hay reseñas aún.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {resenas.map((r) => (
        <FilaResena key={r.id} resena={r} locale={locale} />
      ))}
    </div>
  );
}
