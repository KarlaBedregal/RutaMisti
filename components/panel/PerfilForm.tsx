"use client";

import { useState, useTransition } from "react";
import { actualizarPerfilNegocio } from "@/actions/negocios/actualizar-perfil";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

type Negocio = {
  id: string;
  nombre: string;
  descripcionEs: string | null;
  descripcionEn: string | null;
  direccion: string | null;
  distrito: string | null;
  whatsapp: string | null;
  telefono: string | null;
  instagram: string | null;
  facebook: string | null;
  rangoPrecio: number;
  aceptaYape: boolean;
  aceptaTarjeta: boolean;
  aceptaReservas: boolean;
  ruc: string | null;
  categoria: { nombreEs: string };
};

export default function PerfilForm({ negocio, locale }: { negocio: Negocio; locale: string }) {
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje(null);
    const fd = new FormData(e.currentTarget);

    const data = {
      descripcionEs: String(fd.get("descripcionEs") ?? ""),
      descripcionEn: String(fd.get("descripcionEn") ?? "") || undefined,
      direccion: String(fd.get("direccion") ?? ""),
      distrito: String(fd.get("distrito") ?? ""),
      whatsapp: String(fd.get("whatsapp") ?? "") || undefined,
      telefono: String(fd.get("telefono") ?? "") || undefined,
      instagram: String(fd.get("instagram") ?? "") || undefined,
      facebook: String(fd.get("facebook") ?? "") || undefined,
      rangoPrecio: Number(fd.get("rangoPrecio") ?? 1),
      aceptaYape: fd.get("aceptaYape") === "on",
      aceptaTarjeta: fd.get("aceptaTarjeta") === "on",
      aceptaReservas: fd.get("aceptaReservas") === "on",
      ruc: String(fd.get("ruc") ?? "") || undefined,
    };

    startTransition(async () => {
      const result = await actualizarPerfilNegocio(negocio.id, data);
      if ("error" in result) {
        setMensaje({ ok: false, text: result.error });
      } else {
        setMensaje({ ok: true, text: "¡Perfil actualizado correctamente!" });
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Info básica */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-sm text-gray-700">Información básica</h2>
        <div className="space-y-1.5">
          <Label>Nombre del negocio</Label>
          <Input value={negocio.nombre} disabled className="bg-gray-50" />
          <p className="text-xs text-gray-400">El nombre no se puede cambiar desde aquí.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Input value={negocio.categoria.nombreEs} disabled className="bg-gray-50" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="descripcionEs">Descripción (español) *</Label>
          <Textarea
            id="descripcionEs"
            name="descripcionEs"
            rows={4}
            defaultValue={negocio.descripcionEs ?? ""}
            maxLength={1000}
            placeholder="Describe tu negocio..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="descripcionEn">Descripción (inglés)</Label>
          <Textarea
            id="descripcionEn"
            name="descripcionEn"
            rows={3}
            defaultValue={negocio.descripcionEn ?? ""}
            maxLength={1000}
            placeholder="Describe your business..."
          />
        </div>
      </div>

      {/* Ubicación */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-sm text-gray-700">Ubicación</h2>
        <div className="space-y-1.5">
          <Label htmlFor="direccion">Dirección</Label>
          <Input id="direccion" name="direccion" defaultValue={negocio.direccion ?? ""} placeholder="Av. Principal 123" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="distrito">Distrito</Label>
          <Input id="distrito" name="distrito" defaultValue={negocio.distrito ?? ""} placeholder="Miraflores" />
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-sm text-gray-700">Contacto</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={negocio.whatsapp ?? ""} placeholder="+51 999 999 999" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" type="tel" defaultValue={negocio.telefono ?? ""} placeholder="054-123456" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" name="instagram" defaultValue={negocio.instagram ?? ""} placeholder="@mi_negocio" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" name="facebook" defaultValue={negocio.facebook ?? ""} placeholder="facebook.com/mi-negocio" />
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-sm text-gray-700">Preferencias</h2>
        <div className="space-y-1.5">
          <Label htmlFor="rangoPrecio">Rango de precio</Label>
          <select
            id="rangoPrecio"
            name="rangoPrecio"
            defaultValue={negocio.rangoPrecio}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value={1}>Económico (S/)</option>
            <option value={2}>Moderado (S/S/)</option>
            <option value={3}>Premium (S/S/S/)</option>
          </select>
        </div>
        <div className="space-y-2">
          {[
            { name: "aceptaYape", label: "Acepta Yape", checked: negocio.aceptaYape },
            { name: "aceptaTarjeta", label: "Acepta tarjeta de crédito/débito", checked: negocio.aceptaTarjeta },
            { name: "aceptaReservas", label: "Acepta reservas en línea", checked: negocio.aceptaReservas },
          ].map((c) => (
            <label key={c.name} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name={c.name}
                defaultChecked={c.checked}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ruc">RUC (opcional)</Label>
          <Input id="ruc" name="ruc" defaultValue={negocio.ruc ?? ""} placeholder="20123456789" maxLength={11} />
        </div>
      </div>

      {mensaje && (
        <div
          className={`px-4 py-3 rounded-xl text-sm ${
            mensaje.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {mensaje.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 text-base font-semibold"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
