export const instant = false;

import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ReclamosAdmin from "@/components/panel/ReclamosAdmin";

export const metadata: Metadata = { title: "Reclamos · Admin RutaMisti" };

export default async function AdminReclamosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if ((session?.user as { rol?: string })?.rol !== "admin") redirect(`/${locale}`);

  const reclamos = await prisma.reclamo.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-heading)", color: "#111827" }}
      >
        Libro de reclamaciones
      </h1>
      <ReclamosAdmin reclamos={reclamos} />
    </div>
  );
}
