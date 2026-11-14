export const instant = false;

import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; codigo: string }>;
}): Promise<Metadata> {
  const { codigo } = await params;
  return { title: `Reserva ${codigo} · RutaMisti` };
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "#f59e0b",
  confirmada: "#16708e",
  rechazada: "#ef4444",
  cancelada: "#6b7280",
  completada: "#10b981",
  no_asistio: "#9ca3af",
};

const ESTADO_LABEL: Record<string, Record<string, string>> = {
  pendiente: { es: "Pendiente de confirmación", en: "Awaiting confirmation" },
  confirmada: { es: "Confirmada", en: "Confirmed" },
  rechazada: { es: "Rechazada", en: "Rejected" },
  cancelada: { es: "Cancelada", en: "Cancelled" },
  completada: { es: "Completada", en: "Completed" },
  no_asistio: { es: "No asistió", en: "No show" },
};

function EstadoBadge({ estado, locale }: { estado: string; locale: string }) {
  const color = ESTADO_COLOR[estado] ?? "#6b7280";
  const label = ESTADO_LABEL[estado]?.[locale as "es" | "en"] ?? estado;
  return (
    <span
      className="px-3 py-1 rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

export default async function EstadoReservaPage({
  params,
}: {
  params: Promise<{ locale: string; codigo: string }>;
}) {
  const { locale, codigo } = await params;
  setRequestLocale(locale);

  const reserva = await prisma.reserva.findUnique({
    where: { codigo },
    include: {
      negocio: {
        select: {
          nombre: true,
          slug: true,
          whatsapp: true,
          distrito: true,
        },
      },
      servicio: { select: { nombreEs: true, nombreEn: true } },
    },
  });

  if (!reserva) notFound();

  const whatsappMsg = encodeURIComponent(
    `Hola, consulto por mi reserva con código *${codigo}* en "${reserva.negocio.nombre}".`
  );
  const waLink = reserva.negocio.whatsapp
    ? `https://wa.me/${reserva.negocio.whatsapp.replace(/\D/g, "")}?text=${whatsappMsg}`
    : null;

  const fechaFormateada = new Date(reserva.fecha + "T" + reserva.hora).toLocaleDateString(
    locale === "en" ? "en-US" : "es-PE",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  const servicioNombre = reserva.servicio
    ? (locale === "en" && reserva.servicio.nombreEn ? reserva.servicio.nombreEn : reserva.servicio.nombreEs)
    : null;

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8 flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div
            className="p-6 text-white"
            style={{
              background: "linear-gradient(135deg, var(--primary-dark), var(--primary))",
            }}
          >
            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
              {locale === "en" ? "Booking code" : "Código de reserva"}
            </p>
            <h1
              className="text-3xl font-bold tracking-widest"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {codigo}
            </h1>
            <div className="mt-3">
              <EstadoBadge estado={reserva.estado} locale={locale} />
            </div>
          </div>

          {/* Detalles */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {locale === "en" ? "Business" : "Negocio"}
              </p>
              <Link
                href={`/${locale}/negocio/${reserva.negocio.slug}`}
                className="font-semibold hover:underline"
                style={{ color: "var(--primary-dark)" }}
              >
                {reserva.negocio.nombre}
              </Link>
              {reserva.negocio.distrito && (
                <p className="text-sm text-gray-500">📍 {reserva.negocio.distrito}</p>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {locale === "en" ? "Date" : "Fecha"}
                </p>
                <p className="font-medium capitalize">{fechaFormateada}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {locale === "en" ? "Time" : "Hora"}
                </p>
                <p className="font-medium">{reserva.hora}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {locale === "en" ? "People" : "Personas"}
                </p>
                <p className="font-medium">{reserva.personas}</p>
              </div>
              {servicioNombre && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {locale === "en" ? "Service" : "Servicio"}
                  </p>
                  <p className="font-medium">{servicioNombre}</p>
                </div>
              )}
            </div>

            {reserva.comentario && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {locale === "en" ? "Note" : "Nota"}
                  </p>
                  <p className="text-sm text-gray-600">{reserva.comentario}</p>
                </div>
              </>
            )}

            <Separator />

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {locale === "en" ? "Contact" : "Contacto"}
              </p>
              <p className="font-medium text-sm">{reserva.nombreContacto}</p>
              <p className="text-sm text-gray-500">{reserva.emailContacto}</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="px-6 pb-6 flex flex-col gap-3">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm"
                style={{ backgroundColor: "var(--whatsapp)" }}
              >
                💬 {locale === "en" ? "Contact business via WhatsApp" : "Contactar negocio por WhatsApp"}
              </a>
            )}
            <Link
              href={`/${locale}/negocio/${reserva.negocio.slug}`}
              className="flex items-center justify-center py-3 rounded-2xl font-semibold text-sm border"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              {locale === "en" ? "View business profile" : "Ver perfil del negocio"}
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {locale === "en"
            ? "Save your booking code to check the status later."
            : "Guarda tu código de reserva para consultar el estado más tarde."}
        </p>
      </main>
      <Footer />
    </>
  );
}
