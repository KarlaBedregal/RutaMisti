"use client";

import dynamic from "next/dynamic";

const MapaMini = dynamic(() => import("./MapaMini"), { ssr: false });

export default function MapaMiniDynamic(props: {
  lat: number;
  lng: number;
  nombre: string;
}) {
  return <MapaMini {...props} />;
}
