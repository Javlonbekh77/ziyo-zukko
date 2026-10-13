"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, X, Edit2 } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface Certificate {
  id: string;
  title: string;
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
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Ingliz tili");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [r2Key, setR2Key] = useState("");

  const SUBJECTS = ["Ingliz tili", "Matematika", "Ona tili", "Tarix", "Fizika", "Kimyo", "Biologiya", "Boshqa"];

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
      const q = query(collection(db, "certificates"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedCertificates: Certificate[] = [];
      querySnapshot.forEach((doc) => {
        fetchedCertificates.push({ id: doc.id, ...doc.data() } as Certificate);
      });
      setCertificates(fetchedCertificates);
    } catch (error) {
      console.error("Error fetching certificates: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setTitle(cert.title);
    setSubject(cert.subject || "Ingliz tili");
    setDate(cert.date);
    setImageUrl(cert.imageUrl);
    setR2Key(cert.r2Key || "");
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert("Iltimos, barcha kerakli maydonlarni to'ldiring (nomi va rasm)!");
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const certData = {
        title,
        subject,
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
    setTitle("");
    setSubject("Ingliz tili");
    setDate(new Date().toISOString().split("T")[0]);
    setImageUrl("");
    setR2Key("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sertifikatlar</h1>
          <p className="text-slate-500 text-sm mt-1">Maktabning yutuqlari va sertifikatlari</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
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
              placeholder="Nomi yoki fani bo'yicha qidirish..."
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
                <th className="p-4 font-medium w-32">Rasm</th>
                <th className="p-4 font-medium">Sertifikat Nomi</th>
                <th className="p-4 font-medium">Fan / Kategoriya</th>
                <th className="p-4 font-medium w-32 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {cert.title}
                      <div className="text-xs text-slate-500 mt-1">{cert.date}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium border border-blue-100">
                        {cert.subject || "Noma'lum"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => handleOpenEdit(cert)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cert)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Sertifikat topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh] my-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Sertifikatni tahrirlash" : "Yangi sertifikat qo'shish"}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrEdit} className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
              <ImageUploader
                label="Sertifikat rasmi (Cloudflare R2 storage)"
                folder="certificates"
                value={imageUrl}
                aspectRatio={4 / 3} // Sertifikat formati uchun ko'proq to'g'ri keladi
                onChange={(url, key) => {
                  setImageUrl(url);
                  if (key) setR2Key(key);
                }}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sertifikat Nomi</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                  placeholder="Masalan: IELTS 7.5 yoki Oltin medal" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qaysi fan/kategoriya bo'yicha?</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
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

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }} 
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
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
