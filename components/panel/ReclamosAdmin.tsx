"use client";

type Reclamo = {
  id: string;
  codigo: string;
  tipo: string;
  nombre: string;
  email: string;
  telefono: string | null;
  detalle: string;
  pedido: string | null;
  estado: string;
  respuesta: string | null;
  createdAt: Date;
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "#f59e0b",
  en_proceso: "#3b82f6",
  resuelto: "#10b981",
  cerrado: "#6b7280",
};

export default function ReclamosAdmin({ reclamos }: { reclamos: Reclamo[] }) {
  if (reclamos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
        No hay reclamos registrados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reclamos.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50">
            <span className="font-mono text-sm font-semibold text-gray-700">{r.codigo}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white capitalize"
              style={{ backgroundColor: ESTADO_COLOR[r.estado] ?? "#6b7280" }}
            >
              {r.estado}
            </span>
            <span className="text-xs text-gray-400 ml-auto capitalize">{r.tipo}</span>
          </div>
          <div className="px-5 py-4 space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Reclamante</p>
                <p className="font-medium">{r.nombre}</p>
                <p className="text-xs text-gray-500">{r.email}</p>
                {r.telefono && <p className="text-xs text-gray-500">{r.telefono}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="text-sm">{new Date(r.createdAt).toLocaleDateString("es-PE")}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Detalle</p>
              <p className="text-sm text-gray-700">{r.detalle}</p>
            </div>
            {r.pedido && (
              <div>
                <p className="text-xs text-gray-400">Pedido del consumidor</p>
                <p className="text-sm text-gray-700">{r.pedido}</p>
              </div>
            )}
            {r.respuesta && (
              <div className="mt-2 pl-3 border-l-2 border-blue-200">
                <p className="text-xs text-gray-400">Respuesta</p>
                <p className="text-sm text-gray-700">{r.respuesta}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
