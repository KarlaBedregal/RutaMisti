"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
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

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export default function RecuperarPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    // Fase 3 avanzada: implementar envío real con Resend
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("recuperarTitle")}</CardTitle>
        <CardDescription>{t("recuperarDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="text-4xl">📬</div>
            <p className="text-sm text-muted-foreground">{t("recuperarExito")}</p>
            <Link
              href={`/${locale}/ingresar`}
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              {t("volverIngresar")}
            </Link>
          </div>
        ) : (
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

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full text-base"
            >
              {loading ? "..." : t("recuperarBtn")}
            </Button>

            <Link
              href={`/${locale}/ingresar`}
              className="text-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("volverIngresar")}
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
