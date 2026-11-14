import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "es" | "en")) notFound();
  setRequestLocale(locale);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, var(--accent) 100%)",
      }}
    >
      <Link
        href={`/${locale}`}
        className="mb-8 text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Ruta<span style={{ color: "var(--yellow)" }}>Misti</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
