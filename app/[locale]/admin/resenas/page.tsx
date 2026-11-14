export const instant = false;

import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ResenasAdminPanel from "@/components/panel/ResenasAdminPanel";

export const metadata: Metadata = { title: "Reseñas · Admin RutaMisti" };

export default async function AdminResenasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if ((session?.user as { rol?: string })?.rol !== "admin") redirect(`/${locale}`);

  const resenas = await prisma.resena.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      negocio: { select: { nombre: true, slug: true } },
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "#111827" }}
      >
        Moderación de reseñas
      </h1>
      <ResenasAdminPanel resenas={resenas} locale={locale} />
    </div>
  );
}
