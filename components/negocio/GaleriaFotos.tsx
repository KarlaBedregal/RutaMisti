"use client";

import { useState } from "react";
import Image from "next/image";

interface Foto {
  id: string;
  url: string;
  esPortada: boolean;
  orden: number;
}

interface GaleriaFotosProps {
  fotos: Foto[];
  nombre: string;
}

export default function GaleriaFotos({ fotos, nombre }: GaleriaFotosProps) {
  const sorted = [...fotos].sort((a, b) => {
    if (a.esPortada) return -1;
    if (b.esPortada) return 1;
    return a.orden - b.orden;
  });

  const [activa, setActiva] = useState(sorted[0]?.url ?? null);

  if (sorted.length === 0) {
    return (
      <div
        className="w-full h-72 md:h-96 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--accent))" }}
      >
        <span className="text-white text-5xl">🏔️</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden">
        <Image
          src={activa ?? sorted[0].url}
          alt={nombre}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiva(f.url)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                activa === f.url ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={f.url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
