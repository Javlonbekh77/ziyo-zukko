"use client";

import { useState, useEffect } from "react";
import { Mail, Search, Trash2, Calendar, Phone, CheckCircle2, User, MapPin, GraduationCap } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, updateDoc, deleteDoc, doc } from "firebase/firestore";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  grade?: string;
  region?: string;
  message: string;
  createdAt?: string;
  date?: string;
  isRead: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    let unsub: (() => void) | undefined;
    try {
      const colRef = collection(db, "messages");
      const q = query(colRef, orderBy("createdAt", "desc"));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const fetched: ContactMessage[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          } as ContactMessage));
          setMessages(fetched);
          setIsLoading(false);
        },
        (error) => {
          console.warn("Messages ordered query fallback:", error);
          const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
            const fetched: ContactMessage[] = simpleSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            } as ContactMessage));
            setMessages(fetched);
            setIsLoading(false);
          });
          unsub = simpleUnsub;
        }
      );
    } catch (e) {
      console.error("Error setting up messages listener:", e);
      setIsLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const filteredMessages = messages.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.message && m.message.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q)) ||
      (m.grade && m.grade.toLowerCase().includes(q)) ||
      (m.region && m.region.toLowerCase().includes(q))
    );
  });

  const toggleReadStatus = async (msg: ContactMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (!db) return;
      const docRef = doc(db, "messages", msg.id);
      await updateDoc(docRef, { isRead: !msg.isRead });
    } catch (err) {
      console.error("Error updating message status:", err);
    }
  };

  const handleDelete = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`"${msg.name}" tomonidan yuborilgan xabarni o'chirishni xohlaysizmi?`)) return;
    try {
      if (!db) return;
      await deleteDoc(doc(db, "messages", msg.id));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-600" />
            Kelib tushgan xabarlar
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sayt orqali ota-onalar va foydalanuvchilar qoldirgan ariza hamda murojaatlar
          </p>
        </div>
        <div className="flex bg-blue-50 text-blue-700 px-4 py-2 rounded-xl items-center gap-2 font-bold text-sm border border-blue-100 shadow-sm">
          <Mail className="w-4 h-4" />
          <span>{unreadCount} ta o'qilmagan xabar</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Ism, telefon, sinf yoki xabar bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Jami: {messages.length} ta murojaat
          </span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="font-medium text-sm">Xabarlar yuklanmoqda...</p>
            </div>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => {
              const formattedDate = msg.createdAt 
                ? new Date(msg.createdAt).toLocaleString("uz-UZ", { dateStyle: "medium", timeStyle: "short" }) 
                : (msg.date || "Yangi");

              return (
                <div 
                  key={msg.id} 
                  className={`p-6 transition-all hover:bg-slate-50 ${!msg.isRead ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        {!msg.isRead ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-sm">
                            Yangi
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                            O'qilgan
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          {msg.name}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg font-semibold text-slate-800">
                          <Phone className="w-4 h-4 text-[#ff6b00]" />
                          <a href={`tel:${msg.phone}`} className="hover:text-blue-600 hover:underline">{msg.phone}</a>
                        </div>
                        {msg.grade && (
                          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
                            <GraduationCap className="w-4 h-4" />
                            <span>{msg.grade}</span>
                          </div>
                        )}
                        {msg.region && (
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">
                            <MapPin className="w-4 h-4" />
                            <span>{msg.region}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
                          <Calendar className="w-4 h-4" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-800 mt-2">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => toggleReadStatus(msg, e)}
                        className={`p-2 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                          msg.isRead 
                            ? 'text-slate-500 hover:bg-slate-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        }`}
                        title={msg.isRead ? "O'qilmagan qilish" : "O'qildi deb belgilash"}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{msg.isRead ? "O'qilmagan" : "O'qildi"}</span>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(msg, e)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center flex flex-col items-center justify-center text-slate-500">
              <Mail className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">Hozircha xabarlar yo'q</p>
              <p className="text-xs text-slate-400 mt-1">Foydalanuvchilar sayt orqali yozgan arizalari bu yerda darhol aks etadi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
