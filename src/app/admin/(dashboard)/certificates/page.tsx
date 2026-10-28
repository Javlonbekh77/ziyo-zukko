"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, X, Edit2 } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface Certificate {
  id: string;
  studentName?: string;
  name?: string;
  title: string;
  score?: string;
  subject: string;
  date: string;
  imageUrl: string;
  r2Key?: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [studentName, setStudentName] = useState("");
  const [score, setScore] = useState("A+");
  const [subject, setSubject] = useState("Matematika");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [r2Key, setR2Key] = useState("");

  const SUBJECTS = ["Matematika", "IELTS", "CEFR"];

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      if (!db) {
        console.error("Firebase db is not initialized");
        return;
      }
      const q = query(collection(db, "certificates"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedCertificates: Certificate[] = [];
      querySnapshot.forEach((doc) => {
        fetchedCertificates.push({ id: doc.id, ...doc.data() } as Certificate);
      });
      setCertificates(fetchedCertificates);
    } catch (error) {
      console.warn("Certificates ordered fetch fallback:", error);
      if (db) {
        try {
          const snapshot = await getDocs(collection(db, "certificates"));
          const fetchedCertificates: Certificate[] = [];
          snapshot.forEach((doc) => {
            fetchedCertificates.push({ id: doc.id, ...doc.data() } as Certificate);
          });
          setCertificates(fetchedCertificates);
        } catch (e) {
          console.error("Error fetching certificates: ", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(c => {
    const sName = c.studentName || c.title || "";
    const sScore = c.score || "";
    const sSubj = c.subject || "";
    const q = searchQuery.toLowerCase();
    return sName.toLowerCase().includes(q) || sScore.toLowerCase().includes(q) || sSubj.toLowerCase().includes(q);
  });

  const handleOpenEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    const existingName = cert.studentName || cert.name || (cert.title !== "Sertifikat" ? cert.title : "");
    setStudentName(existingName);
    setScore(cert.score || (cert.subject === "IELTS" ? "7.5" : cert.subject === "CEFR" ? "C1" : "A+"));
    setSubject(cert.subject || "Matematika");
    setDate(cert.date || new Date().toISOString().split("T")[0]);
    setImageUrl(cert.imageUrl);
    setR2Key(cert.r2Key || "");
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !score || !imageUrl) {
      alert("Iltimos, o'quvchi ismi, olgan darajasi va sertifikat rasmini to'liq kiriting!");
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const certData = {
        studentName: studentName.trim(),
        name: studentName.trim(),
        title: studentName.trim(),
        score: score.trim(),
        subject,
        category: subject,
        date: date || new Date().toISOString().split("T")[0],
        imageUrl,
        r2Key: r2Key || "",
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        // Tahrirlash
        const certRef = doc(db, "certificates", editingId);
        await updateDoc(certRef, certData);
        setCertificates(certificates.map(c => c.id === editingId ? { ...c, ...certData } : c));
      } else {
        // Yangi qo'shish
        const newCertData = { ...certData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "certificates"), newCertData);
        setCertificates([{ id: docRef.id, ...newCertData }, ...certificates]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cert: Certificate) => {
    if (!confirm(`"${cert.title}" sertifikatini o'chirishga ishonchingiz komilmi?`)) return;

    if (cert.r2Key || cert.imageUrl.includes("cloudflarestorage.com") || cert.imageUrl.includes("r2.dev")) {
      try {
        await deleteFileFromR2(cert.r2Key || cert.imageUrl);
      } catch (err) {
        console.error("R2 delete error:", err);
      }
    }

    try {
      if (!db) throw new Error("Firebase db not initialized");
      await deleteDoc(doc(db, "certificates", cert.id));
      setCertificates(certificates.filter((c) => c.id !== cert.id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setStudentName("");
    setScore("A+");
    setSubject("Matematika");
    setDate(new Date().toISOString().split("T")[0]);
    setImageUrl("");
    setR2Key("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sertifikatlar</h1>
          <p className="text-slate-500 text-sm mt-1">
            O'quvchilarning Matematika, IELTS va CEFR sertifikatlari
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Ism, daraja yoki yo'nalish bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium w-24">Rasm</th>
                <th className="p-4 font-medium">O'quvchi (Ism va Familiya)</th>
                <th className="p-4 font-medium">Olgan darajasi</th>
                <th className="p-4 font-medium">Yo'nalish</th>
                <th className="p-4 font-medium w-32 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="w-14 h-18 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={cert.imageUrl} alt={cert.studentName || cert.title} className="w-full h-full object-contain p-1" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {cert.studentName || cert.name || (cert.title !== "Sertifikat" ? cert.title : "O'quvchi")}
                      <div className="text-xs text-slate-400 font-normal mt-0.5">{cert.date}</div>
                    </td>
                    <td className="p-4 font-black text-lg text-[#ff6b00]">
                      {cert.score || (cert.subject === "IELTS" ? "7.5" : cert.subject === "CEFR" ? "C1" : "A+")}
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="inline-block px-3 py-1 bg-orange-50 text-[#ff6b00] rounded-full text-xs font-bold border border-orange-200">
                        {cert.subject || "Matematika"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => handleOpenEdit(cert)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cert)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Sertifikat topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-y-auto">
          <div data-lenis-prevent className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] my-auto flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingId ? "Sertifikatni tahrirlash" : "Yangi sertifikat qo'shish"}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleAddOrEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div data-lenis-prevent className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4 custom-scrollbar" style={{ maxHeight: "calc(90vh - 135px)" }}>
                <ImageUploader
                  label="Sertifikat rasmi (Cloudflare R2 storage)"
                  folder="certificates"
                  value={imageUrl}
                  aspectRatio={3 / 4}
                  onChange={(url, key) => {
                    setImageUrl(url);
                    if (key) setR2Key(key);
                  }}
                />

                {/* Student Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ism va Familiya *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-medium" 
                    placeholder="Masalan: Raxmatullayev Ramziddin" 
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Rasm tagida markazda ko'rinadi.</p>
                </div>

                {/* Score / Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Olgan darajasi / Natijasi *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-bold text-lg text-[#ff6b00]" 
                    placeholder="Masalan: A+, 8.0, 7.5, C1, A, Oltin medal" 
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Ism familiyaning pastida yirik to'q sariq rangda ko'rinadi.</p>
                </div>

                {/* Category / Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Yo'nalish / Kategoriya *
                  </label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white font-medium"
                  >
                    {SUBJECTS.map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Berilgan Sana</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                  />
                </div>
              </div>

              {/* Pinned Footer with Action Buttons - Always Visible */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/95 backdrop-blur-sm flex justify-end items-center gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }} 
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 text-white font-bold rounded-lg shadow-md transition-colors cursor-pointer ${
                    isSaving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
