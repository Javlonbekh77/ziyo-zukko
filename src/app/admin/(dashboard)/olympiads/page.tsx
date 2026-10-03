"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";

interface OlympiadWinner {
  id: string;
  name: string;
  subject: string;
  result: string;
  imageUrl: string;
}

const MOCK_DATA: OlympiadWinner[] = [
  {
    id: "1",
    name: "Toshmatov Eshmat",
    subject: "Fizika",
    result: "Respublika bosqichi 1-o'rin",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    id: "2",
    name: "Olimova Dildora",
    subject: "Ingliz tili",
    result: "Xalqaro olimpiada oltin medali",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
  },
];

export default function OlympiadsPage() {
  const [winners, setWinners] = useState<OlympiadWinner[]>(MOCK_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWinners = winners.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olimpiadachilar</h1>
          <p className="text-slate-500 text-sm mt-1">Olimpiada g'oliblari va qatnashchilari</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
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
              placeholder="Ism yoki Fan bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium w-24">Rasm</th>
                <th className="p-4 font-medium">O'quvchi</th>
                <th className="p-4 font-medium">Fan</th>
                <th className="p-4 font-medium">Natija</th>
                <th className="p-4 font-medium text-right w-32">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredWinners.length > 0 ? (
                filteredWinners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 relative bg-slate-100">
                        <img src={winner.imageUrl} alt={winner.name} className="object-cover w-full h-full" />
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{winner.name}</td>
                    <td className="p-4 text-slate-600">{winner.subject}</td>
                    <td className="p-4 text-slate-600">
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                        {winner.result}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Ma'lumot topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Olimpiadachi qo'shish</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">O'quvchi rasmi</label>
                  <div className="mt-1 relative rounded-lg overflow-hidden border border-slate-200 group">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=300" 
                      alt="Sample preview" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <div className="text-center text-white">
                        <Plus className="mx-auto h-8 w-8 mb-1" />
                        <span className="text-sm font-medium">Rasmni o'zgartirish</span>
                      </div>
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ism va Familiya</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Masalan: Toshmatov Eshmat" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fan</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Masalan: Matematika" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Natija (O'rin)</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Masalan: Viloyat bosqichi 1-o'rin" />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
                Bekor qilish
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors">
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
