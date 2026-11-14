"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Fix iconos Leaflet en Next.js (el bundler rompe las rutas por defecto)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type NegocioPin = {
  id: string;
  nombre: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  categoria: { nombreEs: string; nombreEn: string; icono: string };
};

type Props = {
  negocios: NegocioPin[];
  locale: string;
};

export default function MapaNegocios({ negocios, locale }: Props) {
  const negociosConCoordenadas = negocios.filter(
    (n) => n.lat != null && n.lng != null
  );

  return (
    <MapContainer
      center={[-16.4, -71.537]}
      zoom={13}
      style={{ height: "500px", width: "100%", borderRadius: "1rem" }}
      className="z-0"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {negociosConCoordenadas.map((n) => (
        <Marker key={n.id} position={[n.lat!, n.lng!]}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{n.nombre}</p>
              <p className="text-gray-500 text-xs mb-2">
                {n.categoria.icono}{" "}
                {locale === "en" ? n.categoria.nombreEn : n.categoria.nombreEs}
              </p>
              <Link
                href={`/${locale}/negocio/${n.slug}`}
                className="text-xs font-semibold underline"
                style={{ color: "var(--primary)" }}
              >
                Ver perfil →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
