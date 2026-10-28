"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Award, DollarSign, CheckCircle2, Building, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface StudentItem {
  id: string;
  name: string;
  university?: string;
  universities?: string[];
  status?: string;
  grantAmount?: string;
  ielts?: string;
  sat?: string;
  image?: string;
  bio?: string;
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [student, setStudent] = useState<StudentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        let docRef = doc(db, "graduates", studentId);
        let docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          docRef = doc(db, "students", studentId);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudent({
            id: docSnap.id,
            name: data.name || "Bitiruvchi",
            university: data.university || "",
            universities: data.universities || (data.university ? [data.university] : []),
            status: data.notes || data.status || (data.year ? `${data.year}-yil bitiruvchisi` : "Grant"),
            grantAmount: data.grantAmount || (data.notes?.includes("$") ? data.notes : undefined),
            image: data.imageUrl || data.image || "/data/maktab_binosi.png",
            bio: data.notes || data.bio || "",
            ielts: data.ielts,
            sat: data.sat,
          } as StudentItem);
        } else {
          setStudent(null);
        }
      } catch (err) {
        console.error("Error fetching single student:", err);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, [studentId]);

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[url('/images/bg-ornament.png')] bg-repeat bg-[size:360px_auto] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-28 md:pt-32 pb-16">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all mb-8 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#ff6b00]" />
          Barcha bitiruvchilarga qaytish
        </Link>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-[#ff6b00] rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-semibold">Bitiruvchi ma'lumotlari yuklanmoqda...</p>
          </div>
        ) : !student ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-[#071a33] mb-4">Bitiruvchi ma'lumoti topilmadi</h2>
            <Link
              href="/students"
              className="inline-block px-6 py-2.5 bg-[#ff6b00] text-white rounded-xl font-bold text-sm"
            >
              Bitiruvchilar ro'yxatiga qaytish
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Student Profile Banner */}
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden bg-slate-100 shrink-0 border-4 border-[#ff6b00]/30 shadow-lg">
                <Image
                  src={student.image || "/talaba_rasm.png"}
                  alt={student.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-extrabold uppercase tracking-wider mb-2">
                    ZIYO-ZUKKO Bitiruvchisi
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-[#071a33]">
                    {student.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {student.status && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-xl border border-emerald-200">
                      {student.status}
                    </span>
                  )}
                  {student.grantAmount && (
                    <span className="bg-amber-50 text-amber-700 text-xs font-extrabold px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                      {student.grantAmount} Yutib olingan grant
                    </span>
                  )}
                </div>

                {/* Score Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  {student.ielts && (
                    <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-[10px] font-extrabold text-blue-500 uppercase">IELTS Balli</p>
                        <p className="text-base font-black text-blue-900">{student.ielts}</p>
                      </div>
                    </div>
                  )}
                  {student.sat && (
                    <div className="bg-purple-50 px-4 py-2 rounded-2xl border border-purple-200 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-[10px] font-extrabold text-purple-500 uppercase">SAT Balli</p>
                        <p className="text-base font-black text-purple-900">{student.sat}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accepted Universities */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <Building className="w-6 h-6 text-[#ff6b00]" />
                <h2 className="text-xl font-bold text-[#071a33]">Qabul qilingan Universitetlar</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(student.universities || [student.university]).map((uni, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-[#071a33]">{uni}</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">Bakalavriat yo'nalishi</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio / Quote Section */}
            {student.bio && (
              <div className="bg-gradient-to-br from-[#071a33] to-[#0d284c] text-white rounded-3xl p-8 md:p-10 shadow-lg space-y-4">
                <BookOpen className="w-8 h-8 text-[#ff6b00]" />
                <h3 className="text-lg font-bold text-white">Muvaffaqiyat kaliti va tajriba</h3>
                <p className="text-white/80 leading-relaxed text-sm md:text-base font-medium">
                  "{student.bio}"
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
