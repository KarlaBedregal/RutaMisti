"use client";

import dynamic from "next/dynamic";

const MapaRuta = dynamic(() => import("./MapaRuta"), { ssr: false });

export default function MapaRutaDynamic(props: {
  paradas: Array<{ lat: number | null; lng: number | null; nombre: string; orden: number; slug: string }>;
}) {
  return <MapaRuta {...props} />;
}
