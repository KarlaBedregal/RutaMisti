interface HorarioDia {
  abre: string;
  cierra: string;
  cerrado: boolean;
}

const DIAS_ES = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const DIAS_EN = [
  { key: "lunes", label: "Monday" },
  { key: "martes", label: "Tuesday" },
  { key: "miercoles", label: "Wednesday" },
  { key: "jueves", label: "Thursday" },
  { key: "viernes", label: "Friday" },
  { key: "sabado", label: "Saturday" },
  { key: "domingo", label: "Sunday" },
];

interface Props {
  horario: string | null;
  locale: string;
}

export default function HorarioTabla({ horario, locale }: Props) {
  if (!horario) return <p className="text-sm text-gray-500">No disponible</p>;

  let parsed: Record<string, HorarioDia>;
  try {
    parsed = JSON.parse(horario);
  } catch {
    return <p className="text-sm text-gray-500">No disponible</p>;
  }

  const dias = locale === "en" ? DIAS_EN : DIAS_ES;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100">
      {dias.map(({ key, label }, i) => {
        const dia = parsed[key];
        const cerrado = !dia || dia.cerrado;
        return (
          <div
            key={key}
            className={`flex justify-between items-center px-4 py-2 text-sm ${
              i % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <span className="font-medium text-gray-700">{label}</span>
            {cerrado ? (
              <span className="text-red-500">{locale === "en" ? "Closed" : "Cerrado"}</span>
            ) : (
              <span className="text-gray-600">
                {dia.abre} – {dia.cierra}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
