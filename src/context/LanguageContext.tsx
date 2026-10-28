"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "uz" | "ru" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // ── Navigation ──
  home: { uz: "Bosh sahifa", ru: "Главная", en: "Home" },
  about: { uz: "Maktab haqida", ru: "О школе", en: "About Us" },
  teachers: { uz: "Ustozlar", ru: "Учителя", en: "Teachers" },
  news: { uz: "Yangiliklar", ru: "Новости", en: "News" },
  testimonials: { uz: "Ota-onalar fikri", ru: "Отзывы", en: "Testimonials" },
  olympiads: { uz: "Yutuqlar", ru: "Достижения", en: "Achievements" },
  gallery: { uz: "Galereya", ru: "Галерея", en: "Gallery" },
  graduates: { uz: "Bitiruvchilar", ru: "Выпускники", en: "Graduates" },
  certificates: { uz: "Sertifikatlar", ru: "Сертификаты", en: "Certificates" },
  contact: { uz: "Aloqa", ru: "Контакты", en: "Contact" },
  documents: { uz: "Hujjatlar", ru: "Документы", en: "Documents" },
  admissions: { uz: "Qabul", ru: "Приём", en: "Admissions" },
  apply: { uz: "Qabulga ariza", ru: "Подать заявку", en: "Apply Now" },

  // ── Common & Buttons ──
  seeAll: { uz: "Barchasini ko'rish →", ru: "Смотреть все →", en: "See All →" },
  backToHome: { uz: "← Asosiy sahifaga qaytish", ru: "← Вернуться на главную", en: "← Back to Home" },
  backToNews: { uz: "← Barcha yangiliklarga qaytish", ru: "← Вернуться к новостям", en: "← Back to News" },
  backToDocuments: { uz: "← Barcha hujjatlarga qaytish", ru: "← Вернуться к документам", en: "← Back to Documents" },
  backToStudents: { uz: "← Barcha bitiruvchilarga qaytish", ru: "← Вернуться к выпускникам", en: "← Back to Graduates" },
  backToOlympiads: { uz: "← Barcha yutuqlarga qaytish", ru: "← Вернуться к достижениям", en: "← Back to Achievements" },
  readMore: { uz: "Batafsil o'qish", ru: "Читать далее", en: "Read More" },
  allCertificates: { uz: "Barcha sertifikatlarni ko'rish →", ru: "Смотреть все сертификаты →", en: "View all certificates →" },
  loading: { uz: "Yuklanmoqda...", ru: "Загрузка...", en: "Loading..." },

  // ── Categories & Badges ──
  all: { uz: "Barchasi", ru: "Все", en: "All" },
  grant: { uz: "Grant", ru: "Грант", en: "Grant" },
  contract: { uz: "Kontrakt", ru: "Контракт", en: "Contract" },
  leadership: { uz: "Rahbariyat", ru: "Руководство", en: "Leadership" },
  primary: { uz: "Boshlang'ich", ru: "Начальные классы", en: "Primary School" },
  exact: { uz: "Aniq fanlar", ru: "Точные науки", en: "Exact Sciences" },
  languages: { uz: "Chet tillari", ru: "Иностранные языки", en: "Foreign Languages" },
  it: { uz: "IT & AI", ru: "IT & ИИ", en: "IT & AI" },

  // ── About Section ──
  aboutBadge: { uz: "Biz haqimizda", ru: "О нас", en: "About Us" },
  aboutTitle1: { uz: "Kelajak uchun", ru: "Инвестиция в", en: "Investment in" },
  aboutTitle2: { uz: "sarmoya", ru: "будущее", en: "the future" },
  aboutQuote: {
    uz: "\"Yangi O'zbekistonning asosiy ustuni – bilim, ta'lim va tarbiya bo'ladi!\"",
    ru: "\"Главной опорой Нового Узбекистана станут знания, образование и воспитание!\"",
    en: "\"The main pillar of New Uzbekistan will be knowledge, education, and character!\"",
  },
  presidentName: { uz: "Shavkat Mirziyoyev", ru: "Шавкат Мирзиёев", en: "Shavkat Mirziyoyev" },
  presidentTitle: {
    uz: "O'zbekiston Respublikasi Prezidenti",
    ru: "Президент Республики Узбекистан",
    en: "President of the Republic of Uzbekistan",
  },
  campusTitle: { uz: "ZIYO-ZUKKO kampusi", ru: "Кампус ZIYO-ZUKKO", en: "ZIYO-ZUKKO Campus" },

  // ── News Section ──
  newsTitleMain: { uz: "Maktab yangilik", ru: "Новости ", en: "School " },
  newsTitleAccent: { uz: "lari", ru: "школы", en: "News" },
  newsSubTitle: { uz: "Maktab Yangiliklari & ", ru: "Новости школы и ", en: "School News & " },
  newsSubTitleAccent: { uz: "Tadbirlar", ru: "Мероприятия", en: "Events" },
  instagramTitle: { uz: "Ziyo-Zukko ", ru: "Ziyo-Zukko в ", en: "Ziyo-Zukko on " },
  reelsControlHint: {
    uz: "Boshqarish uchun o'ngdagi tugmalarni bosing",
    ru: "Для навигации нажимайте кнопки справа",
    en: "Use buttons on the right to navigate",
  },

  // ── Testimonials Section ──
  testimonialsBadge: { uz: "ISHONCH", ru: "ДОВЕРИЕ", en: "TRUST" },
  testimonialsTitle: { uz: "OTA-ONALAR NIMA DEYDI?", ru: "ЧТО ГОВОРЯТ РОДИТЕЛИ?", en: "WHAT DO PARENTS SAY?" },
  testimonialsCardTitle: { uz: "Ota-onalar fikri", ru: "Отзывы родителей", en: "Parent Testimonials" },

  // ── Team Section ──
  teamBadge: { uz: "RAHBARIYAT VA PEDAGOGLAR", ru: "РУКОВОДСТВО И ПЕДАГОГИ", en: "LEADERSHIP & EDUCATORS" },
  teamTitle: { uz: "BIZNING JAMOA", ru: "НАША КОМАНДА", en: "OUR TEAM" },

  // ── Universities / Graduates Section ──
  graduatesBadge: { uz: "BIZNING BITIRUVCHILAR", ru: "НАШИ ВЫПУСКНИКИ", en: "OUR GRADUATES" },
  graduatesTitle1: { uz: "ULAR ALLAQACHON", ru: "ОНИ УЖЕ УЧАТСЯ В", en: "THEY ARE ALREADY AT" },
  graduatesTitle2: { uz: "NUFUZLI TA'LIM MUASSASALARIDA", ru: "ВЕДУЩИХ УЧЕБНЫХ ЗАВЕДЕНИЯХ", en: "PRESTIGIOUS INSTITUTIONS" },

  // ── Results & Certificates Section ──
  resultsTitle: { uz: "Natijalar o'zlari gapiradi", ru: "Результаты говорят сами за себя", en: "Results speak for themselves" },
  resultsSubtitle: {
    uz: "ZIYO-ZUKKO o'quvchilarining sertifikat, DTM va universitet natijalari",
    ru: "Сертификаты, баллы DTM и поступления в университеты учащихся ZIYO-ZUKKO",
    en: "Certificates, DTM scores, and university admissions of ZIYO-ZUKKO students",
  },
  stat1Title: { uz: "Sertifikat olgan o'quvchilar", ru: "Учащиеся с сертификатами", en: "Certified Students" },
  stat1Subtitle: { uz: "IELTS, SAT va fan sertifikatlari", ru: "Сертификаты IELTS, SAT и предметные", en: "IELTS, SAT and academic certificates" },
  stat2Title: { uz: "DTM o'rtacha bali", ru: "Средний балл DTM", en: "Average DTM Score" },
  stat2Subtitle: { uz: "Kirish imtihonlari uchun kuchli tayyorgarlik", ru: "Высокая подготовка к вступительным экзаменам", en: "Strong preparation for entrance examinations" },
  stat3Title: { uz: "Bitiruvchilar natijasi", ru: "Успешность выпускников", en: "Graduate Success Rate" },
  stat3Subtitle: { uz: "Tanlagan yo'nalishiga muvaffaqiyatli o'tdi", ru: "Успешно поступили по выбранному направлению", en: "Successfully enrolled in their desired majors" },

  // ── Olympiads Section ──
  olympiadsBadge: { uz: "FAXRIMIZ VA G'ALABALAR", ru: "НАША ГОРДОСТЬ И ПОБЕДЫ", en: "OUR PRIDE & VICTORIES" },
  olympiadsTitle: { uz: "Olimpiadachilarimiz va Yutuqlarimiz", ru: "Наши Олимпиадники и Достижения", en: "Our Olympiad Winners & Achievements" },
  olympiadsSubtitle: {
    uz: "O'quvchilarimiz xalqaro va respublika fan olimpiadalarida, nufuzli tanlovlarda faxrli o'rinlarni egallab kelmoqda.",
    ru: "Наши ученики регулярно занимают призовые места на престижных международных и республиканских олимпиадах.",
    en: "Our students consistently earn top honors at prestigious international and national subject Olympiads.",
  },

  // ── Gallery Section ──
  galleryBadge: { uz: "FOTO GALEREYA", ru: "ФОТОГАЛЕРЕЯ", en: "PHOTO GALLERY" },
  galleryTitle: { uz: "ZIYO-ZUKKO hayotidan lavhalar", ru: "Моменты из школьной жизни ZIYO-ZUKKO", en: "Highlights of ZIYO-ZUKKO Life" },

  // ── Admissions Section ──
  admissionsBadge: { uz: "QABUL 2026–2027", ru: "ПРИЁМ 2026–2027", en: "ADMISSIONS 2026–2027" },
  admissionsTitle1: { uz: "FARZANDINGIZNI", ru: "ПОДГОТОВЬТЕ ВАШЕГО РЕБЁНКА", en: "PREPARE YOUR CHILD" },
  admissionsTitle2: { uz: "KELAJAK UCHUN HOZIRDAN TAYYORLANG", ru: "К УСПЕШНОМУ БУДУЩЕМУ СЕГОДНЯ", en: "FOR THE FUTURE STARTING TODAY" },
  admissionsSubtitle: {
    uz: "Imtihon asosida saralangan bolalar qatorida farzandingiz tahsil oladi.",
    ru: "Ваш ребёнок будет обучаться среди одарённых детей, прошедших конкурсный отбор.",
    en: "Your child will learn alongside talented peers selected through examination.",
  },
  processHeader: { uz: "QABUL JARAYONI", ru: "ПРОЦЕСС ПРИЁМА", en: "ADMISSION PROCESS" },
  step1Title: { uz: "Imtihon", ru: "Экзамен", en: "Examination" },
  step1Desc: { uz: "Matematika, ingliz tili, tanqidiy fikrlash — 2 soat", ru: "Математика, английский язык, логика — 2 часа", en: "Mathematics, English, critical thinking — 2 hours" },
  step2Title: { uz: "Suhbat", ru: "Собеседование", en: "Interview" },
  step2Desc: { uz: "Bola va ota-onalari bilan suhbat", ru: "Индивидуальное собеседование с ребёнком и родителями", en: "Interview with child and parents" },
  step3Title: { uz: "Natija va qabul", ru: "Результаты и зачисление", en: "Results & Enrollment" },
  step3Desc: { uz: "Natijaga ko'ra qabul qilinadi", ru: "Зачисление на основе результатов отбора", en: "Admission based on qualification results" },
  admissionsExamTitle: { uz: "IMTIHON SANALARI", ru: "ДАТЫ ЭКЗАМЕНОВ", en: "EXAM DATES" },
  admissionsExamText: { uz: "Har haftaning shanba kunlari saralash imtihonlari bo'lib o'tadi.", ru: "Каждую субботу проводятся вступительные отборочные экзамены.", en: "Entrance examinations are held every Saturday." },
  admissionsRegisterBtn: { uz: "Ro'yxatdan o'tish", ru: "Зарегистрироваться", en: "Register Now" },
  admissionsFormTitle: { uz: "Qabulga onlayn ariza topshirish", ru: "Онлайн-заявка на приём", en: "Online Admission Application" },
  admissionsFormSubtitle: {
    uz: "Farzandingizni «Ziyo-Zukko» maktabiga qabul qilish uchun quyidagi arizani to'ldiring. Operatorlarimiz 24 soat ichida siz bilan bog'lanishadi.",
    ru: "Заполните форму для поступления в школу «Ziyo-Zukko». Наши операторы свяжутся с вами в течение 24 часов.",
    en: "Fill out the form for admission to «Ziyo-Zukko» School. Our team will contact you within 24 hours.",
  },
  admissionsFormBtn: { uz: "Qabulga ariza yuborish", ru: "Отправить заявку на приём", en: "Submit Admission Application" },
  admissionsSuccessMsg: {
    uz: "Arizangiz muvaffaqiyatli qabul qilindi! Qabul komissiyasi operatorlarimiz tez orada siz bilan bog'lanishadi.",
    ru: "Ваша заявка успешно принята! Операторы приёмной комиссии свяжутся с вами в ближайшее время.",
    en: "Your application has been received successfully! Our admissions operators will contact you shortly.",
  },

  // ── FAQ Section ──
  faqBadge: { uz: "FAQ", ru: "FAQ", en: "FAQ" },
  faqTitle: { uz: "KO'P BERILADIGAN SAVOLLAR", ru: "ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ", en: "FREQUENTLY ASKED QUESTIONS" },

  // ── Contact Section ──
  contactHeading: {
    uz: "Maslahat olish uchun raqamingizni qoldiring",
    ru: "Оставьте свой номер для получения консультации",
    en: "Leave your phone number for consultation",
  },
  contactSubheading: {
    uz: "Biz siz bilan 24 soat ichida bog'lanamiz.",
    ru: "Мы свяжемся с вами в течение 24 часов.",
    en: "We will contact you within 24 hours.",
  },
  addressLabel: { uz: "Manzil", ru: "Адрес", en: "Address" },
  addressValue: {
    uz: "Abdulla Qodiriy ko'chasi, 11, Shayxontohur tumani, Toshkent",
    ru: "Абдулла Кадыри, 11, Шайхантахурский район, Ташкент",
    en: "11 Abdulla Qodiriy St, Shaykhontokhur district, Tashkent",
  },
  phoneLabel: { uz: "Telefon", ru: "Телефон", en: "Phone" },
  workHoursLabel: { uz: "Ish vaqti", ru: "Режим работы", en: "Working Hours" },
  workHoursValue: {
    uz: "Dushanba–Shanba · 9:00–18:00",
    ru: "Понедельник–Суббота · 9:00–18:00",
    en: "Monday–Saturday · 9:00–18:00",
  },
  contactFormTitle: { uz: "Bog'lanish", ru: "Связаться с нами", en: "Get in Touch" },
  namePlaceholder: { uz: "Ismingiz", ru: "Ваше имя", en: "Your name" },
  phonePlaceholder: { uz: "+998 90 123 45 67", ru: "+998 90 123 45 67", en: "+998 90 123 45 67" },
  gradeSelectDefault: { uz: "Sinfni tanlang", ru: "Выберите класс", en: "Select grade" },
  regionSelectDefault: { uz: "Hududni tanlang", ru: "Выберите регион", en: "Select region" },
  messagePlaceholder: { uz: "Qo'shimcha izoh yoki savolingiz (ixtiyoriy)", ru: "Дополнительный комментарий или вопрос (необязательно)", en: "Additional comment or question (optional)" },
  sendBtn: { uz: "Ariza yuborish", ru: "Отправить заявку", en: "Submit Application" },
  sendingBtn: { uz: "Yuborilmoqda...", ru: "Отправка...", en: "Sending..." },

  // ── Footer ──
  footerSlogan: {
    uz: "Kelajak shu yerdan qanot qoqadi. Ilm-fan, texnologiya va tarbiya uyg'unlashgan maskan.",
    ru: "Будущее берёт начало здесь. Гармония фундаментальных знаний, технологий и воспитания.",
    en: "The future takes flight from here. Where science, technology, and character unite.",
  },
  footerLinksTitle: { uz: "Havolalar", ru: "Навигация", en: "Quick Links" },
  footerContactTitle: { uz: "Aloqa", ru: "Контакты", en: "Contact" },
  footerAskQuestion: { uz: "Savol yoki taklif qoldirish", ru: "Задать вопрос или предложение", en: "Submit a question or inquiry" },
  footerCopyright: { uz: "Barcha huquqlar himoyalangan.", ru: "Все права защищены.", en: "All rights reserved." },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "uz",
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved && ["uz", "ru", "en"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("app_lang", newLang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
