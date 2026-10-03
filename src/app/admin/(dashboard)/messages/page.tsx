"use client";

import { useState } from "react";
import { Mail, Search, Trash2, Calendar, Phone, User } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  date: string;
  isRead: boolean;
}

const MOCK_DATA: ContactMessage[] = [
  {
    id: "1",
    name: "Rustamjon",
    phone: "+998 90 123 45 67",
    message: "Assalomu alaykum. Maktabga qabul qachon boshlanadi? Farzandim 5-sinfga o'tmoqda, shartlar qanday?",
    date: "2023-09-28 14:30",
    isRead: false,
  },
  {
    id: "2",
    name: "Madina",
    phone: "+998 93 987 65 43",
    message: "Ingliz tili to'garaklari narxi va vaqti haqida ma'lumot bersangiz.",
    date: "2023-09-27 09:15",
    isRead: true,
  },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  const markAsRead = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Xabarlar</h1>
          <p className="text-slate-500 text-sm mt-1">Saytdan kelgan murojaatlar va savollar</p>
        </div>
        <div className="flex bg-blue-50 text-blue-700 px-4 py-2 rounded-lg items-center gap-2 font-medium text-sm">
          <Mail className="w-4 h-4" />
          <span>{messages.filter(m => !m.isRead).length} ta yangi xabar</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Ism, telefon raqam yoki xabar bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-6 transition-colors hover:bg-slate-50 ${!msg.isRead ? 'bg-blue-50/30' : ''}`}
                onClick={() => markAsRead(msg.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {!msg.isRead && (
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                      )}
                      <h3 className={`text-lg font-medium ${!msg.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {msg.name}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${msg.phone}`} className="hover:text-blue-600 hover:underline">{msg.phone}</a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{msg.date}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 mt-2">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0" title="O'chirish">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
              <Mail className="w-12 h-12 text-slate-300 mb-3" />
              <p>Xabarlar topilmadi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
