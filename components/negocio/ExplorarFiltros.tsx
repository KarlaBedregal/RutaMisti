"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

type Categoria = { slug: string; nombreEs: string; nombreEn: string; icono: string };

type Props = {
  categorias: Categoria[];
  locale: string;
};

const DISTRITOS = ["Yanahuara", "Cercado", "Cayma", "San Lázaro", "Sachaca"];

export default function ExplorarFiltros({ categorias, locale }: Props) {
  const t = useTranslations("explorar");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "__all__") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleBusqueda = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (e.target.value) {
        params.set("busqueda", e.target.value);
      } else {
        params.delete("busqueda");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const limpiar = () => router.push(pathname);

  const hayFiltros =
    searchParams.has("busqueda") ||
    searchParams.has("categoria") ||
    searchParams.has("distrito") ||
    searchParams.has("precio") ||
    searchParams.has("yape");

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={t("busquedaPlaceholder")}
          className="pl-9 h-11"
          defaultValue={searchParams.get("busqueda") ?? ""}
          onChange={handleBusqueda}
        />
      </div>

      {/* Filtros en fila */}
      <div className="flex flex-wrap gap-2">
        {/* Categoría */}
        <Select
          value={searchParams.get("categoria") ?? "__all__"}
          onValueChange={(v) => updateParam("categoria", v ?? "__all__")}
        >
          <SelectTrigger className="h-10 min-w-40 flex-1">
            <SelectValue placeholder={t("todasCategorias")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("todasCategorias")}</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.icono} {locale === "en" ? c.nombreEn : c.nombreEs}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Distrito */}
        <Select
          value={searchParams.get("distrito") ?? "__all__"}
          onValueChange={(v) => updateParam("distrito", v ?? "__all__")}
        >
          <SelectTrigger className="h-10 min-w-36 flex-1">
            <SelectValue placeholder={t("todosDistritos")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("todosDistritos")}</SelectItem>
            {DISTRITOS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Precio */}
        <Select
          value={searchParams.get("precio") ?? "__all__"}
          onValueChange={(v) => updateParam("precio", v ?? "__all__")}
        >
          <SelectTrigger className="h-10 min-w-36 flex-1">
            <SelectValue placeholder={t("todosPrecios")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("todosPrecios")}</SelectItem>
            <SelectItem value="1">{t("precioEconomico")}</SelectItem>
            <SelectItem value="2">{t("precioModerado")}</SelectItem>
            <SelectItem value="3">{t("precioPremium")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Yape */}
        <Button
          variant={searchParams.get("yape") === "1" ? "default" : "outline"}
          size="sm"
          className="h-10 gap-1"
          style={
            searchParams.get("yape") === "1"
              ? { backgroundColor: "#7c3aed", color: "white", borderColor: "#7c3aed" }
              : {}
          }
          onClick={() =>
            updateParam("yape", searchParams.get("yape") === "1" ? "" : "1")
          }
        >
          💜 {t("aceptaYape")}
        </Button>

        {/* Limpiar */}
        {hayFiltros && (
          <Button variant="ghost" size="sm" className="h-10 gap-1 text-gray-500" onClick={limpiar}>
            <X size={14} />
            {t("limpiarFiltros")}
          </Button>
        )}
      </div>
    </div>
  );
}
