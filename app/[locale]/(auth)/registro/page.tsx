"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/actions/auth/register";

const schema = z
  .object({
    nombre: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmar: z.string().min(6),
    privacidad: z.boolean(),
  })
  .refine((d) => d.password === d.confirmar, {
    message: "no_coincide",
    path: ["confirmar"],
  })
  .refine((d) => d.privacidad === true, {
    message: "requerido",
    path: ["privacidad"],
  });

type FormData = z.infer<typeof schema>;

export default function RegistroPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError("");
    try {
      const result = await registerAction({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
      });

      if ("error" in result) {
        setServerError(
          result.error === "EMAIL_USADO"
            ? t("errorEmailUsado")
            : t("errorGenerico")
        );
        return;
      }

      // Auto-login tras registro exitoso
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push(`/${locale}`);
      router.refresh();
    } catch {
      setServerError(t("errorGenerico"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("registroTitle")}</CardTitle>
        <CardDescription>{t("registroDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">{t("nombre")}</Label>
            <Input
              id="nombre"
              type="text"
              placeholder={t("nombrePlaceholder")}
              autoComplete="name"
              aria-invalid={!!errors.nombre}
              {...register("nombre")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmar">{t("confirmarPassword")}</Label>
            <Input
              id="confirmar"
              type="password"
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
              aria-invalid={!!errors.confirmar}
              {...register("confirmar")}
            />
            {errors.confirmar && (
              <p className="text-xs text-destructive">
                {t("errorPasswordNoCoincide")}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="privacidad"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              aria-invalid={!!errors.privacidad}
              {...register("privacidad")}
            />
            <Label htmlFor="privacidad" className="font-normal cursor-pointer">
              {t("aceptarPrivacidad")}{" "}
              <Link
                href={`/${locale}/privacidad`}
                className="underline hover:text-primary transition-colors"
                style={{ color: "var(--primary)" }}
                target="_blank"
              >
                {t("politicaPrivacidad")}
              </Link>
            </Label>
          </div>
          {errors.privacidad && (
            <p className="text-xs text-destructive">{t("errorPrivacidad")}</p>
          )}

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full text-base"
          >
            {loading ? t("registrandose") : t("registrarse")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("yaTienes")}{" "}
          <Link
            href={`/${locale}/ingresar`}
            className="font-medium hover:underline"
            style={{ color: "var(--primary)" }}
          >
            {t("ingresar")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
