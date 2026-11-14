import { setRequestLocale } from "next-intl/server";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Calendar, Star, User, LogOut } from "lucide-react";

export default async function PanelNegocioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/ingresar`);

  const negocio = await prisma.negocio.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, nombre: true, estado: true },
  });

  if (!negocio) redirect(`/${locale}`);

  const navItems = [
    { href: `/${locale}/panel/negocio`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/${locale}/panel/negocio/reservas`, label: "Reservas", icon: Calendar },
    { href: `/${locale}/panel/negocio/resenas`, label: "Reseñas", icon: Star },
    { href: `/${locale}/panel/negocio/perfil`, label: "Mi perfil", icon: User },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-light)" }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 min-h-screen shadow-sm"
        style={{ backgroundColor: "var(--primary-dark)" }}
      >
        <div className="p-5 border-b border-white/10">
          <Link href={`/${locale}`} className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            RutaMisti
          </Link>
          <p className="text-white/60 text-xs mt-1 truncate">{negocio.nombre}</p>
          {negocio.estado !== "aprobado" && (
            <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300">
              {negocio.estado === "pendiente" ? "En revisión" : negocio.estado}
            </span>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: `/${locale}` });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden w-full">
        <div
          className="flex items-center gap-3 px-4 py-3 overflow-x-auto"
          style={{ backgroundColor: "var(--primary-dark)" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/80 hover:text-white text-xs font-medium whitespace-nowrap"
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
