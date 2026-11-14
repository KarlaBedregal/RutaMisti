export const instant = false;

import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import PerfilForm from "@/components/panel/PerfilForm";

export const metadata: Metadata = { title: "Mi perfil · Panel RutaMisti" };

export default async function PerfilPanelPage({
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
    include: {
      categoria: { select: { nombreEs: true } },
    },
  });
  if (!negocio) redirect(`/${locale}/panel/`);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
      >
        Editar perfil
      </h1>
      <PerfilForm negocio={negocio} locale={locale} />
    </div>
  );
}
