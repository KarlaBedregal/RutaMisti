import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";

type NegocioCardProps = {
  negocio: {
    id: string;
    nombre: string;
    slug: string;
    descripcionEs: string | null;
    descripcionEn: string | null;
    distrito: string | null;
    rangoPrecio: number;
    ratingPromedio: number;
    totalResenas: number;
    aceptaYape: boolean;
    categoria: { nombreEs: string; nombreEn: string; icono: string };
    fotos: { url: string; esPortada: boolean }[];
  };
  locale: string;
};

const PRECIO_LABEL: Record<number, string> = { 1: "S/", 2: "S/S/", 3: "S/S/S/" };

export default function NegocioCard({ negocio, locale }: NegocioCardProps) {
  const portada =
    negocio.fotos.find((f) => f.esPortada)?.url ??
    negocio.fotos[0]?.url ??
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80";

  const descripcion =
    (locale === "en" ? negocio.descripcionEn : negocio.descripcionEs) ?? "";
  const desc = descripcion.length > 100 ? descripcion.slice(0, 97) + "…" : descripcion;
  const catNombre = locale === "en" ? negocio.categoria.nombreEn : negocio.categoria.nombreEs;

  return (
    <Link href={`/${locale}/negocio/${negocio.slug}`} className="block h-full">
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow rounded-2xl border-0 shadow-sm">
        {/* Imagen */}
        <div className="relative h-44 w-full bg-gray-100">
          <Image
            src={portada}
            alt={negocio.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
          {negocio.aceptaYape && (
            <span className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
              Yape
            </span>
          )}
        </div>

        <CardContent className="p-4 flex flex-col gap-2">
          {/* Categoría + precio */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs font-medium truncate">
              {negocio.categoria.icono} {catNombre}
            </Badge>
            <span className="text-xs font-semibold shrink-0" style={{ color: "var(--primary)" }}>
              {PRECIO_LABEL[negocio.rangoPrecio] ?? "S/"}
            </span>
          </div>

          {/* Nombre */}
          <h3 className="font-bold text-base leading-tight line-clamp-1" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
            {negocio.nombre}
          </h3>

          {/* Distrito */}
          {negocio.distrito && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              <span>{negocio.distrito}</span>
            </div>
          )}

          {/* Descripción */}
          {desc && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{desc}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mt-auto pt-1">
            {negocio.totalResenas > 0 ? (
              <>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    className={s <= Math.round(negocio.ratingPromedio) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">
                  {negocio.ratingPromedio.toFixed(1)} ({negocio.totalResenas})
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Sin reseñas</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
