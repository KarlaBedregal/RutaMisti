import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Store, Star, FileText } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id || (session.user as { rol?: string }).rol !== "admin") {
    redirect(`/${locale}`);
  }

  const navItems = [
    { href: `/${locale}/admin`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/${locale}/admin/negocios`, label: "Negocios", icon: Store },
    { href: `/${locale}/admin/resenas`, label: "Reseñas", icon: Star },
    { href: `/${locale}/admin/reclamos`, label: "Reclamos", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f8fafc" }}>
      <aside className="hidden md:flex flex-col w-56 min-h-screen shadow-sm bg-gray-900">
        <div className="p-5 border-b border-white/10">
          <Link href={`/${locale}`} className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            RutaMisti
          </Link>
          <p className="text-white/40 text-xs mt-1">Panel Admin</p>
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
              className="text-white/60 hover:text-white text-sm px-3 py-2 w-full text-left"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="md:hidden w-full">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-gray-900">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/80 text-xs font-medium whitespace-nowrap"
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
