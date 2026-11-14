"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface HorarioDia {
  abre: string;
  cierra: string;
  cerrado: boolean;
}

type HorarioJSON = Record<string, HorarioDia>;

const DIAS: Record<number, string> = {
  0: "domingo",
  1: "lunes",
  2: "martes",
  3: "miercoles",
  4: "jueves",
  5: "viernes",
  6: "sabado",
};

function estaAbierto(horarioStr: string | null): boolean {
  if (!horarioStr) return false;
  try {
    const horario: HorarioJSON = JSON.parse(horarioStr);
    const ahora = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
    );
    const diaKey = DIAS[ahora.getDay()];
    const dia = horario[diaKey];
    if (!dia || dia.cerrado) return false;
    const [ah, am] = dia.abre.split(":").map(Number);
    const [ch, cm] = dia.cierra.split(":").map(Number);
    const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
    const minAbre = ah * 60 + am;
    const minCierra = ch * 60 + cm;
    return minAhora >= minAbre && minAhora < minCierra;
  } catch {
    return false;
  }
}

interface Props {
  horario: string | null;
  textoAbierto: string;
  textoCerrado: string;
}

export default function IndicadorAbierto({ horario, textoAbierto, textoCerrado }: Props) {
  const [abierto, setAbierto] = useState<boolean | null>(null);

  useEffect(() => {
    setAbierto(estaAbierto(horario));
    const id = setInterval(() => setAbierto(estaAbierto(horario)), 60_000);
    return () => clearInterval(id);
  }, [horario]);

  if (abierto === null) return null;

  return (
    <Badge
      className="text-xs font-semibold"
      style={{
        backgroundColor: abierto ? "#16a34a" : "#dc2626",
        color: "white",
      }}
    >
      {abierto ? textoAbierto : textoCerrado}
    </Badge>
  );
}
