import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Política de privacidad · RutaMisti",
};

export default async function PrivacidadPage({
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
        <h1>{isEn ? "Privacy Policy" : "Política de Privacidad"}</h1>
        <p className="text-gray-500 text-sm">
          {isEn ? "Last updated: November 2026" : "Última actualización: noviembre 2026"}
        </p>

        {isEn ? (
          <>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide during registration (name, email), booking requests (name, email, phone), and usage data.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to provide our services, process reservations, and communicate with you about your bookings.</p>

            <h2>3. Information Sharing</h2>
            <p>We share your booking information with the relevant business to process your reservation. We do not sell personal data to third parties.</p>

            <h2>4. Data Security</h2>
            <p>We implement technical measures to protect your personal data. Passwords are stored using secure hashing.</p>

            <h2>5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact us at hola@rutamisti.pe to exercise these rights.</p>

            <h2>6. Cookies</h2>
            <p>We use session cookies for authentication. No third-party tracking cookies are used.</p>

            <h2>7. Contact</h2>
            <p>For privacy inquiries: hola@rutamisti.pe</p>
          </>
        ) : (
          <>
            <h2>1. Información que recopilamos</h2>
            <p>Recopilamos la información que proporcionas durante el registro (nombre, correo), en las reservas (nombre, correo, teléfono) y datos de uso.</p>

            <h2>2. Cómo usamos tu información</h2>
            <p>Usamos tu información para brindar nuestros servicios, procesar reservas y comunicarnos contigo sobre tus reservaciones.</p>

            <h2>3. Compartir información</h2>
            <p>Compartimos la información de tu reserva con el negocio correspondiente para procesarla. No vendemos datos personales a terceros.</p>

            <h2>4. Seguridad de datos</h2>
            <p>Implementamos medidas técnicas para proteger tus datos personales. Las contraseñas se almacenan usando hashing seguro.</p>

            <h2>5. Tus derechos</h2>
            <p>Tienes derecho a acceder, corregir o eliminar tus datos personales. Contáctanos en hola@rutamisti.pe para ejercer estos derechos.</p>

            <h2>6. Cookies</h2>
            <p>Usamos cookies de sesión para autenticación. No utilizamos cookies de seguimiento de terceros.</p>

            <h2>7. Contacto</h2>
            <p>Para consultas de privacidad: hola@rutamisti.pe</p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
