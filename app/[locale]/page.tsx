import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative py-20 px-4 text-white text-center"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, var(--accent) 100%)",
          }}
        >
          <div className="max-w-2xl mx-auto">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t("heroTitle")}
            </h1>
            <p className="text-lg text-blue-100 mb-8">{t("heroSubtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="text"
                placeholder={t("heroPlaceholder")}
                className="flex-1 rounded-2xl px-5 py-3 text-gray-800 text-sm outline-none shadow"
              />
              <Link
                href={`/${locale}/explorar`}
                className="px-6 py-3 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--yellow)", color: "var(--text)" }}
              >
                {t("heroCta")}
              </Link>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="py-14 px-4" style={{ backgroundColor: "var(--bg-light)" }}>
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-2xl font-bold text-center mb-8"
              style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
            >
              {t("categoriasTitle")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: "🍲", label: "Picanterías", slug: "picanteria" },
                { icon: "🏺", label: "Artesanía", slug: "artesania" },
                { icon: "👨‍🍳", label: "Talleres", slug: "taller-de-cocina" },
                { icon: "🧭", label: "Guías locales", slug: "guia-local" },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={`/${locale}/explorar?categoria=${cat.slug}`}
                  className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                    {cat.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Negocio */}
        <section className="py-14 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "var(--font-heading)", color: "var(--primary-dark)" }}
            >
              {t("negocioCtaTitle")}
            </h2>
            <p className="text-gray-500 mb-6">{t("negocioCtaSubtitle")}</p>
            <Link
              href={`/${locale}/registra-tu-negocio`}
              className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {t("negocioCtaBtn")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
