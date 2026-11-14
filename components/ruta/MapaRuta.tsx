"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Parada {
  orden: number;
  nombre: string;
  slug: string;
  lat: number | null;
  lng: number | null;
}

interface Props {
  paradas: Parada[];
}

function numeradoIcon(n: number) {
  return L.divIcon({
    className: "",
    html: `<div style="background:#16708e;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function MapaRuta({ paradas }: Props) {
  const conCoordenadas = paradas.filter((p) => p.lat !== null && p.lng !== null);
  if (conCoordenadas.length === 0) {
    return (
      <div className="rounded-2xl h-64 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        Sin coordenadas disponibles
      </div>
    );
  }

  const center: [number, number] = [
    conCoordenadas.reduce((s, p) => s + p.lat!, 0) / conCoordenadas.length,
    conCoordenadas.reduce((s, p) => s + p.lng!, 0) / conCoordenadas.length,
  ];
  const polyline = conCoordenadas.map((p) => [p.lat!, p.lng!] as [number, number]);

  return (
    <div className="rounded-2xl overflow-hidden h-72 w-full border border-gray-100">
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <Polyline positions={polyline} color="#16708e" weight={3} opacity={0.7} />
        {conCoordenadas.map((p) => (
          <Marker key={p.slug} position={[p.lat!, p.lng!]} icon={numeradoIcon(p.orden)}>
            <Popup>
              <strong>{p.nombre}</strong>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
