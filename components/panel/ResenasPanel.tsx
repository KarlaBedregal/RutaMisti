"use client";

import { useState, useTransition } from "react";
import { responderResena } from "@/actions/resenas/responder";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Resena = {
  id: string;
  autorNombre: string;
  puntaje: number;
  comentario: string | null;
  respuestaNegocio: string | null;
  estado: string;
  createdAt: Date;
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

function FilaResena({ resena }: { resena: Resena }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(resena.respuestaNegocio ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function guardar() {
    if (!texto.trim()) return;
    startTransition(async () => {
      await responderResena({ resenaId: resena.id, respuesta: texto.trim() });
      setEditando(false);
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{resena.autorNombre}</span>
            <Estrellas puntaje={resena.puntaje} />
          </div>
          {resena.comentario && (
            <p className="text-sm text-gray-700 mt-1">{resena.comentario}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(resena.createdAt).toLocaleDateString("es-PE")}
          </p>
        </div>
        {resena.estado === "oculta" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Oculta</span>
        )}
      </div>

      {/* Respuesta existente */}
      {resena.respuestaNegocio && !editando && (
        <div className="pl-3 border-l-2 border-gray-200">
          <p className="text-xs text-gray-500 font-medium mb-0.5">Tu respuesta</p>
          <p className="text-sm text-gray-700">{resena.respuestaNegocio}</p>
          <button
            className="text-xs mt-1 underline"
            style={{ color: "var(--primary)" }}
            onClick={() => setEditando(true)}
          >
            Editar
          </button>
        </div>
      )}

      {/* Formulario de respuesta */}
      {!resena.respuestaNegocio && !editando && (
        <button
          className="text-xs font-medium px-3 py-1.5 rounded-lg border"
          style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          onClick={() => setEditando(true)}
        >
          + Responder
        </button>
      )}

      {editando && (
        <div className="space-y-2">
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            placeholder="Escribe tu respuesta..."
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={guardar} disabled={isPending || !texto.trim()}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResenasPanel({ resenas }: { resenas: Resena[] }) {
  if (resenas.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
        No hay reseñas aún.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resenas.map((r) => (
        <FilaResena key={r.id} resena={r} />
      ))}
    </div>
  );
}
