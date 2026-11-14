"use client";

import { useState, useTransition } from "react";
import { crearReserva } from "@/actions/reservas/crear";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

type Servicio = { id: string; nombreEs: string; nombreEn: string | null; precio: number };

type Props = {
  negocioSlug: string;
  negocioNombre: string;
  whatsapp: string | null;
  servicios: Servicio[];
  locale: string;
};

export default function FormularioReserva({
  negocioSlug,
  negocioNombre,
  whatsapp,
  servicios,
  locale,
}: Props) {
  const t = useTranslations("reserva");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [codigoExito, setCodigoExito] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);

    const servicioRaw = fd.get("servicioId");

    startTransition(async () => {
      const result = await crearReserva({
        negocioSlug,
        nombreContacto: String(fd.get("nombre") ?? ""),
        emailContacto: String(fd.get("email") ?? ""),
        whatsappContacto: String(fd.get("whatsapp") ?? "") || undefined,
        fecha: String(fd.get("fecha") ?? ""),
        hora: String(fd.get("hora") ?? ""),
        personas: Number(fd.get("personas") ?? 1),
        servicioId: servicioRaw && servicioRaw !== "__none__" ? String(servicioRaw) : undefined,
        comentario: String(fd.get("comentario") ?? "") || undefined,
      });

      if ("error" in result) {
        setError(result.error);
      } else {
        setCodigoExito(result.codigo);
      }
    });
  }

  if (codigoExito) {
    const whatsappMsg = encodeURIComponent(
      `Hola, hice una reserva en "${negocioNombre}" con el código ${codigoExito}. ¿Me pueden confirmar?`
    );
    const waLink = whatsapp
      ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${whatsappMsg}`
      : null;

    return (
      <div className="text-center py-8 space-y-5">
        <CheckCircle size={56} className="mx-auto text-green-500" />
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {t("exitoTitulo")}
          </h2>
          <p className="text-gray-500 mt-1">{t("exitoDesc")}</p>
          <div
            className="mt-3 inline-block px-6 py-3 rounded-2xl text-2xl font-bold tracking-widest"
            style={{ background: "var(--bg-light)", color: "var(--primary-dark)" }}
          >
            {codigoExito}
          </div>
        </div>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mx-auto max-w-xs py-3 rounded-2xl text-white font-semibold"
            style={{ backgroundColor: "var(--whatsapp)" }}
          >
            💬 {t("exitoWhatsapp")}
          </a>
        )}

        <Link
          href={`/${locale}/reserva/${codigoExito}`}
          className="block mt-2 text-sm underline"
          style={{ color: "var(--primary)" }}
        >
          Ver estado de la reserva
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Nombre */}
      <div className="space-y-1.5">
        <Label htmlFor="nombre">{t("nombre")} *</Label>
        <Input id="nombre" name="nombre" required minLength={2} placeholder="María García" />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">{t("email")} *</Label>
        <Input id="email" name="email" type="email" required placeholder="correo@ejemplo.com" />
      </div>

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <Label htmlFor="whatsapp">{t("whatsapp")}</Label>
        <Input id="whatsapp" name="whatsapp" type="tel" placeholder="+51 999 999 999" />
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fecha">{t("fecha")} *</Label>
          <Input
            id="fecha"
            name="fecha"
            type="date"
            required
            min="2026-01-01"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hora">{t("hora")} *</Label>
          <Input id="hora" name="hora" type="time" required />
        </div>
      </div>

      {/* Personas */}
      <div className="space-y-1.5">
        <Label htmlFor="personas">{t("personas")}</Label>
        <Input id="personas" name="personas" type="number" min={1} max={50} defaultValue={1} />
      </div>

      {/* Servicio opcional */}
      {servicios.length > 0 && (
        <div className="space-y-1.5">
          <Label>{t("servicio")}</Label>
          <Select name="servicioId" defaultValue="__none__">
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t("servicio")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— Ninguno —</SelectItem>
              {servicios.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {locale === "en" && s.nombreEn ? s.nombreEn : s.nombreEs}
                  {s.precio > 0 ? ` · S/ ${s.precio}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Comentario */}
      <div className="space-y-1.5">
        <Label htmlFor="comentario">{t("comentario")}</Label>
        <Textarea
          id="comentario"
          name="comentario"
          rows={3}
          placeholder="Alergias, preferencias, número de mesa..."
          maxLength={500}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 text-base font-semibold rounded-2xl"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {isPending ? "Enviando..." : t("enviar")}
      </Button>

      <p className="text-xs text-center text-gray-400">
        No necesitas crear cuenta para reservar.
      </p>
    </form>
  );
}
