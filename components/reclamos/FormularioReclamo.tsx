"use client";

import { useState, useTransition } from "react";
import { crearReclamo } from "@/actions/reclamos/crear";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

export default function FormularioReclamo({ locale }: { locale: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [codigoExito, setCodigoExito] = useState("");
  const isEn = locale === "en";

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await crearReclamo({
        tipo: fd.get("tipo") as "reclamo" | "queja",
        nombre: String(fd.get("nombre") ?? ""),
        documento: String(fd.get("documento") ?? "") || undefined,
        email: String(fd.get("email") ?? ""),
        telefono: String(fd.get("telefono") ?? "") || undefined,
        domicilio: String(fd.get("domicilio") ?? "") || undefined,
        detalle: String(fd.get("detalle") ?? ""),
        pedido: String(fd.get("pedido") ?? "") || undefined,
      });

      if ("error" in result) {
        setError(result.error);
      } else {
        setCodigoExito(result.codigo);
      }
    });
  }

  if (codigoExito) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
        <CheckCircle size={48} className="mx-auto text-green-500" />
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {isEn ? "Complaint registered" : "Reclamo registrado"}
        </h2>
        <p className="text-gray-500 text-sm">
          {isEn ? "Your complaint code is:" : "Tu código de reclamo es:"}
        </p>
        <div
          className="inline-block px-6 py-3 rounded-2xl text-2xl font-bold font-mono"
          style={{ background: "var(--bg-light)", color: "var(--primary-dark)" }}
        >
          {codigoExito}
        </div>
        <p className="text-xs text-gray-400">
          {isEn
            ? "We will respond within 30 business days."
            : "Responderemos dentro de 30 días hábiles."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {/* Tipo */}
      <div className="space-y-2">
        <Label>{isEn ? "Type" : "Tipo"} *</Label>
        <div className="flex gap-4">
          {["reclamo", "queja"].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tipo" value={t} required defaultChecked={t === "reclamo"} />
              <span className="text-sm capitalize">{t}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          {isEn
            ? "Complaint: dissatisfaction with product/service. Grievance: dissatisfaction not related to a product/service."
            : "Reclamo: disconformidad con producto/servicio. Queja: disconformidad no relacionada con producto/servicio."}
        </p>
      </div>

      {/* Nombre y documento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">{isEn ? "Full name" : "Nombre completo"} *</Label>
          <Input id="nombre" name="nombre" required minLength={2} placeholder="María García" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="documento">DNI / {isEn ? "Passport" : "Pasaporte"}</Label>
          <Input id="documento" name="documento" placeholder="12345678" />
        </div>
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{isEn ? "Email" : "Correo electrónico"} *</Label>
          <Input id="email" name="email" type="email" required placeholder="correo@ejemplo.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefono">{isEn ? "Phone" : "Teléfono"}</Label>
          <Input id="telefono" name="telefono" type="tel" placeholder="+51 999 999 999" />
        </div>
      </div>

      {/* Domicilio */}
      <div className="space-y-1.5">
        <Label htmlFor="domicilio">{isEn ? "Address" : "Domicilio"}</Label>
        <Input id="domicilio" name="domicilio" placeholder={isEn ? "Street address" : "Calle y número, distrito"} />
      </div>

      {/* Detalle */}
      <div className="space-y-1.5">
        <Label htmlFor="detalle">{isEn ? "Description" : "Descripción del reclamo"} *</Label>
        <Textarea
          id="detalle"
          name="detalle"
          required
          rows={5}
          minLength={10}
          maxLength={2000}
          placeholder={isEn ? "Describe your complaint in detail..." : "Describe detalladamente tu reclamo..."}
        />
      </div>

      {/* Pedido */}
      <div className="space-y-1.5">
        <Label htmlFor="pedido">{isEn ? "What do you request?" : "¿Qué solicitas?"}</Label>
        <Textarea
          id="pedido"
          name="pedido"
          rows={2}
          maxLength={500}
          placeholder={isEn ? "Refund, replacement, apology..." : "Reembolso, reposición, disculpa..."}
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
        {isPending ? (isEn ? "Sending..." : "Enviando...") : (isEn ? "Submit complaint" : "Enviar reclamo")}
      </Button>

      <p className="text-xs text-center text-gray-400">
        {isEn
          ? "By submitting, you confirm the information is accurate."
          : "Al enviar, confirmas que la información es verídica."}
      </p>
    </form>
  );
}
