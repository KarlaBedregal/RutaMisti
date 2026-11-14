export const instant = false;

import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ReservasPanel from "@/components/panel/ReservasPanel";

export const metadata: Metadata = { title: "Reservas · Panel RutaMisti" };

export default async function ReservasPanelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/ingresar`);

  const negocio = await prisma.negocio.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, nombre: true },
  });
  if (!negocio) redirect(`/${locale}/panel/`);

  const reservas = await prisma.reserva.findMany({
    where: { negocioId: negocio.id },
    orderBy: { createdAt: "desc" },
    include: {
      servicio: { select: { nombreEs: true } },
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
      >
        Reservas
      </h1>
      <ReservasPanel reservas={reservas} locale={locale} />
    </div>
  );
}
