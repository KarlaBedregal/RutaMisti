import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const negocios = await prisma.negocio.findMany({
    where: { estado: "aprobado", lat: { not: null }, lng: { not: null } },
    select: {
      id: true,
      nombre: true,
      slug: true,
      lat: true,
      lng: true,
      categoria: { select: { nombreEs: true, nombreEn: true, icono: true } },
    },
  });

  return NextResponse.json(negocios);
}
