"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, X, Edit2, Play, ExternalLink, Video as VideoIcon, Sparkles } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { deleteFileFromR2 } from "@/lib/r2-client";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  platform: "youtube" | "instagram";
  embedUrl: string;
  thumbnail: string;
  r2Key?: string;
  description?: string;
  section: "testimonials" | "reels" | "both";
  createdAt?: string;
  updatedAt?: string;
}

// Helper to extract YouTube ID
function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

// Helper to format Instagram embed URL
function formatInstagramEmbed(url: string): string {
  const clean = url.split("?")[0].replace(/\/embed\/?$/, "").replace(/\/$/, "");
  return `${clean}/embed/`;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "youtube" | "instagram">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<"youtube" | "instagram">("youtube");
  const [thumbnail, setThumbnail] = useState("");
  const [r2Key, setR2Key] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSection] = useState<"testimonials" | "reels" | "both">("both");
  const [publishToNews, setPublishToNews] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      if (!db) {
        console.error("Firebase db is not initialized");
        return;
      }
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedVideos: VideoItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedVideos.push({ id: doc.id, ...doc.data() } as VideoItem);
      });
      setVideos(fetchedVideos);
    } catch (error) {
      console.warn("Ordered fetch failed, trying basic collection:", error);
      if (db) {
        try {
          const snapshot = await getDocs(collection(db, "videos"));
          const fetchedVideos: VideoItem[] = [];
          snapshot.forEach((doc) => {
            fetchedVideos.push({ id: doc.id, ...doc.data() } as VideoItem);
          });
          setVideos(fetchedVideos);
        } catch (e) {
          console.error("Error fetching videos:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract Instagram shortcode
  const getInstagramShortcode = (igUrl: string): string | null => {
    const cleanUrl = igUrl.split("?")[0].replace(/\/$/, "");
    const match = cleanUrl.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
  };

  // Auto-detect platform and generate thumbnail preview when URL changes
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);

    if (newUrl.includes("youtube.com") || newUrl.includes("youtu.be")) {
      setPlatform("youtube");
      const ytId = extractYouTubeId(newUrl);
      if (ytId) {
        setThumbnail(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      }
    } else if (newUrl.includes("instagram.com")) {
      setPlatform("instagram");
      const shortcode = getInstagramShortcode(newUrl);
      if (shortcode) {
        // Auto-fetch rendered first image from Instagram
        const autoThumb = `https://image.thum.io/get/width/720/crop/850/https://www.instagram.com/p/${shortcode}/embed/`;
        setThumbnail(autoThumb);
      }
    }
  };

  const handleOpenEdit = (vid: VideoItem) => {
    setEditingId(vid.id);
    setTitle(vid.title);
    setUrl(vid.url);
    setPlatform(vid.platform);
    setThumbnail(vid.thumbnail || "");
    setR2Key(vid.r2Key || "");
    setDescription(vid.description || "");
    setSection(vid.section || "both");
    setPublishToNews(false);
    setIsModalOpen(true);
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) {
      alert("Iltimos, video sarlavhasi va havolasini kiriting!");
      return;
    }

    // Determine embed URL
    let calculatedEmbedUrl = "";
    let finalThumbnail = thumbnail;

    if (platform === "youtube") {
      const ytId = extractYouTubeId(url);
      if (!ytId) {
        alert("Noto'g'ri YouTube havolasi. Iltimos tekshirib qayta kiriting.");
        return;
      }
      calculatedEmbedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
      if (!finalThumbnail) {
        finalThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    } else {
      calculatedEmbedUrl = formatInstagramEmbed(url);
      if (!finalThumbnail) {
        const shortcode = getInstagramShortcode(url);
        if (shortcode) {
          finalThumbnail = `https://image.thum.io/get/width/720/crop/850/https://www.instagram.com/p/${shortcode}/embed/`;
        } else {
          finalThumbnail = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80";
        }
      }
    }

    setIsSaving(true);
    try {
      if (!db) throw new Error("Firebase db not initialized");

      const videoData = {
        title,
        url,
        platform,
        embedUrl: calculatedEmbedUrl,
        thumbnail: finalThumbnail,
        r2Key: r2Key || "",
        description,
        section,
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        const docRef = doc(db, "videos", editingId);
        await updateDoc(docRef, videoData);
        setVideos(videos.map((v) => (v.id === editingId ? { ...v, ...videoData } : v)));
      } else {
        const newVideoData = { ...videoData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "videos"), newVideoData);
        setVideos([{ id: docRef.id, ...newVideoData }, ...videos]);

        // Agar Yangiliklar bo'limiga ham qo'shish tanlangan bo'lsa
        if (publishToNews) {
          try {
            const newsData = {
              title,
              content: description || title,
              date: new Date().toISOString().split("T")[0],
              imageUrl: finalThumbnail,
              r2Key: r2Key || "",
              url: url,
              instagramUrl: platform === "instagram" ? url : undefined,
              embedUrl: calculatedEmbedUrl,
              social: platform === "instagram" ? "instagram" : "both",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await addDoc(collection(db, "news"), newsData);
          } catch (newsErr) {
            console.error("Error auto-publishing to news:", newsErr);
          }
        }
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving video:", error);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (vid: VideoItem) => {
    if (!confirm(`"${vid.title}" videosini o'chirishga ishonchingiz komilmi?`)) return;

    if (vid.r2Key) {
      try {
        await deleteFileFromR2(vid.r2Key);
      } catch (err) {
        console.error("R2 delete error:", err);
      }
    }

    try {
      if (!db) throw new Error("Firebase db not initialized");
      await deleteDoc(doc(db, "videos", vid.id));
      setVideos(videos.filter((v) => v.id !== vid.id));
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setPlatform("youtube");
    setThumbnail("");
    setR2Key("");
    setDescription("");
    setSection("both");
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = platformFilter === "all" || v.platform === platformFilter;

    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <VideoIcon className="w-7 h-7 text-indigo-600" />
            Videolar (YouTube & Instagram)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Saytdagi ota-onalar fikrlari (Shorts) va Instagram reels videolarini boshqarish
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-semibold text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Yangi video qo'shish
        </button>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Sarlavha yoki havola bo'yicha izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              platformFilter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Barchasi ({videos.length})
          </button>
          <button
            onClick={() => setPlatformFilter("youtube")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              platformFilter === "youtube"
                ? "bg-red-50 text-red-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            YouTube ({videos.filter((v) => v.platform === "youtube").length})
          </button>
          <button
            onClick={() => setPlatformFilter("instagram")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              platformFilter === "instagram"
                ? "bg-pink-50 text-pink-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Instagram ({videos.filter((v) => v.platform === "instagram").length})
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="font-medium">Videolar yuklanmoqda...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <VideoIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Hech qanday video topilmadi</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto mb-6">
            YouTube yoki Instagram reels havolasini qo'shish uchun yuqoridagi tugmani bosing.
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            Video qo'shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => (
            <div
              key={vid.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              {/* Thumbnail / Preview Area */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                {vid.thumbnail ? (
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <VideoIcon className="w-12 h-12" />
                  </div>
                )}

                {/* Platform Badge */}
                <div className="absolute top-3 left-3 z-10">
                  {vid.platform === "youtube" ? (
                    <span className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                      YouTube
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                      Instagram
                    </span>
                  )}
                </div>

                {/* Section Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {vid.section === "testimonials" ? "Fikrlar" : vid.section === "reels" ? "Reels" : "Asosiy"}
                  </span>
                </div>

                {/* Play Button Overlay */}
                <button
                  onClick={() => setPreviewVideo(vid)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </button>
              </div>

              {/* Info Area */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {vid.title}
                  </h3>
                  {vid.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {vid.description}
                    </p>
                  )}
                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline mt-2 break-all line-clamp-1"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {vid.url}
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-slate-400">
                  <span className="text-[11px] text-slate-400">
                    {vid.createdAt ? new Date(vid.createdAt).toLocaleDateString() : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewVideo(vid)}
                      className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                      title="Tomosha qilish"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(vid)}
                      className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vid)}
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingId ? "Videoni tahrirlash" : "Yangi video qo'shish"}
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

            {/* Form */}
            <form onSubmit={handleAddOrEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4">
                {/* Platform Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Platforma
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPlatform("youtube")}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        platform === "youtube"
                          ? "border-red-500 bg-red-50 text-red-600 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      YouTube (Video / Shorts)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform("instagram")}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        platform === "instagram"
                          ? "border-pink-500 bg-pink-50 text-pink-600 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Instagram (Reels / Post)
                    </button>
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Video havolasi (URL) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder={
                      platform === "youtube"
                        ? "https://www.youtube.com/shorts/... yoki https://youtu.be/..."
                        : "https://www.instagram.com/reel/... yoki https://www.instagram.com/p/..."
                    }
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    YouTube Shorts yoki Instagram Reels havolasini to'g'ridan-to'g'ri joylang.
                  </p>
                </div>

                {/* Video Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sarlavha (Nomi) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Ota-onalar fikri, Maktab bayrami, Olimpiada..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Izoh yoki fikr (Quote)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Video haqida qisqacha tavsif yoki ota-onaning fikri..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Section Display */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Saytning qaysi bo'limida ko'rsatilsin?
                  </label>
                  <select
                    value={section}
                    onChange={(e: any) => setSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="both">Har ikkala bo'limda (Fikrlar & Yangiliklar)</option>
                    <option value="testimonials">Faqat Ota-onalar fikri (Testimonials bo'limi)</option>
                    <option value="reels">Faqat Instagram Reels (Yangiliklar bo'limi)</option>
                  </select>
                </div>

                {/* Publish to News Toggle */}
                <div className="p-3.5 bg-gradient-to-r from-pink-50 to-indigo-50 rounded-2xl border border-pink-200/70 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      Yangiliklar bo'limiga ham qo'shilsin
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ushbu video/post avtomatik tarzda asosiy "Yangiliklar" sahifasida ham xabar sifatida chop etiladi.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={publishToNews}
                    onChange={(e) => setPublishToNews(e.target.checked)}
                    className="w-5 h-5 accent-pink-600 rounded-lg cursor-pointer shrink-0"
                  />
                </div>

                {/* Custom Thumbnail (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Muqova rasmi (Thumbnail)
                    </label>
                    {platform === "youtube" ? (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> YouTube'dan avtomatik olinadi
                      </span>
                    ) : platform === "instagram" ? (
                      <span className="text-[11px] text-pink-600 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Instagram'dan avtomatik olinadi
                      </span>
                    ) : null}
                  </div>
                  <ImageUploader
                    folder="videos"
                    value={thumbnail}
                    onChange={(imgUrl, key) => {
                      setThumbnail(imgUrl);
                      if (key) setR2Key(key);
                    }}
                    onRemove={() => {
                      setThumbnail("");
                      setR2Key("");
                    }}
                    aspectRatio={16 / 9}
                    label=""
                  />
                </div>
              </div>

              {/* Pinned Footer with Action Buttons - Always Visible */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/95 backdrop-blur-sm flex justify-end items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 flex justify-between items-center text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${
                    previewVideo.platform === "youtube" ? "bg-red-600" : "bg-pink-600"
                  }`}
                >
                  {previewVideo.platform}
                </span>
                <h3 className="font-bold text-sm md:text-base line-clamp-1">{previewVideo.title}</h3>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              <iframe
                src={previewVideo.embedUrl}
                title={previewVideo.title}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {previewVideo.description && (
              <div className="p-4 bg-slate-950 text-white/80 text-sm border-t border-white/10">
                {previewVideo.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
