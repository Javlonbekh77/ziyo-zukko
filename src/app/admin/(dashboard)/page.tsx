"use client";

import { useState, useEffect } from "react";
import { Users, Award, Image as ImageIcon, Trophy, MessageSquare, Newspaper, Video, GraduationCap, BarChart3, Building2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    stats: 0,
    teachers: 0,
    graduates: 0,
    universities: 0,
    certificates: 0,
    gallery: 0,
    olympiads: 0,
    messages: 0,
    news: 0,
    videos: 0,
  });

  useEffect(() => {
    if (!db) return;
    const firestore = db;

    const unsubs: (() => void)[] = [];
    const collections = [
      { key: "stats", col: "stats" },
      { key: "teachers", col: "teachers" },
      { key: "graduates", col: "graduates" },
      { key: "universities", col: "universities" },
      { key: "certificates", col: "certificates" },
      { key: "gallery", col: "gallery" },
      { key: "olympiads", col: "olympiads" },
      { key: "messages", col: "messages" },
      { key: "news", col: "news" },
      { key: "videos", col: "videos" },
    ];

    collections.forEach(({ key, col }) => {
      try {
        const unsub = onSnapshot(collection(firestore, col), (snapshot) => {
          setCounts((prev) => ({ ...prev, [key]: snapshot.size }));
        });
        unsubs.push(unsub);
      } catch (e) {
        console.error(e);
      }
    });

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  const stats = [
    { name: "Natijalar (Statistika)", href: "/admin/stats", icon: BarChart3, count: counts.stats.toString(), color: "bg-orange-500" },
    { name: "Ustozlar", href: "/admin/teachers", icon: GraduationCap, count: counts.teachers.toString(), color: "bg-teal-500" },
    { name: "Bitiruvchilar", href: "/admin/graduates", icon: Users, count: counts.graduates.toString(), color: "bg-blue-500" },
    { name: "Ta'lim Muassasalari", href: "/admin/universities", icon: Building2, count: counts.universities.toString(), color: "bg-cyan-600" },
    { name: "Sertifikatlar", href: "/admin/certificates", icon: Award, count: counts.certificates.toString(), color: "bg-purple-500" },
    { name: "Yangiliklar", href: "/admin/news", icon: Newspaper, count: counts.news.toString(), color: "bg-rose-500" },
    { name: "Maktab Hayoti", href: "/admin/gallery", icon: ImageIcon, count: counts.gallery.toString(), color: "bg-pink-500" },
    { name: "Olimpiadachilar", href: "/admin/olympiads", icon: Trophy, count: counts.olympiads.toString(), color: "bg-amber-500" },
    { name: "Videolar (YT & Insta)", href: "/admin/videos", icon: Video, count: counts.videos.toString(), color: "bg-indigo-500" },
    { name: "Xabarlar", href: "/admin/messages", icon: MessageSquare, count: counts.messages.toString(), color: "bg-green-500" },
  ];

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
