"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  ArrowLeft,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Building2,
  Scale,
  Award,
  Filter,
  Check,
  Eye,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DocumentViewerModal from "@/components/documents/DocumentViewerModal";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { SCHOOL_DOCUMENTS, SchoolDocument } from "@/data/documentsData";
import { useLanguage } from "@/context/LanguageContext";

function DocumentsContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [documentsList, setDocumentsList] = useState<SchoolDocument[]>(SCHOOL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [activeDoc, setActiveDoc] = useState<SchoolDocument | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Subscribe to live documents from Firestore with fallback
  useEffect(() => {
    if (!db) return;
    try {
      const colRef = collection(db, "documents");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: SchoolDocument[] = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as SchoolDocument[];
            setDocumentsList(fetched);
          } else {
            setDocumentsList(SCHOOL_DOCUMENTS);
          }
        },
        () => {
          // Fallback without orderBy
          const simpleUnsub = onSnapshot(colRef, (snap) => {
            if (!snap.empty) {
              const fetched: SchoolDocument[] = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
              })) as SchoolDocument[];
              setDocumentsList(fetched);
            } else {
              setDocumentsList(SCHOOL_DOCUMENTS);
            }
          });
          return () => simpleUnsub();
        }
      );
      return () => unsub();
    } catch {
      setDocumentsList(SCHOOL_DOCUMENTS);
    }
  }, []);

  // Check URL query parameters for direct page deep linking
  useEffect(() => {
    const docParam = searchParams.get("doc");
    const pageParam = searchParams.get("page");

    if (docParam) {
      const found = documentsList.find(
        (d) => d.slug === docParam || d.id === docParam
      );
      if (found) {
        setActiveDoc(found);
        if (pageParam) {
          const parsedPage = parseInt(pageParam, 10);
          if (!isNaN(parsedPage)) {
            setActivePage(Math.min(Math.max(1, parsedPage), found.pagesCount || 1));
          } else {
            setActivePage(1);
          }
        } else {
          setActivePage(1);
        }
      }
    } else {
      setActiveDoc(null);
    }
  }, [searchParams, documentsList]);

  // Open Document Modal and update URL
  const handleOpenDoc = (doc: SchoolDocument, pageNum: number = 1) => {
    setActiveDoc(doc);
    setActivePage(pageNum);
    const url = new URL(window.location.href);
    url.searchParams.set("doc", doc.slug);
    url.searchParams.set("page", pageNum.toString());
    window.history.pushState({}, "", url.toString());
  };

  // Close Document Modal and clear URL query parameters
  const handleCloseModal = () => {
    setActiveDoc(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("doc");
    url.searchParams.delete("page");
    window.history.pushState({}, "", url.pathname);
  };

  // Quick copy link for a document card
  const handleQuickCopyLink = async (doc: SchoolDocument) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const directUrl = `${origin}/documents?doc=${doc.slug}&page=1`;
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopiedDocId(doc.id);
      setTimeout(() => setCopiedDocId(null), 2500);
    } catch {
      // fallback
    }
  };

  // Categories
  const categories = [
    { id: "all", label: { uz: "Barchasi", ru: "Все", en: "All" } },
    { id: "legal", label: { uz: "Litsenziya va Nizom", ru: "Лицензии и Устав", en: "Legal & License" } },
    { id: "academic", label: { uz: "O'quv dasturlari", ru: "Учебные программы", en: "Curricula & Standards" } },
    { id: "admissions", label: { uz: "Qabul va Shartnomalar", ru: "Приём и Договоры", en: "Admissions & Contracts" } },
    { id: "rules", label: { uz: "Ichki tartib & Qoidalar", ru: "Внутренний распорядок", en: "Rules & Ethics" } },
    { id: "safety", label: { uz: "Xavfsizlik & Ekspertiza", ru: "Безопасность и СЭС", en: "Safety & Conformance" } },
  ];

  // Formats
  const formats = [
    { id: "all", label: "Barcha formatlar" },
    { id: "PDF", label: "PDF hujjatlar" },
    { id: "DOCX", label: "DOCX / Word" },
  ];

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documentsList.filter((doc) => {
      const titleStr = doc.title[lang] || doc.title.uz;
      const summaryStr = doc.summary[lang] || doc.summary.uz;
      const regStr = doc.regNumber;

      const matchesSearch =
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summaryStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        regStr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || doc.category === selectedCategory;

      const matchesFormat =
        selectedFormat === "all" ||
        doc.format.toUpperCase().includes(selectedFormat.toUpperCase());

      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [documentsList, searchQuery, selectedCategory, selectedFormat, lang]);

  // Headers and Subtitles
  const heroBadge =
    lang === "ru"
      ? "Нормативно-правовая база школы"
      : lang === "en"
      ? "Official Regulatory Framework"
      : "Maktab me'yoriy-huquqiy bazasi";

  const heroTitle =
    lang === "ru"
      ? "Официальные документы школы"
      : lang === "en"
      ? "School Official Documents"
      : "Maktab Rasmiy Hujjatlari";

  const heroSubtitle =
    lang === "ru"
      ? "Ознакомьтесь с государственными лицензиями, уставом, учебными планами и типовыми договорами негосударственной школы «ZIYO-ZUKKO»."
      : lang === "en"
      ? "Explore state educational licenses, accreditation, charters, academic curricula, and admission agreements of «ZIYO-ZUKKO» private school."
      : "O'zbekiston Xalqaro Islom Akademiyasi qoshidagi «ZIYO-ZUKKO» nodavlat umumta'lim muassasasining davlat litsenziyasi, nizomi, o'quv dasturlari va rasmiy shartnomalari bilan tanishing.";

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[url('/images/bg-ornament.png')] bg-repeat bg-[size:360px_auto] text-[#071a33] flex flex-col font-sans">
      <Navbar solidAtTop={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-20">
        {/* Back to Home & Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200/80 px-4 py-2 rounded-full shadow-sm hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#ff6b00]" />
            {t("backToHome")}
          </Link>
        </div>

        {/* Hero Section Header Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 md:p-12 border border-slate-200/80 shadow-xl shadow-slate-900/5 mb-10 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-bold uppercase tracking-wider mb-4 border border-[#ff6b00]/20">
              <ShieldCheck className="w-4 h-4" />
              <span>{heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#071a33] tracking-tight leading-tight">
              {heroTitle}
            </h1>

            <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-4 leading-relaxed font-medium">
              {heroSubtitle}
            </p>

            {/* Quick Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-[#ff6b00]">
                  {documentsList.length} ta
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  Rasmiy hujjatlar
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-[#071a33]">
                  100%
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  Davlat litsenziyasi
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-[#071a33]">
                  2026–2027
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  O&apos;quv yili rejasi
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-emerald-600">
                  PDF &amp; DOCX
                </span>
                <span className="text-xs text-gray-500 font-semibold">
                  Elektron formatlar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={
                  lang === "ru"
                    ? "Поиск по названию или номеру..."
                    : lang === "en"
                    ? "Search documents by title or number..."
                    : "Hujjat nomi yoki raqami bo'yicha qidiruv..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-[#071a33] focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all shadow-sm"
              />
            </div>

            {/* Format Selector Pills */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm shrink-0 overflow-x-auto">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedFormat === f.id
                      ? "bg-[#071a33] text-white shadow-sm"
                      : "text-gray-600 hover:text-[#071a33] hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#ff6b00] text-white shadow-md shadow-orange-500/25"
                    : "bg-white/90 text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-[#071a33]"
                }`}
              >
                {cat.label[lang] || cat.label.uz}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Cards Grid */}
        {filteredDocs.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 text-center border border-gray-200 shadow-sm my-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#071a33] mb-2">
              Hujjat topilmadi
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Izlash shartlaringizga mos keladigan rasmiy hujjatlar topilmadi. Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedFormat("all");
              }}
              className="px-6 py-2.5 bg-[#ff6b00] text-white rounded-xl font-bold text-sm hover:bg-[#e05e00] transition-colors cursor-pointer"
            >
              Barcha hujjatlarni ko&apos;rsatish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredDocs.map((item, index) => {
              const itemTitle = item.title[lang] || item.title.uz;
              const itemSummary = item.summary[lang] || item.summary.uz;
              const isPdf = item.format === "PDF";
              const isCopied = copiedDocId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-[#ff6b00]/50 relative"
                >
                  {/* Top Meta Header */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      {/* Format Badge */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                            isPdf
                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{item.format}</span>
                        </span>

                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                          {item.pagesCount} sahifa
                        </span>
                      </div>

                      {/* File Size & Reg */}
                      <span className="text-[11px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {item.fileSize}
                      </span>
                    </div>

                    {/* Registration Number */}
                    <p className="text-[11px] font-mono font-bold text-gray-600 uppercase tracking-wider mb-2">
                      {item.regNumber}
                    </p>

                    {/* Title */}
                    <h2
                      onClick={() => handleOpenDoc(item, 1)}
                      className="text-lg sm:text-xl font-black text-[#071a33] group-hover:text-[#ff6b00] transition-colors leading-snug cursor-pointer"
                    >
                      {itemTitle}
                    </h2>

                    {/* Summary */}
                    <p className="text-gray-600 text-xs sm:text-sm mt-3 leading-relaxed line-clamp-3">
                      {itemSummary}
                    </p>
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="pt-6 mt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Primary: Open inside site */}
                    <button
                      onClick={() => handleOpenDoc(item, 1)}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-[#071a33] hover:bg-[#ff6b00] text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer group/btn"
                    >
                      <Eye className="w-4 h-4 text-[#ff6b00] group-hover/btn:text-white transition-colors" />
                      <span>Saytda ochish</span>
                    </button>

                    {/* Secondary: Direct Page Link Share */}
                    <button
                      onClick={() => handleQuickCopyLink(item)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                        isCopied
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                      title="Ushbu hujjat havolasini nusxalash"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="hidden sm:inline">Nusxalandi!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-[#ff6b00]" />
                          <span className="hidden sm:inline">Ulashish</span>
                        </>
                      )}
                    </button>

                    {/* Download File */}
                    <a
                      href={item.fileUrl}
                      download
                      className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                      title="Faylni yuklab olish"
                    >
                      <Download className="w-4 h-4 text-slate-600 hover:text-[#071a33]" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legal Disclaimer Box */}
        <div className="mt-16 bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-gray-200 text-xs text-gray-500 leading-relaxed flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-[#ff6b00] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-1">
              Rasmiy me&apos;yoriy-huquqiy kafolat
            </h4>
            <p>
              Ushbu sahifadagi barcha me&apos;yoriy hujjatlar, litsenziyalar va nizomlar O&apos;zbekiston Respublikasi qonunchiligiga muvofiq rasmiy tasdiqlangan bo&apos;lib, «ZIYO-ZUKKO» nodavlat umumta&apos;lim muassasasi faoliyatining qonuniyligi va to&apos;liq shaffofligini ta&apos;minlaydi. Fayllar yuqori xavfsizlikli elektron omborda va maktab arxiv serverida rasmiy tasdiqlangan holda saqlanadi.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* In-Site Document Viewer Modal */}
      {activeDoc && (
        <DocumentViewerModal
          document={activeDoc}
          initialPage={activePage}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#ff6b00] rounded-full animate-spin" />
        </div>
      }
    >
      <DocumentsContent />
    </Suspense>
  );
}
