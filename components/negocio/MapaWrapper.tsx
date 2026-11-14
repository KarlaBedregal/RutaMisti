"use client";

import dynamic from "next/dynamic";

type NegocioPin = {
  id: string;
  nombre: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  categoria: { nombreEs: string; nombreEn: string; icono: string };
};

const MapaNegocios = dynamic(() => import("./MapaNegocios"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
      Cargando mapa…
    </div>
  ),
});

export default function MapaWrapper({
  negocios,
  locale,
}: {
  negocios: NegocioPin[];
  locale: string;
}) {
  return <MapaNegocios negocios={negocios} locale={locale} />;
}
