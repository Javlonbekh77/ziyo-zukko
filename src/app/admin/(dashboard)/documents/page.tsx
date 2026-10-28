"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  X,
  FileCode,
  Database,
  Loader2,
  Download,
  Eye,
  Check,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { SCHOOL_DOCUMENTS, SchoolDocument } from "@/data/documentsData";

const CATEGORIES = [
  { id: "all", label: "Barcha toifalar" },
  { id: "legal", label: "Litsenziya va Nizom" },
  { id: "academic", label: "O'quv dasturlari" },
  { id: "admissions", label: "Qabul va Shartnomalar" },
  { id: "rules", label: "Ichki tartib va Qoidalar" },
  { id: "safety", label: "Xavfsizlik va Ekspertiza" },
];

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Simplified Form Fields (Only 4 essential fields as requested)
  const [fileUrl, setFileUrl] = useState<string>("");
  const [format, setFormat] = useState<"PDF" | "DOC" | "DOCX">("PDF");
  const [fileSize, setFileSize] = useState<string>("1.5 MB");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<"legal" | "academic" | "admissions" | "rules" | "safety">("legal");

  // Preserve existing metadata during edit
  const [regNumber, setRegNumber] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [pagesCount, setPagesCount] = useState<number>(1);

  // Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessName, setUploadSuccessName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from Firestore (fallback to static)
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      if (!db) {
        setDocuments(SCHOOL_DOCUMENTS);
        return;
      }
      const colRef = collection(db, "documents");
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q).catch(async () => {
        return await getDocs(colRef);
      });

      if (!snap.empty) {
        const fetched: SchoolDocument[] = [];
        snap.forEach((d) => {
          fetched.push({ id: d.id, ...d.data() } as SchoolDocument);
        });
        setDocuments(fetched);
      } else {
        setDocuments(SCHOOL_DOCUMENTS);
      }
    } catch (err) {
      console.warn("Firestore fetch error, falling back to static:", err);
      setDocuments(SCHOOL_DOCUMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Restore / Seed default documents
  const handleSeedDefaults = async () => {
    if (
      !confirm(
        "Barcha standart 8 ta rasmiy maktab hujjatlarini bazaga qayta yuklamoqchimisiz?"
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      if (!db) return;
      const colRef = collection(db, "documents");
      const existing = await getDocs(colRef);
      for (const d of existing.docs) {
        await deleteDoc(doc(db, "documents", d.id));
      }

      for (const item of SCHOOL_DOCUMENTS) {
        await addDoc(colRef, {
          ...item,
          createdAt: serverTimestamp(),
        });
      }

      await fetchDocuments();
      alert("8 ta standart rasmiy hujjat muvaffaqiyatli yuklandi!");
    } catch (err: any) {
      console.error("Seeding error:", err);
      alert("Xatolik yuz berdi: " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload file (PDF / DOC / DOCX)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Fayl hajmi 50MB dan oshmasligi kerak!");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "documents");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Fayl yuklashda server xatoligi yuz berdi.");
      }

      const uploadedUrl = data.url || data.data?.url;
      setFileUrl(uploadedUrl);
      setUploadSuccessName(file.name);

      // Auto-populate format & size
      const ext = file.name.split(".").pop()?.toUpperCase();
      if (ext === "PDF") setFormat("PDF");
      else if (ext === "DOC" || ext === "DOCX") setFormat("DOCX");

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeInMB} MB`);

      // Auto-suggest title if currently empty
      if (!title) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        // Capitalize first letter of each word
        const capitalized = cleanName
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        setTitle(capitalized);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err?.message || "Faylni yuklashda xatolik yuz berdi.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Open modal for editing
  const handleOpenEdit = (d: SchoolDocument) => {
    setEditingId(d.id);
    const existingTitle =
      d.title?.uz || (typeof d.title === "string" ? d.title : "");
    const existingDesc =
      d.summary?.uz || (typeof d.summary === "string" ? d.summary : "");

    setTitle(existingTitle);
    setDescription(existingDesc);
    setCategory((d.category as any) || "legal");
    setFormat((d.format as any) || "PDF");
    setFileSize(d.fileSize || "1.5 MB");
    setFileUrl(d.fileUrl || "");
    setRegNumber(d.regNumber || "");
    setSlug(d.slug || d.id);
    setPagesCount(d.pagesCount || 1);
    setUploadSuccessName("");
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("legal");
    setFormat("PDF");
    setFileSize("1.5 MB");
    setFileUrl("");
    setRegNumber("");
    setSlug("");
    setPagesCount(1);
    setUploadSuccessName("");
    setUploadError(null);
  };

  // Save (Add or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Iltimos, hujjat nomini kiriting!");
      return;
    }

    if (!fileUrl.trim()) {
      alert("Iltimos, hujjat faylini yuklang yoki tanlang!");
      return;
    }

    setIsSaving(true);
    try {
      const generatedSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 40) + `-${Date.now().toString().slice(-4)}`;

      const currentYear = new Date().getFullYear();
      const generatedRegNumber =
        regNumber.trim() ||
        `№ ZZ-${currentYear}/${Math.floor(100 + Math.random() * 900)}`;

      const updatedDate = new Date().toISOString().split("T")[0];

      const payload: Partial<SchoolDocument> = {
        slug: generatedSlug,
        title: {
          uz: title.trim(),
          ru: title.trim(),
          en: title.trim(),
        },
        category,
        format,
        fileSize,
        regNumber: generatedRegNumber,
        updatedDate,
        pagesCount: Math.max(1, pagesCount),
        summary: {
          uz: description.trim() || `${title.trim()} rasmiy tasdiqlangan maktab hujjati.`,
          ru: description.trim() || `${title.trim()} официальный документ школы.`,
          en: description.trim() || `${title.trim()} official school document.`,
        },
        fileUrl,
        r2PublicUrl: fileUrl,
        pages: [
          {
            pageNumber: 1,
            title: title.trim(),
            sections: [
              {
                heading: `${title.trim()} (Rasmiy tasdiqlangan nusxa)`,
                paragraphs: [
                  description.trim() ||
                    "Ushbu hujjat O'zbekiston Xalqaro Islom Akademiyasi qoshidagi Ziyo-Zukko umumta'lim maktabi tomonidan tasdiqlangan rasmiy hujjat hisoblanadi.",
                ],
              },
            ],
            stampDetails: {
              organization: "«ZIYO-ZUKKO» UMUMTA'LIM MAKTABI",
              inn: "305184920",
              regCode: generatedRegNumber,
              verified: true,
            },
          },
        ],
      };

      if (!db) {
        // Fallback local memory
        if (editingId) {
          setDocuments((prev) =>
            prev.map((item) =>
              item.id === editingId ? ({ ...item, ...payload } as SchoolDocument) : item
            )
          );
        } else {
          const newDoc: SchoolDocument = {
            id: `doc-${Date.now()}`,
            ...payload,
          } as SchoolDocument;
          setDocuments((prev) => [newDoc, ...prev]);
        }
      } else {
        const colRef = collection(db, "documents");
        if (editingId) {
          const docRef = doc(db, "documents", editingId);
          await updateDoc(docRef, {
            ...payload,
            updatedAt: serverTimestamp(),
          });
        } else {
          await addDoc(colRef, {
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await fetchDocuments();
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Hujjatni saqlashda xatolik yuz berdi: " + err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete document
  const handleDelete = async (docItem: SchoolDocument) => {
    const docTitle =
      docItem.title?.uz || (typeof docItem.title === "string" ? docItem.title : "Hujjat");
    if (!confirm(`«${docTitle}» hujjatini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    try {
      if (!db) {
        setDocuments((prev) => prev.filter((d) => d.id !== docItem.id));
        return;
      }
      await deleteDoc(doc(db, "documents", docItem.id));
      await fetchDocuments();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("O'chirishda xatolik yuz berdi: " + err?.message);
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((d) => {
    const tUz = d.title?.uz || (typeof d.title === "string" ? d.title : "");
    const reg = d.regNumber || "";
    const sum =
      d.summary?.uz || (typeof d.summary === "string" ? d.summary : "");
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      tUz.toLowerCase().includes(q) ||
      reg.toLowerCase().includes(q) ||
      sum.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === "all" || d.category === categoryFilter;
    const matchesFormat =
      formatFilter === "all" ||
      d.format?.toUpperCase() === formatFilter.toUpperCase();

    return matchesSearch && matchesCategory && matchesFormat;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200/60">
            <FileText className="w-3.5 h-3.5" />
            Rasmiy Hujjatlar Ombori
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Hujjatlar Boshqaruvi
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Maktabning rasmiy litsenziyalari, nizomlari, o&apos;quv dasturlari va PDF/DOCX hujjatlarini boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleSeedDefaults}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
            title="Standart 8 ta maktab hujjatlarini qayta yuklash"
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>Standartlarni tiklash</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi hujjat qo&apos;shish</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Hujjat nomi yoki raqami bo'yicha qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Categories & Format Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 shrink-0"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 shrink-0"
          >
            <option value="all">Barcha formatlar</option>
            <option value="PDF">Faqat PDF</option>
            <option value="DOCX">Faqat DOCX / Word</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-semibold">Hujjatlar yuklanmoqda...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Hujjatlar topilmadi</h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 mb-6">
            Qidiruv so&apos;rovingizga mos hujjat topilmadi yoki baza hali bo&apos;sh.
          </p>
          <button
            onClick={handleSeedDefaults}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            Standart hujjatlarni yuklash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredDocuments.map((docItem) => {
            const docTitle =
              docItem.title?.uz ||
              (typeof docItem.title === "string" ? docItem.title : "Hujjat");
            const docSummary =
              docItem.summary?.uz ||
              (typeof docItem.summary === "string" ? docItem.summary : "");
            const isPdf = docItem.format?.toUpperCase() === "PDF";

            return (
              <div
                key={docItem.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Format & Size Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                        isPdf
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-blue-50 text-blue-600 border-blue-200"
                      }`}
                    >
                      {docItem.format || "PDF"}
                    </span>

                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {docItem.fileSize || "1.5 MB"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug">
                    {docTitle}
                  </h3>

                  {/* Description preview */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {docSummary || "Tavsif kiritilmagan."}
                  </p>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* View in site */}
                    <Link
                      href={`/documents?doc=${docItem.slug || docItem.id}&page=1`}
                      target="_blank"
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Saytda ko'rish"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Download */}
                    {docItem.fileUrl && (
                      <a
                        href={docItem.fileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                        title="Faylni yuklab olish"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(docItem)}
                      className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(docItem)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUPER SIMPLE ADD / EDIT DOCUMENT MODAL */}
      {isModalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center overflow-y-auto"
        >
          <div
            data-lenis-prevent
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] my-auto flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Pinned Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingId ? "Hujjatni tahrirlash" : "Hujjat qo'shish"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Simple Form Body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div
                data-lenis-prevent
                className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4 custom-scrollbar"
                style={{ maxHeight: "calc(92vh - 130px)" }}
              >
                {/* 1. Hujjat Faylini Yuklash (PDF yoki DOCX) */}
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                        Hujjat Fayli (PDF yoki DOCX) *
                      </label>
                      <p className="text-xs text-slate-500">
                        Faylni tanlang yoki shu yerga tashlang
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="doc-file-upload-input"
                      disabled={isUploading}
                    />

                    <label
                      htmlFor="doc-file-upload-input"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs shrink-0 flex items-center gap-1.5"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Yuklanmoqda...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{fileUrl ? "Faylni almashtirish" : "Fayl tanlash"}</span>
                        </>
                      )}
                    </label>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-rose-600 mt-2 font-medium">{uploadError}</p>
                  )}

                  {fileUrl && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold truncate">
                          {uploadSuccessName || "Fayl biriktirildi"} ({format}, {fileSize})
                        </span>
                      </div>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-bold text-[11px] shrink-0 ml-2"
                      >
                        Ko&apos;rish
                      </a>
                    </div>
                  )}
                </div>

                {/* 2. Hujjat Nomi (Title) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Hujjat nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Maktab Nizomi yoki 2026-yilgi O'quv Rejasi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 3. Qisqacha Tavsif (Description) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Qisqacha tavsif (Description)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Hujjat haqida qisqacha ma'lumot..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* 4. Toifasi (Category) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Toifasi (Kategoriya)
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="legal">Litsenziya va Nizom</option>
                    <option value="academic">O&apos;quv dasturlari</option>
                    <option value="admissions">Qabul va Shartnomalar</option>
                    <option value="rules">Ichki tartib va Qoidalar</option>
                    <option value="safety">Xavfsizlik va Ekspertiza</option>
                  </select>
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex justify-end items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isSaving
                      ? "Saqlanmoqda..."
                      : editingId
                      ? "Yangilash"
                      : "Saqlash"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
