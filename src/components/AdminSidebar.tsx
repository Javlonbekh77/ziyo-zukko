"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Award, 
  Image as ImageIcon, 
  Trophy, 
  MessageSquare,
  LayoutDashboard
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bitiruvchilar", href: "/admin/graduates", icon: Users },
  { name: "Sertifikatlar", href: "/admin/certificates", icon: Award },
  { name: "Maktab Hayoti", href: "/admin/gallery", icon: ImageIcon },
  { name: "Olimpiadachilar", href: "/admin/olympiads", icon: Trophy },
  { name: "Xabarlar", href: "/admin/messages", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0 bottom-0">
      <div className="mb-8 px-2 pt-4">
        <h2 className="text-2xl font-bold text-blue-400">Ziyo Zukko Admin</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
