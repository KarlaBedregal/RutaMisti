"use client";

import dynamic from "next/dynamic";

const MapaNegocios = dynamic(() => import("./MapaNegocios"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-2xl bg-gray-100 animate-pulse" />
  ),
});

type NegocioPin = {
  id: string;
  nombre: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  categoria: { nombreEs: string; nombreEn: string; icono: string };
};

export default function MapaNegociosDynamic(props: {
  negocios: NegocioPin[];
  locale: string;
}) {
  return <MapaNegocios {...props} />;
}
