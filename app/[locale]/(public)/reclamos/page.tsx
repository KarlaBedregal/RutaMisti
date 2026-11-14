import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FormularioReclamo from "@/components/reclamos/FormularioReclamo";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones · RutaMisti",
};

export default async function ReclamosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEn = locale === "en";

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        <div
          className="text-center mb-8 p-6 rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, var(--primary-dark), var(--primary))" }}
        >
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {isEn ? "Complaint Book" : "Libro de Reclamaciones"}
          </h1>
          <p className="text-white/80 text-sm mt-2">
            {isEn
              ? "In compliance with Peruvian consumer protection law (Ley 29571)"
              : "En cumplimiento del Código de Protección al Consumidor (Ley 29571)"}
          </p>
        </div>
        <FormularioReclamo locale={locale} />
      </main>
      <Footer />
    </>
  );
}
