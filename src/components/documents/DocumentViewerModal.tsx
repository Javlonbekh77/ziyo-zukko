"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  FileText,
  ShieldCheck,
  QrCode,
  Layers,
  FileCode,
  ExternalLink,
} from "lucide-react";
import { SchoolDocument } from "@/data/documentsData";
import { useLanguage } from "@/context/LanguageContext";

interface DocumentViewerModalProps {
  document: SchoolDocument | null;
  initialPage?: number;
  onClose: () => void;
}

export default function DocumentViewerModal({
  document: doc,
  initialPage = 1,
  onClose,
}: DocumentViewerModalProps) {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: "file" (actual PDF/DOCX embed) or "text" (transcribed/formatted text)
  const [activeView, setActiveView] = useState<"file" | "text">("file");
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isProgrammaticScroll = useRef<boolean>(false);

  // Determine actual file URL to display
  const targetFileUrl = doc?.r2PublicUrl || doc?.fileUrl || "";
  const isPdf =
    doc?.format?.toUpperCase() === "PDF" ||
    targetFileUrl?.toLowerCase().endsWith(".pdf");
  const isDocx =
    doc?.format?.toUpperCase() === "DOC" ||
    doc?.format?.toUpperCase() === "DOCX" ||
    targetFileUrl?.toLowerCase().endsWith(".doc") ||
    targetFileUrl?.toLowerCase().endsWith(".docx");

  const hasPages = Boolean(doc?.pages && doc.pages.length > 0);

  // Scroll to page in text view
  const scrollToPage = useCallback((pageNum: number, smooth: boolean = true) => {
    const container = pageContainerRef.current;
    const targetEl = pageRefs.current[pageNum];
    if (container && targetEl) {
      isProgrammaticScroll.current = true;
      const targetTop = targetEl.offsetTop - container.offsetTop - 16;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: smooth ? "smooth" : "auto",
      });

      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, smooth ? 600 : 150);
    }
  }, []);

  // Sync initial page
  useEffect(() => {
    if (doc) {
      const validPage = Math.min(Math.max(1, initialPage || 1), doc.pagesCount || 1);
      setCurrentPage(validPage);
    }
  }, [doc, initialPage]);

  // Pause Lenis smooth scroll while document viewer is open
  useEffect(() => {
    if (doc) {
      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
      }
      return () => {
        if (lenis && typeof lenis.start === "function") {
          lenis.start();
        }
      };
    }
  }, [doc]);

  // Update URL deep link when page changes
  const updateUrlPage = useCallback(
    (newPage: number) => {
      if (!doc) return;
      const url = new URL(window.location.href);
      url.searchParams.set("doc", doc.slug);
      url.searchParams.set("page", newPage.toString());
      window.history.replaceState({}, "", url.toString());
    },
    [doc]
  );

  const handlePageChange = (newPage: number) => {
    if (!doc) return;
    const bounded = Math.min(Math.max(1, newPage), doc.pagesCount || 1);
    setCurrentPage(bounded);
    updateUrlPage(bounded);
    if (activeView === "text") {
      scrollToPage(bounded, true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!doc) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (currentPage > 1) handlePageChange(currentPage - 1);
      } else if (e.key === "ArrowRight") {
        if (currentPage < (doc.pagesCount || 1)) handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [doc, currentPage, onClose]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Get shareable direct page URL
  const getDirectPageUrl = (): string => {
    if (typeof window === "undefined" || !doc) return "";
    const origin = window.location.origin;
    return `${origin}/documents?doc=${doc.slug}&page=${currentPage}`;
  };

  // Single Bottom-Corner Copy Link Handler
  const handleCopyLink = async () => {
    const directUrl = getDirectPageUrl();
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopied(true);
      showToast(
        lang === "ru"
          ? "Ссылка на документ скопирована!"
          : lang === "en"
          ? "Document link copied to clipboard!"
          : "Hujjat havolasi nusxalandi!"
      );
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Havolani nusxalashda xatolik yuz berdi");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!doc) return null;

  const docTitle = doc.title[lang] || doc.title.uz || "Rasmiy Hujjat";

  // Google / Office Viewer URL for online DOC/DOCX files
  const isOnlineUrl =
    targetFileUrl.startsWith("http://") || targetFileUrl.startsWith("https://");
  const officeEmbedUrl = isOnlineUrl
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        targetFileUrl
      )}`
    : "";
  const googleDocsViewerUrl = isOnlineUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(
        targetFileUrl
      )}&embedded=true`
    : "";

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-slate-100 select-none animate-fadeIn w-screen h-[100dvh] overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[130] bg-[#ff6b00] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Control Bar */}
      <header className="h-16 border-b border-white/10 bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left: Document info & Back */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Yopish (Esc)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  doc.format === "PDF" || isPdf
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                {doc.format || (isPdf ? "PDF" : "DOCX")}
              </span>
              <span className="text-[11px] text-slate-400 truncate hidden md:inline font-mono">
                {doc.regNumber}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl">
              {docTitle}
            </h2>
          </div>
        </div>

        {/* Center: View Switcher (Asl Fayl vs Matnli nusxa) */}
        {hasPages && (
          <div className="hidden sm:flex items-center bg-black/40 border border-white/10 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setActiveView("file")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === "file"
                  ? "bg-[#ff6b00] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Asl fayl ({doc.format})
            </button>
            <button
              onClick={() => setActiveView("text")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === "text"
                  ? "bg-[#ff6b00] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Matnli ko&apos;rinish
            </button>
          </div>
        )}

        {/* Right: Actions (Download, Print, Fullscreen, Close) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Download Original File */}
          <a
            href={targetFileUrl}
            download
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Asl faylni yuklab olish"
          >
            <Download className="w-4 h-4 text-[#ff6b00]" />
            <span className="hidden md:inline">Yuklab olish</span>
          </a>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-all cursor-pointer hidden lg:flex items-center justify-center"
            title="Chop etish"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-all cursor-pointer hidden sm:flex items-center justify-center"
            title="To'liq ekran"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer ml-1"
            title="Yopish (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Document Workspace */}
      <div className="flex-1 flex overflow-hidden relative w-full h-[calc(100dvh-4rem)]">
        {/* If Active View is FILE (Opens the ACTUAL document file directly) */}
        {activeView === "file" ? (
          <div className="flex-1 w-full h-full p-2 sm:p-4 bg-slate-900/90 flex flex-col items-center justify-center overflow-hidden">
            {isPdf ? (
              /* PDF Native High-Quality Browser Embed */
              <div className="w-full h-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 flex flex-col">
                <iframe
                  src={`${targetFileUrl}#toolbar=1&navpanes=1&page=${currentPage}&view=FitH`}
                  className="w-full h-full border-0 rounded-2xl bg-white"
                  title={docTitle}
                />
              </div>
            ) : isDocx ? (
              /* Word DOC/DOCX Viewer & Preview Card */
              <div className="w-full h-full max-w-5xl flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar">
                {isOnlineUrl ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white flex flex-col">
                    <iframe
                      src={officeEmbedUrl || googleDocsViewerUrl}
                      className="w-full h-full min-h-[500px] border-0 rounded-2xl bg-white"
                      title={docTitle}
                    />
                  </div>
                ) : (
                  <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-10 max-w-xl w-full text-center shadow-2xl space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                      <FileCode className="w-10 h-10" />
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Microsoft Word Hujjati (DOCX)
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white mt-3">
                        {docTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-2">
                        Hujjat hajmi: <strong className="text-white">{doc.fileSize}</strong> • Ro&apos;yxat raqami: {doc.regNumber}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/5">
                      {doc.summary[lang] || doc.summary.uz}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <a
                        href={targetFileUrl}
                        download
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold text-sm shadow-xl shadow-orange-500/20 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Faylni yuklab olish (Word)</span>
                      </a>

                      {hasPages && (
                        <button
                          onClick={() => setActiveView("text")}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/10 transition-all cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-[#ff6b00]" />
                          <span>Saytda matnini o&apos;qish</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Generic / Fallback file iframe */
              <div className="w-full h-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white">
                <iframe
                  src={targetFileUrl}
                  className="w-full h-full border-0 rounded-2xl bg-white"
                  title={docTitle}
                />
              </div>
            )}
          </div>
        ) : (
          /* If Active View is TEXT (Continuous multi-page readable view with watermark) */
          <div className="flex-1 flex overflow-hidden relative w-full">
            {/* Left Drawer: Page Thumbnails */}
            <aside
              data-lenis-prevent
              className={`transition-all duration-300 shrink-0 border-r border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col ${
                showThumbnails ? "w-64 sm:w-72" : "w-0 overflow-hidden"
              } hidden md:flex`}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-[#ff6b00]" />
                  <span>Sahifalar ({doc.pages?.length || 1})</span>
                </div>
                <button
                  onClick={() => setShowThumbnails(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {doc.pages?.map((p) => {
                  const isActive = p.pageNumber === currentPage;
                  return (
                    <div
                      key={p.pageNumber}
                      onClick={() => handlePageChange(p.pageNumber)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                        isActive
                          ? "bg-[#ff6b00]/15 border-[#ff6b00] shadow-md shadow-orange-500/10"
                          : "bg-slate-800/40 border-white/10 hover:border-white/30 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded ${
                            isActive
                              ? "bg-[#ff6b00] text-white"
                              : "bg-white/10 text-slate-300 group-hover:text-white"
                          }`}
                        >
                          {p.pageNumber}-sahifa
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-1">
                        {p.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Floating toggle button when thumbnails hidden */}
            {!showThumbnails && hasPages && (
              <button
                onClick={() => setShowThumbnails(true)}
                className="absolute left-4 top-4 z-20 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 shadow-xl transition-all cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-bold"
              >
                <Layers className="w-4 h-4 text-[#ff6b00]" />
                <span>Sahifalar</span>
              </button>
            )}

            {/* Continuous Text Pages Canvas */}
            <main
              ref={pageContainerRef}
              data-lenis-prevent
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 md:p-12 flex flex-col items-center justify-start bg-slate-950/70 custom-scrollbar space-y-12"
            >
              {doc.pages?.map((pageData) => (
                <div
                  key={pageData.pageNumber}
                  ref={(el) => {
                    pageRefs.current[pageData.pageNumber] = el;
                  }}
                  data-page-number={pageData.pageNumber}
                  className="w-full max-w-[820px] bg-white text-[#071a33] rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-12 md:p-16 my-2 relative font-serif select-text min-h-[900px] flex flex-col justify-between"
                >
                  {/* Girih Background Watermark */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.035] bg-repeat bg-center rounded-2xl"
                    style={{
                      backgroundImage: "url('/images/bg-ornament.png')",
                      backgroundSize: "280px auto",
                    }}
                  />

                  {/* Top Sheet Header */}
                  <div>
                    <div className="border-b-2 border-[#071a33]/20 pb-6 mb-8 text-center relative">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-full border-2 border-[#071a33]/30 flex items-center justify-center p-2 bg-slate-50 shadow-inner">
                        <ShieldCheck className="w-8 h-8 text-[#071a33]/80" />
                      </div>

                      <p className="text-[10px] sm:text-xs font-bold tracking-widest text-[#071a33]/70 uppercase font-sans mb-1">
                        O&apos;zbekiston Respublikasi Maktabgacha va maktab ta&apos;limi vazirligi
                      </p>
                      <p className="text-xs sm:text-sm font-black tracking-wide text-[#071a33] uppercase font-sans">
                        «ZIYO-ZUKKO» nodavlat umumta&apos;lim muassasasi
                      </p>
                      <p className="text-[10px] text-gray-500 font-sans mt-1">
                        Toshkent shahri, Olmazor tumani, Zarqaynar 18-berk ko&apos;cha, 47-uy • Tel: +998 71 244 35 81
                      </p>

                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-0.5 bg-slate-100 rounded-full text-[10px] font-sans font-bold text-gray-600 border border-gray-200">
                        <span>Hujjat: {doc.regNumber}</span>
                        <span>•</span>
                        <span>Sana: {doc.updatedDate}</span>
                      </div>
                    </div>

                    {/* Page Title */}
                    <div className="mb-6 text-center">
                      <h1 className="text-lg sm:text-2xl font-black text-[#071a33] uppercase tracking-wide">
                        {pageData.title}
                      </h1>
                      {pageData.subtitle && (
                        <p className="text-xs sm:text-sm text-gray-600 font-sans italic mt-1 font-medium">
                          {pageData.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Page Content Sections */}
                    <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-gray-800 font-sans">
                      {pageData.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-2">
                          {sec.heading && (
                            <h3 className="text-xs sm:text-sm font-bold text-[#071a33] font-serif border-l-4 border-[#ff6b00] pl-3 py-0.5">
                              {sec.heading}
                            </h3>
                          )}
                          {sec.subheading && (
                            <h4 className="text-xs font-semibold text-gray-700">
                              {sec.subheading}
                            </h4>
                          )}
                          {sec.paragraphs?.map((p, pIdx) => (
                            <p key={pIdx} className="text-justify indent-4">
                              {p}
                            </p>
                          ))}
                          {sec.bulletPoints && (
                            <ul className="list-disc list-outside pl-6 space-y-1 text-gray-700">
                              {sec.bulletPoints.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Sheet Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200 font-sans">
                    <div className="flex flex-row items-center justify-between gap-4">
                      {pageData.signatory && (
                        <div className="text-[11px]">
                          <p className="text-gray-500 font-medium">
                            {pageData.signatory.role}:
                          </p>
                          <p className="text-xs font-bold text-[#071a33]">
                            {pageData.signatory.name}
                          </p>
                        </div>
                      )}

                      <div className="text-right text-[10px] text-gray-400">
                        Sahifa {pageData.pageNumber} / {doc.pages?.length || 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </main>
          </div>
        )}
      </div>

      {/* EXACTLY ONE FLOATING COPY LINK BUTTON IN THE BOTTOM CORNER */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full font-bold text-xs sm:text-sm shadow-2xl transition-all duration-200 cursor-pointer border ${
            copied
              ? "bg-emerald-600 text-white border-emerald-400 scale-105 shadow-emerald-500/40"
              : "bg-[#ff6b00] hover:bg-[#e05e00] text-white border-orange-400/40 shadow-orange-500/35 hover:scale-105 active:scale-95"
          }`}
          title="Ushbu hujjat havolasidan nusxa olish"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Havola nusxalandi!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Havolani nusxalash</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
