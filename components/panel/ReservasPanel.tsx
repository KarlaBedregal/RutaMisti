"use client";

import { useState, useTransition } from "react";
import { actualizarEstadoReserva } from "@/actions/reservas/actualizar-estado";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

type Reserva = {
  id: string;
  codigo: string;
  nombreContacto: string;
  emailContacto: string;
  whatsappContacto: string | null;
  fecha: string;
  hora: string;
  personas: number;
  comentario: string | null;
  estado: string;
  servicio: { nombreEs: string } | null;
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "#f59e0b",
  confirmada: "#16708e",
  rechazada: "#ef4444",
  cancelada: "#6b7280",
  completada: "#10b981",
  no_asistio: "#9ca3af",
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
  completada: "Completada",
  no_asistio: "No asistió",
};

export default function ReservasPanel({
  reservas,
  locale,
}: {
  reservas: Reserva[];
  locale: string;
}) {
  const [filtro, setFiltro] = useState("todas");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtradas = filtro === "todas" ? reservas : reservas.filter((r) => r.estado === filtro);

  function cambiarEstado(reservaId: string, estado: string) {
    startTransition(async () => {
      await actualizarEstadoReserva({ reservaId, estado });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Filtro por estado */}
      <div className="flex gap-2 flex-wrap">
        {["todas", "pendiente", "confirmada", "completada", "cancelada"].map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className="text-xs px-3 py-1.5 rounded-full font-medium border transition-colors"
            style={
              filtro === e
                ? { backgroundColor: "var(--primary)", color: "white", borderColor: "var(--primary)" }
                : { borderColor: "#e5e7eb", color: "#6b7280" }
            }
          >
            {e === "todas" ? "Todas" : ESTADO_LABEL[e]}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
          No hay reservas con este filtro.
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-50">
                <span className="font-mono font-bold text-sm" style={{ color: "var(--primary-dark)" }}>
                  {r.codigo}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: ESTADO_COLOR[r.estado] ?? "#6b7280" }}
                >
                  {ESTADO_LABEL[r.estado] ?? r.estado}
                </span>
                <span className="ml-auto text-xs text-gray-400">{r.fecha} · {r.hora}</span>
              </div>

              <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Contacto</p>
                  <p className="font-medium">{r.nombreContacto}</p>
                  <p className="text-xs text-gray-500">{r.emailContacto}</p>
                  {r.whatsappContacto && (
                    <a
                      href={`https://wa.me/${r.whatsappContacto.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                      style={{ color: "var(--whatsapp)" }}
                    >
                      📱 {r.whatsappContacto}
                    </a>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Detalles</p>
                  <p>{r.personas} persona{r.personas !== 1 ? "s" : ""}</p>
                  {r.servicio && <p className="text-xs text-gray-500">{r.servicio.nombreEs}</p>}
                  {r.comentario && <p className="text-xs text-gray-400 mt-1 italic">"{r.comentario}"</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Cambiar estado</p>
                  <Select
                    defaultValue={r.estado}
                    onValueChange={(val) => val && cambiarEstado(r.id, val)}
                    disabled={isPending || r.estado === "completada" || r.estado === "rechazada"}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                      <SelectItem value="no_asistio">No asistió</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
