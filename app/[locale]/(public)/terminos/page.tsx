import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Términos y condiciones · RutaMisti",
};

export default async function TerminosPage({
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
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 prose prose-sm">
        <h1>{isEn ? "Terms and Conditions" : "Términos y Condiciones"}</h1>
        <p className="text-gray-500 text-sm">
          {isEn ? "Last updated: November 2026" : "Última actualización: noviembre 2026"}
        </p>

        {isEn ? (
          <>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing RutaMisti, you agree to these terms. If you do not agree, please do not use the platform.</p>

            <h2>2. Description of Service</h2>
            <p>RutaMisti is a tourism platform connecting visitors with local businesses in Arequipa, Peru. We provide a directory, booking system, and themed routes.</p>

            <h2>3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account. Provide accurate information during registration.</p>

            <h2>4. Business Listings</h2>
            <p>Businesses listed on RutaMisti must provide accurate information. Listings are subject to approval by our team.</p>

            <h2>5. Reservations</h2>
            <p>RutaMisti facilitates reservations but is not a party to any contract between users and businesses. Businesses are solely responsible for honoring reservations.</p>

            <h2>6. Limitation of Liability</h2>
            <p>RutaMisti is not liable for any damages arising from the use of the platform or services provided by listed businesses.</p>

            <h2>7. Contact</h2>
            <p>For questions, contact us at hola@rutamisti.pe</p>
          </>
        ) : (
          <>
            <h2>1. Aceptación de los términos</h2>
            <p>Al acceder a RutaMisti, aceptas estos términos. Si no estás de acuerdo, no utilices la plataforma.</p>

            <h2>2. Descripción del servicio</h2>
            <p>RutaMisti es una plataforma de turismo que conecta visitantes con negocios locales en Arequipa, Perú. Ofrecemos un directorio, sistema de reservas y rutas temáticas.</p>

            <h2>3. Cuentas de usuario</h2>
            <p>Eres responsable de mantener la confidencialidad de tu cuenta. Proporciona información veraz durante el registro.</p>

            <h2>4. Registro de negocios</h2>
            <p>Los negocios listados en RutaMisti deben proporcionar información exacta. Los registros están sujetos a aprobación por nuestro equipo.</p>

            <h2>5. Reservas</h2>
            <p>RutaMisti facilita las reservas pero no es parte de ningún contrato entre usuarios y negocios. Los negocios son los únicos responsables de honrar las reservas.</p>

            <h2>6. Limitación de responsabilidad</h2>
            <p>RutaMisti no es responsable de daños derivados del uso de la plataforma o de los servicios prestados por los negocios listados.</p>

            <h2>7. Contacto</h2>
            <p>Para consultas, contáctanos en hola@rutamisti.pe</p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
