"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Award, 
  Image as ImageIcon, 
  Trophy, 
  MessageSquare,
  LayoutDashboard,
  Newspaper,
  Video,
  GraduationCap,
  Building2,
  FileText,
  LogOut
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Statistika (Natijalar)", href: "/admin/stats", icon: Award },
  { name: "Ustozlar", href: "/admin/teachers", icon: GraduationCap },
  { name: "Bitiruvchilar", href: "/admin/graduates", icon: Users },
  { name: "Ta'lim Muassasalari", href: "/admin/universities", icon: Building2 },
  { name: "Sertifikatlar", href: "/admin/certificates", icon: Award },
  { name: "Hujjatlar", href: "/admin/documents", icon: FileText },
  { name: "Yangiliklar", href: "/admin/news", icon: Newspaper },
  { name: "Maktab Hayoti", href: "/admin/gallery", icon: ImageIcon },
  { name: "Olimpiadachilar", href: "/admin/olympiads", icon: Trophy },
  { name: "Videolar (YouTube & Insta)", href: "/admin/videos", icon: Video },
  { name: "Xabarlar", href: "/admin/messages", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0 bottom-0 z-30">
      <div className="mb-6 px-2 pt-4">
        <h2 className="text-2xl font-bold text-blue-400">Ziyo Zukko Admin</h2>
        <p className="text-xs text-slate-400 mt-1">Boshqaruv paneli</p>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-medium" 
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="pt-4 mt-auto border-t border-slate-800/80">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors group cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-medium text-sm">Chiqish</span>
          </button>
        </form>
      </div>
    </div>
  );
}
