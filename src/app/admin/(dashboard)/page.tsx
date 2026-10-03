"use client";

import { Users, Award, Image as ImageIcon, Trophy, MessageSquare } from "lucide-react";
import Link from "next/link";

const stats = [
  { name: "Bitiruvchilar", href: "/admin/graduates", icon: Users, count: "0", color: "bg-blue-500" },
  { name: "Sertifikatlar", href: "/admin/certificates", icon: Award, count: "0", color: "bg-purple-500" },
  { name: "Maktab Hayoti", href: "/admin/gallery", icon: ImageIcon, count: "0", color: "bg-pink-500" },
  { name: "Olimpiadachilar", href: "/admin/olympiads", icon: Trophy, count: "0", color: "bg-amber-500" },
  { name: "Xabarlar", href: "/admin/messages", icon: MessageSquare, count: "0", color: "bg-green-500" },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Xush kelibsiz, admin paneli orqali saytni boshqarishingiz mumkin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                  <h3 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {stat.count}
                  </h3>
                </div>
                <div className={`${stat.color} p-4 rounded-lg text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
