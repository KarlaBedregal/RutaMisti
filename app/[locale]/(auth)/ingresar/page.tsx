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

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function IngresarPage() {
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
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setServerError(t("errorCredenciales"));
      } else {
        router.push(`/${locale}`);
        router.refresh();
      }
    } catch {
      setServerError(t("errorGenerico"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("ingresarTitle")}</CardTitle>
        <CardDescription>{t("ingresarDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("password")}</Label>
              <Link
                href={`/${locale}/recuperar`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t("olvidaste")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full text-base"
          >
            {loading ? t("ingresando") : t("ingresar")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("sinCuenta")}{" "}
          <Link
            href={`/${locale}/registro`}
            className="font-medium hover:text-primary transition-colors"
            style={{ color: "var(--primary)" }}
          >
            {t("registrarse")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
