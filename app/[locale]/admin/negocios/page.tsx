export const instant = false;

import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import NegociosAdmin from "@/components/panel/NegociosAdmin";

export const metadata: Metadata = { title: "Negocios · Admin RutaMisti" };

export default async function AdminNegociosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if ((session?.user as { rol?: string })?.rol !== "admin") redirect(`/${locale}`);

  const { estado = "pendiente" } = await searchParams;

  const negocios = await prisma.negocio.findMany({
    where: { estado },
    orderBy: { createdAt: "desc" },
    include: {
      categoria: { select: { nombreEs: true, icono: true } },
      owner: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "#111827" }}
      >
        Gestión de negocios
      </h1>
      <NegociosAdmin negocios={negocios} estadoActual={estado} locale={locale} />
    </div>
  );
}
