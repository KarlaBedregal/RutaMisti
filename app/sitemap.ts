import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rutamisti.pe";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [negocios, rutas] = await Promise.all([
    prisma.negocio.findMany({
      where: { estado: "aprobado" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.ruta.findMany({
      where: { publicada: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const locales = ["es", "en"];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
    ...locales.flatMap((l) => [
      { url: `${BASE_URL}/${l}`, priority: 1.0, changeFrequency: "weekly" as const },
      { url: `${BASE_URL}/${l}/explorar`, priority: 0.9, changeFrequency: "daily" as const },
      { url: `${BASE_URL}/${l}/rutas`, priority: 0.8, changeFrequency: "weekly" as const },
    ]),
  ];

  const negocioRoutes: MetadataRoute.Sitemap = negocios.flatMap((n) =>
    locales.map((l) => ({
      url: `${BASE_URL}/${l}/negocio/${n.slug}`,
      lastModified: n.updatedAt,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }))
  );

  const rutaRoutes: MetadataRoute.Sitemap = rutas.flatMap((r) =>
    locales.map((l) => ({
      url: `${BASE_URL}/${l}/rutas/${r.slug}`,
      lastModified: r.updatedAt,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    }))
  );

  return [...staticRoutes, ...negocioRoutes, ...rutaRoutes];
}
