import type { Metadata } from "next";
import { Poppins, Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "@/components/Providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RutaMisti — Descubre la Arequipa auténtica",
    template: "%s | RutaMisti",
  },
  description:
    "Picanterías, artesanos, guías locales y experiencias únicas en Arequipa, Perú.",
  keywords: ["Arequipa", "turismo", "picanterías", "artesanía", "guías"],
  openGraph: {
    siteName: "RutaMisti",
    locale: "es_PE",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "es" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${poppins.variable} ${nunito.variable}`}>
      <body className="min-h-screen flex flex-col antialiased" style={{ fontFamily: "var(--font-body)" }}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
