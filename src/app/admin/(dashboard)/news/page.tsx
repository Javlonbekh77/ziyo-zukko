"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, X, Edit2 } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl: string;
  r2Key?: string;
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [r2Key, setR2Key] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      if (!db) {
        console.error("Firebase db is not initialized");
        return;
      }
      const q = query(collection(db, "news"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedNews: NewsItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNews.push({ id: doc.id, ...doc.data() } as NewsItem);
      });
      setNewsList(fetchedNews);
    } catch (error) {
      console.error("Error fetching news: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNews = newsList.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (news: NewsItem) => {
    setEditingId(news.id);
    setTitle(news.title);
    setContent(news.content);
    setDate(news.date);
    setImageUrl(news.imageUrl);
    setR2Key(news.r2Key || "");
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !imageUrl) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const newsData = {
        title,
        content,
        date: date || new Date().toISOString().split("T")[0],
        imageUrl,
        r2Key: r2Key || "",
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        const docRef = doc(db, "news", editingId);
        await updateDoc(docRef, newsData);
        setNewsList(newsList.map(n => n.id === editingId ? { ...n, ...newsData } : n));
      } else {
        const newNewsData = { ...newsData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "news"), newNewsData);
        setNewsList([{ id: docRef.id, ...newNewsData }, ...newsList]);
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

  const handleDelete = async (news: NewsItem) => {
    if (!confirm(`"${news.title}" yangiligini o'chirishga ishonchingiz komilmi?`)) return;

    if (news.r2Key || news.imageUrl.includes("cloudflarestorage.com") || news.imageUrl.includes("r2.dev")) {
      try {
        await deleteFileFromR2(news.r2Key || news.imageUrl);
      } catch (err) {
        console.error("R2 delete error:", err);
      }
    }

    try {
      if (!db) throw new Error("Firebase db not initialized");
      await deleteDoc(doc(db, "news", news.id));
      setNewsList(newsList.filter((n) => n.id !== news.id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setDate(new Date().toISOString().split("T")[0]);
    setImageUrl("");
    setR2Key("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yangiliklar</h1>
          <p className="text-slate-500 text-sm mt-1">Maktabdagi so'nggi xabarlar va yangiliklar</p>
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
              placeholder="Sarlavha yoki matn bo'yicha qidirish..."
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
                <th className="p-4 font-medium">Sarlavha</th>
                <th className="p-4 font-medium w-48">Sana</th>
                <th className="p-4 font-medium text-right w-32">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredNews.length > 0 ? (
                filteredNews.map((news) => (
                  <tr key={news.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="w-20 h-14 rounded bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {news.title}
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1 font-normal">{news.content}</div>
                    </td>
                    <td className="p-4 text-slate-600">{news.date}</td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => handleOpenEdit(news)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(news)}
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
                    Yangiliklar topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Yangilikni tahrirlash" : "Yangi xabar qo'shish"}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrEdit} className="p-6 overflow-y-auto flex-1 space-y-4">
              <ImageUploader
                label="Yangilik rasmi (Cloudflare R2 storage)"
                folder="news"
                value={imageUrl}
                aspectRatio={16 / 9}
                onChange={(url, key) => {
                  setImageUrl(url);
                  if (key) setR2Key(key);
                }}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sarlavha</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                  placeholder="Masalan: Maktabimizda ochiq eshiklar kuni bo'lib o'tdi" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batafsil matn</label>
                <textarea 
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none" 
                  placeholder="Yangilik haqida batafsil..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sana</label>
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
