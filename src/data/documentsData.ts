export interface DocumentSection {
  heading?: string;
  subheading?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface DocumentPage {
  pageNumber: number;
  title: string;
  subtitle?: string;
  sections: DocumentSection[];
  signatory?: {
    role: string;
    name: string;
    date: string;
  };
  stampDetails?: {
    organization: string;
    inn: string;
    regCode: string;
    verified: boolean;
  };
}

export interface SchoolDocument {
  id: string;
  slug: string;
  title: {
    uz: string;
    ru: string;
    en: string;
  };
  category: "legal" | "academic" | "admissions" | "rules" | "safety";
  format: "PDF" | "DOC" | "DOCX";
  fileSize: string;
  updatedDate: string;
  regNumber: string;
  pagesCount: number;
  summary: {
    uz: string;
    ru: string;
    en: string;
  };
  fileUrl: string;
  r2PublicUrl?: string;
  pages: DocumentPage[];
}

export const SCHOOL_DOCUMENTS: SchoolDocument[] = [
  {
    id: "litsenziya-davlat-akkreditatsiyasi",
    slug: "litsenziya",
    title: {
      uz: "Litsenziya va Davlat Akkreditatsiyasi Guvohnomasi",
      ru: "Государственная лицензия и свидетельство об аккредитации",
      en: "State Educational License & Accreditation Certificate",
    },
    category: "legal",
    format: "PDF",
    fileSize: "1.4 MB",
    updatedDate: "2024-08-15",
    regNumber: "№ NAS UZ 001.MO.042891",
    pagesCount: 2,
    summary: {
      uz: "O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi tomonidan taqdim etilgan nodavlat umumta'lim faoliyatini yuritish huquqini beruvchi muddatsiz rasmiy davlat litsenziyasi.",
      ru: "Бессрочная государственная лицензия Министерства дошкольного и школьного образования Республики Узбекистан на право ведения негосударственной образовательной деятельности.",
      en: "Official perpetual state educational license issued by the Ministry of Preschool and School Education of the Republic of Uzbekistan for non-state general educational services.",
    },
    fileUrl: "/documents/litsenziya-davlat-akkreditatsiyasi.pdf",
    r2PublicUrl: "https://pub-69ff7ae8204e40d696438bd71f06a2b6.r2.dev/documents/litsenziya-davlat-akkreditatsiyasi.pdf",
    pages: [
      {
        pageNumber: 1,
        title: "DAVLAT LITSENZIYASI",
        subtitle: "O'zbekiston Respublikasi Maktabgacha va maktab ta'limi vazirligi",
        sections: [
          {
            heading: "№ 042891-sonli Litsenziya blankasi",
            paragraphs: [
              "Ushbu Litsenziya «ZIYO-ZUKKO» nodavlat ta'lim muassasasiga O'zbekiston Respublikasining «Ta'lim to'g'risida»gi hamda «Litsenziyalash, ruxsat berish va xabardor qilish tartib-taomillari to'g'risida»gi Qonunlariga muvofiq berildi.",
              "Yuridik shaxsning to'liq nomi: O'zbekiston Xalqaro Islom Akademiyasi qoshidagi «ZIYO-ZUKKO» nodavlat umumta'lim muassasasi.",
              "Yuridik manzili: Toshkent shahri, Olmazor tumani, Zarqaynar 18-berk ko'cha, 47-uy. STIR (INN): 304218942.",
            ],
          },
          {
            heading: "Litsenziyalanayotgan faoliyat turi",
            paragraphs: [
              "Umumiy o'rta ta'lim dasturlari bo'yicha nodavlat ta'lim xizmatlarini ko'rsatish (boshlang'ich ta'lim: 1–4-sinflar; tayanch o'rta ta'lim: 5–9-sinflar; umumiy o'rta ta'lim: 10–11-sinflar).",
              "Faoliyat hududi: O'zbekiston Respublikasi hududida cheklanmagan muddat bilan amal qiladi.",
            ],
          },
          {
            heading: "Davlat ro'yxatidan o'tkazilganlik ma'lumotlari",
            paragraphs: [
              "Yagona davlat interaktiv xizmatlari portali (my.gov.uz) va Ta'lim sifatini nazorat qilish davlat inspeksiyasi reestrida № REESTR-2016-894 raqami bilan qayd etilgan.",
            ],
          },
        ],
        signatory: {
          role: "Maktabgacha va maktab ta'limi vaziri o'rinbosari",
          name: "U. X. Begimqulov",
          date: "15.08.2024",
        },
        stampDetails: {
          organization: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI",
          inn: "201122919",
          regCode: "LIC-UZ-2024-042891",
          verified: true,
        },
      },
      {
        pageNumber: 2,
        title: "LITSENZIYA ILOVASI № 1",
        subtitle: "Litsenziya talablari va shartlariga muvofiqlik bayonnomasi",
        sections: [
          {
            heading: "Pedagogik tarkib va o'quv dasturi talablari",
            bulletPoints: [
              "Pedagog xodimlarning kamida 85 foizi oliy toifali yoki ilmiy darajaga ega mutaxassislardan iborat bo'lishi.",
              "Xorijiy tillar (Ingliz, Arab) kafedrasi o'qituvchilarida xalqaro sertifikatlar (IELTS 7.5+, CEFR C1, TESOL) mavjudligi.",
              "O'quv jarayonida zamonaviy AKT, interaktiv doskalar va STEAM laboratoriya uskunalaridan to'liq foydalanish.",
            ],
          },
          {
            heading: "Kampus infratuzilmasi va moddiy-texnik baza",
            table: {
              headers: ["Infratuzilma obyekti", "Parametrlari", "Muvofiqlik holati"],
              rows: [
                ["O'quv binosi", "Zamonaviy 4 qavatli ixtisoslashtirilgan korpus", "To'liq muvofiq"],
                ["Anjumanlar zali", "460 o'rinli akustik ovoz tizimi bilan jihozlangan", "To'liq muvofiq"],
                ["Oshxona va oshxona zali", "Parhezshunos nazoratidagi 3 mahal issiq ovqat", "SanPiN 0289-10 talablariga mos"],
                ["Sport maydonchasi", "Yopiq sport zali va sun'iy qoplamali stadion", "Xavfsizlik talablariga mos"],
              ],
            },
          },
        ],
        signatory: {
          role: "Bosh inspektor — Akkreditatsiya bo'limi boshlig'i",
          name: "N. T. Qobilov",
          date: "15.08.2024",
        },
        stampDetails: {
          organization: "TA'LIM SIFATINI NAZORAT QILISH DAVLAT INSPEKSIYASI",
          inn: "305118742",
          regCode: "APP-LIC-001-B",
          verified: true,
        },
      },
    ],
  },
  {
    id: "maktab-nizomi",
    slug: "nizom",
    title: {
      uz: "«Ziyo-Zukko» Maktabi Nizomi (Ustav)",
      ru: "Устав негосударственной школы «Ziyo-Zukko»",
      en: "Charter of «Ziyo-Zukko» Non-State School",
    },
    category: "legal",
    format: "PDF",
    fileSize: "2.8 MB",
    updatedDate: "2024-09-01",
    regNumber: "№ NZ-2024/01",
    pagesCount: 4,
    summary: {
      uz: "Muassasaning yuridik maqomi, boshqaruv organlari, ta'lim-tarbiya prinsiplari, pedagoglar hamda ota-onalarning o'zaro huquq va burchlarini tartibga soluvchi asosiy ta'sis hujjati.",
      ru: "Основной учредительный документ, регулирующий правовой статус, органы управления, принципы воспитания и взаимные права и обязанности педагогов и родителей.",
      en: "The primary foundational governance document defining the legal framework, academic policies, and rights and duties of educators, parents, and students.",
    },
    fileUrl: "/documents/maktab-nizomi.pdf",
    r2PublicUrl: "https://pub-69ff7ae8204e40d696438bd71f06a2b6.r2.dev/documents/maktab-nizomi.pdf",
    pages: [
      {
        pageNumber: 1,
        title: "1-BOB. UMUMIY QOIDALAR",
        subtitle: "Muassasaning yuridik maqomi va faoliyat maqsadi",
        sections: [
          {
            heading: "1.1. Muassasa nomi va huquqiy asosi",
            paragraphs: [
              "O'zbekiston Xalqaro Islom Akademiyasi huzuridagi «ZIYO-ZUKKO» nodavlat umumta'lim muassasasi (matnda buyog'i — «Maktab») O'zbekiston Respublikasi Fuqarolik kodeksi, «Ta'lim to'g'risida»gi Qonuni va mazkur Nizom asosida faoliyat olib boradi.",
              "Maktab o'z mustaqil balansiga, bank hisobvaraqlariga, davlat tili va xorijiy tillarda o'z nomi yozilgan doiraviy muhrga, shtamplarga hamda o'z savdo belgisi (logotip)ga ega bo'lgan mustaqil yuridik shaxs hisoblanadi.",
            ],
          },
          {
            heading: "1.2. Maktabning asosiy vazifalari",
            bulletPoints: [
              "O'quvchilarda yuksak ma'naviy-axloqiy fazilatlar, vatanparvarlik va milliy iftixor tuyg'ularini shakllantirish.",
              "Davlat ta'lim standartlari talablari asosida chuqurlashtirilgan aniq fanlar (matematika, fizika) va xorijiy tillar bo'yicha sifatli ta'lim berish.",
              "Zamonaviy IT texnologiyalari, robototexnika va sun'iy intellekt asoslarini o'rgatish orqali mustaqil fikrlaydigan avlodni voyaga yetkazish.",
            ],
          },
        ],
        signatory: {
          role: "Kuzatuv Kengashi Raisi",
          name: "Prof. Z. M. Islomov",
          date: "01.09.2024",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» NODAVLAT UMUMTA'LIM MUASSASASI",
          inn: "304218942",
          regCode: "NIZOM-01/2024",
          verified: true,
        },
      },
      {
        pageNumber: 2,
        title: "2-BOB. TA'LIM-TARBIYA JARAYONI",
        subtitle: "O'quv yili tartibi, dars jadvali va baholash mezonlari",
        sections: [
          {
            heading: "2.1. O'quv yili davomiyligi va kun tartibi",
            paragraphs: [
              "Maktabda o'quv yili 2-sentabrdan boshlanadi va keyingi yilning 25-mayiga qadar davom etadi. O'quv yili to'rtta chorakka bo'linadi.",
              "Maktab to'liq kunlik (08:30 dan 17:30 gacha) rejimda ishlaydi. Kun tartibiga 3 mahal issiq ovqatlanish, asosiy akademik darslar, to'garaklar, sport mashg'ulotlari hamda o'qituvchi nazoratida uy vazifalarini bajarish kiradi.",
            ],
          },
          {
            heading: "2.2. Sinfdagi o'quvchilar soni",
            paragraphs: [
              "Ta'lim samaradorligini va har bir o'quvchiga individual yondashuvni ta'minlash maqsadida har bir sinfda o'quvchilar soni 20–24 nafardan oshmasligi qat'iy belgilangan.",
            ],
          },
        ],
        signatory: {
          role: "Maktab Direktori",
          name: "S. A. Rahmatullayev",
          date: "01.09.2024",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» NODAVLAT UMUMTA'LIM MUASSASASI",
          inn: "304218942",
          regCode: "NIZOM-02/2024",
          verified: true,
        },
      },
      {
        pageNumber: 3,
        title: "3-BOB. HUQUQ VA MAJBURIYATLAR",
        subtitle: "Ta'lim jarayoni ishtirokchilarining huquqiy maqomi",
        sections: [
          {
            heading: "3.1. O'quvchilarning asosiy huquq va burchlari",
            bulletPoints: [
              "Davlat standartlariga mos keluvchi yuqori sifatli bilim va zamonaviy o'quv qurollaridan erkin foydalanish huquqi.",
              "Maktab ichki tartib-qoidalariga, kiyinish madaniyatiga (rasmiy maktab formasi) va odob-axloq talablariga rioya qilish burchi.",
              "Ustozlarga, maktab mulkiga hamda safdoshlariga hurmat bilan munosabatda bo'lish.",
            ],
          },
          {
            heading: "3.2. Ota-onalarning mas'uliyati",
            paragraphs: [
              "Ota-onalar farzandining maktabga o'z vaqtida kelishi, dars qoldirmasligi, sog'lig'i hamda ta'lim xizmatlari to'lovini shartnomada ko'rsatilgan muddatlarda amalga oshirilishi uchun bevosita mas'uldirlar.",
            ],
          },
        ],
        signatory: {
          role: "Yuridik xizmat rahbari",
          name: "A. B. Olimov",
          date: "01.09.2024",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» HUQUQIY DEPARTAMENTI",
          inn: "304218942",
          regCode: "NIZOM-03/2024",
          verified: true,
        },
      },
      {
        pageNumber: 4,
        title: "4-BOB. BOSHQARUV VA YAKUNIY QOIDALAR",
        subtitle: "Kuzatuv Kengashi, Pedagogik Kengash va qayta tashkil etish",
        sections: [
          {
            heading: "4.1. Boshqaruv organlari",
            paragraphs: [
              "Maktabning yuqori boshqaruv organi Ta'sischilar Kengashi hamda O'zbekiston Xalqaro Islom Akademiyasi vakillaridan iborat Kuzatuv Kengashidir.",
              "Maktabning kundalik faoliyatiga rahbarlikni Ta'sischilar Kengashi tomonidan tayinlanadigan Direktor amalga oshiradi.",
            ],
          },
          {
            heading: "4.2. Nizomga o'zgartirishlar kiritish",
            paragraphs: [
              "Ushbu Nizomga o'zgartirish va qo'shimchalar kiritish Ta'sischilar Kengashining bir ovozdan qabul qilgan qarori asosida O'zbekiston Respublikasi Adliya organlarida belgilangan tartibda ro'yxatdan o'tkazilgach kuchga kiradi.",
            ],
          },
        ],
        signatory: {
          role: "Bosh Ta'sischi — Kengash Raisi",
          name: "M. T. Shodiyev",
          date: "01.09.2024",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» NODAVLAT UMUMTA'LIM MUASSASASI",
          inn: "304218942",
          regCode: "NIZOM-04/FINAL",
          verified: true,
        },
      },
    ],
  },
  {
    id: "oquv-rejasi-2026-2027",
    slug: "oquv-rejasi",
    title: {
      uz: "2026–2027 O'quv Rejasi va STEAM Dasturi",
      ru: "Учебный план и программа STEAM на 2026–2027 год",
      en: "2026–2027 Academic Curriculum & STEAM Syllabus",
    },
    category: "academic",
    format: "PDF",
    fileSize: "3.1 MB",
    updatedDate: "2026-08-20",
    regNumber: "№ DASTUR-26/27",
    pagesCount: 3,
    summary: {
      uz: "Boshlang'ich va yuqori sinflar uchun haftalik fan soatlari taqsimoti, Cambridge xalqaro dasturi hamda sun'iy intellekt va robototexnika modullari integratsiyasi.",
      ru: "Распределение недельной нагрузки предметов, международная программа Cambridge и интеграция модулей ИИ и робототехники.",
      en: "Weekly curriculum hours allocation, Cambridge International curriculum standards, and AI/Robotics laboratory courses.",
    },
    fileUrl: "/documents/oquv-rejasi-2026-2027.pdf",
    r2PublicUrl: "https://pub-69ff7ae8204e40d696438bd71f06a2b6.r2.dev/documents/oquv-rejasi-2026-2027.pdf",
    pages: [
      {
        pageNumber: 1,
        title: "BOSHLANG'ICH TA'LIM AKADEMIK REJASI",
        subtitle: "1–4-sinflar uchun haftalik soatlar taqsimoti va rivojlantiruvchi to'garaklar",
        sections: [
          {
            heading: "Asosiy o'quv predmeti soatlari (Haftalik)",
            table: {
              headers: ["Fan nomi", "1-sinf", "2-sinf", "3-sinf", "4-sinf"],
              rows: [
                ["Ona tili va O'qish savodxonligi", "8 soat", "8 soat", "7 soat", "7 soat"],
                ["Matematika (Mantiq va Mental Arifmetika)", "5 soat", "5 soat", "6 soat", "6 soat"],
                ["Ingliz tili (Cambridge Primary)", "4 soat", "4 soat", "5 soat", "5 soat"],
                ["Arab tili (Fonetika va boshlang'ich qoidalar)", "2 soat", "2 soat", "2 soat", "2 soat"],
                ["IT & Robototexnika (Scratch Kids)", "2 soat", "2 soat", "2 soat", "2 soat"],
                ["Tasviriy san'at va Mehnat", "2 soat", "2 soat", "2 soat", "2 soat"],
                ["Jismoniy tarbiya va Shaxmat", "3 soat", "3 soat", "3 soat", "3 soat"],
              ],
            },
          },
        ],
        signatory: {
          role: "Boshlang'ich ta'lim kafedrasi mudiri",
          name: "G. R. Karimova",
          date: "20.08.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» ILMIY-USLUBIY KENGASHI",
          inn: "304218942",
          regCode: "CUR-PRI-2026",
          verified: true,
        },
      },
      {
        pageNumber: 2,
        title: "YUQORI SINFLAR: ANIQ FANLAR VA STEAM",
        subtitle: "5–11-sinflar bo'yicha chuqurlashtirilgan o'quv yo'nalishlari",
        sections: [
          {
            heading: "Ixtisoslashtirilgan o'quv bloklari",
            bulletPoints: [
              "Olimpiada matematikasi: Respublika va xalqaro olimpiadalarga (IMO, Kangaroo, SASMO) tayyorgarlik kursi.",
              "Amaliy Fizika va Kimyo laboratoriyalari: Har haftalik tajribalar bilan ta'minlangan interaktiv ta'lim.",
              "IT & Dasturlash (Python, Web Development va AI Prompt Engineering) haftasiga 4 soatdan.",
            ],
          },
          {
            heading: "Xalqaro imtihonlar tayyorgarligi",
            paragraphs: [
              "9–11-sinf o'quvchilari uchun IELTS (Target: 7.5+), SAT (Target: 1400+) va Milliy sertifikat (A+) darslari maktabning o'zida kuchli ekspert ustozlar tomonidan olib boriladi.",
            ],
          },
        ],
        signatory: {
          role: "O'quv ishlari bo'yicha direktor o'rinbosari",
          name: "F. N. Mahmudov",
          date: "20.08.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» PEDAGOGIK KENGASHI",
          inn: "304218942",
          regCode: "CUR-SEC-2026",
          verified: true,
        },
      },
      {
        pageNumber: 3,
        title: "MA'NAVIYAT, AXLOQ VA TO'GARAKLAR",
        subtitle: "To'liq kun tartibidagi qo'shimcha rivojlantirish dasturi",
        sections: [
          {
            heading: "Majburiy va ixtiyoriy to'garaklar jadvali",
            table: {
              headers: ["To'garak yo'nalishi", "Haftalik davomiyligi", "Murabbiy / Ustoz"],
              rows: [
                ["Shaxmat va Mantiq klubi", "Haftada 2 marta (16:00–17:00)", "Xalqaro toifadagi sport ustasi"],
                ["Notiqlik va Debat klubi (MUN)", "Haftada 2 marta (15:30–16:30)", "Yetakchi trener-pedagoglar"],
                ["Taekvondo va Gimnastika", "Haftada 3 marta (16:15–17:15)", "Respublika toifasidagi murabbiy"],
                ["Qur'on qiroati va Tajvid asoslari", "Haftada 2 marta (16:30–17:15)", "Akademiya mutaxassislari"],
              ],
            },
          },
        ],
        signatory: {
          role: "Ma'naviy-ma'rifiy ishlar bo'yicha direktor o'rinbosari",
          name: "M. K. Saidov",
          date: "20.08.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» MA'NAVIYAT DEPARTAMENTI",
          inn: "304218942",
          regCode: "CUR-ETH-2026",
          verified: true,
        },
      },
    ],
  },
  {
    id: "namunaviy-talim-shartnomasi",
    slug: "shartnoma",
    title: {
      uz: "Namunaviy Ta'lim Xizmati Shartnomasi (2026–2027)",
      ru: "Типовой договор об оказании образовательных услуг (2026–2027)",
      en: "Model Educational Services Agreement (2026–2027)",
    },
    category: "admissions",
    format: "DOCX",
    fileSize: "850 KB",
    updatedDate: "2026-06-10",
    regNumber: "№ SHBL-2026/DOG",
    pagesCount: 3,
    summary: {
      uz: "Ota-onalar va «Ziyo-Zukko» maktabi o'rtasida tuziladigan o'quvchini o'qitish, parvarishlash, sifatli ta'lim va 3 mahal ovqatlanishni kafolatlovchi ikki tomonlama shartnoma matni.",
      ru: "Двусторонний договор между родителями и школой на обучение, уход, качественное образование и 3-разовое питание.",
      en: "Standard bilateral contract between parents and school covering high-quality academic delivery, meal plans, and student welfare.",
    },
    fileUrl: "/documents/namunaviy-talim-shartnomasi.docx",
    r2PublicUrl: "https://pub-69ff7ae8204e40d696438bd71f06a2b6.r2.dev/documents/namunaviy-talim-shartnomasi.docx",
    pages: [
      {
        pageNumber: 1,
        title: "TA'LIM XIZMATLARI SHARTNOMASI",
        subtitle: "1-qism: Shartnoma predmeti va o'quvchi ma'lumotlari",
        sections: [
          {
            heading: "1. Shartnoma tomonlari",
            paragraphs: [
              "Bir tomondan Toshkent shahri Olmazor tumani Zarqaynar 18-berk ko'chasi 47-uyda joylashgan «ZIYO-ZUKKO» nodavlat umumta'lim muassasasi nomidan Nizom asosida ish yurituvchi Direktor, ikkinchi tomondan O'quvchining qonuniy vakili (Ota-onasi yoki vasiysi) ushbu shartnomani quyidagilar bo'yicha tuzdilar:",
            ],
          },
          {
            heading: "2. Shartnoma predmeti",
            paragraphs: [
              "Maktab mazkur shartnoma shartlariga muvofiq O'quvchiga davlat ta'lim standartlari va muassasaning tasdiqlangan o'quv dasturi asosida to'liq kunlik umumiy o'rta ta'lim xizmatlarini ko'rsatish, uning xavfsizligini ta'minlash, 3 mahal balanslangan taomnoma bilan ta'minlash majburiyatini oladi.",
            ],
          },
        ],
        signatory: {
          role: "Bosh Huquqshunos",
          name: "J. I. Yunusov",
          date: "10.06.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» YURIDIK BO'LIMI",
          inn: "304218942",
          regCode: "DOG-TMP-P1",
          verified: true,
        },
      },
      {
        pageNumber: 2,
        title: "TOMONLARNING HUQUQ VA MAJBURIYATLARI",
        subtitle: "2-qism: Sifat kafolatlari, intizom va xavfsizlik",
        sections: [
          {
            heading: "2.1. Maktabning majburiyatlari",
            bulletPoints: [
              "O'quv jarayonini yuqori malakali pedagogik jamoa tomonidan zamonaviy metodikalar asosida tashkil etish.",
              "Har bir o'quvchining shaxsiy daxlsizligi, sha'ni va qadr-qimmati hurmat qilinishini ta'minlash.",
              "Tibbiy punkt va parhezshunos tomonidan kunlik salomatlik nazoratini yuritish.",
            ],
          },
          {
            heading: "2.2. Buyurtmachi (Ota-ona) majburiyatlari",
            bulletPoints: [
              "O'quvchining maktab kun tartibiga (08:30–17:30) to'liq rioya qilishini ta'minlash.",
              "Maktabning ichki tartib va rasmiy kiyinish qoidalarini qo'llab-quvvatlash.",
              "Ta'lim to'lovlarini mazkur shartnomaning 3-bobida belgilangan muddatlarda to'liq to'lash.",
            ],
          },
        ],
        signatory: {
          role: "Moliya-iqtisodiyot bo'limi boshlig'i",
          name: "D. S. Vohidova",
          date: "10.06.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» NODAVLAT UMUMTA'LIM MUASSASASI",
          inn: "304218942",
          regCode: "DOG-TMP-P2",
          verified: true,
        },
      },
      {
        pageNumber: 3,
        title: "TO'LOV TARTIBI VA REKVIZITLAR",
        subtitle: "3-qism: To'lov muddatlari, bank hisobraqamlari va imzolar",
        sections: [
          {
            heading: "3.1. To'lov shartlari",
            paragraphs: [
              "Ta'lim to'lovi ota-onaning tanloviga ko'ra yillik (10% chegirma bilan), choraklik yoki har oyning 5-sanasiga qadar bo'lib to'lash tartibida amalga oshiriladi.",
              "To'lovlar bank o'tkazmasi, Payme, Click yoki Uzum Bank orqali rasmiy billing tizimi orqali qabul qilinadi.",
            ],
          },
          {
            heading: "3.2. Bank rekvizitlari",
            paragraphs: [
              "H/r: 20208000900542189001, ATB «Kapitalbank» Toshkent shahar filiali, MFO: 01024, STIR: 304218942, OKED: 85310.",
            ],
          },
        ],
        signatory: {
          role: "Bosh hisobchi",
          name: "M. B. Xolmatov",
          date: "10.06.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» BUXGALTERIYA BO'LIMI",
          inn: "304218942",
          regCode: "DOG-TMP-P3",
          verified: true,
        },
      },
    ],
  },
  {
    id: "ichki-tartib-qoidalari",
    slug: "ichki-tartib",
    title: {
      uz: "Maktab Ichki Tartib va Odob-axloq Qoidalari",
      ru: "Правила внутреннего распорядка и этики школы",
      en: "School Internal Code of Conduct & Ethics",
    },
    category: "rules",
    format: "PDF",
    fileSize: "1.2 MB",
    updatedDate: "2024-09-05",
    regNumber: "№ QOIDA-2024",
    pagesCount: 2,
    summary: {
      uz: "O'quvchilarning maktabdagi yurish-turishi, rasmiy formasi, gadjetlardan foydalanish cheklovlari va intizomiy talablarni belgilovchi me'yoriy qoidalar to'plami.",
      ru: "Свод правил поведения учащихся, стандарты школьной формы, правила использования гаджетов и дисциплинарные требования.",
      en: "Regulations regarding school uniform standards, digital devices policy, campus discipline, and behavioral culture.",
    },
    fileUrl: "/documents/ichki-tartib-qoidalari.pdf",
    r2PublicUrl: "https://pub-69ff7ae8204e40d696438bd71f06a2b6.r2.dev/documents/ichki-tartib-qoidalari.pdf",
    pages: [
      {
        pageNumber: 1,
        title: "KUN TARTIBI VA FORMA TALABLARI",
        subtitle: "1-bo'lim: Dars davomati, forma va kampus intizomi",
        sections: [
          {
            heading: "1. Maktabga kelish va dars davomati",
            bulletPoints: [
              "O'quvchilar maktabga har kuni soat 08:15 dan kechikmasdan kelishlari shart. Darslar 08:30 da davlat madhiyasi va ma'naviyat daqiqasi bilan boshlanadi.",
              "Dars qoldirish faqat ota-onaning oldindan yozma arizasi yoki shifokor ma'lumotnomasi bilan uzrli deb hisoblanadi.",
            ],
          },
          {
            heading: "2. Maktab formasi talablari",
            paragraphs: [
              "Barcha o'quvchilar uchun tasdiqlangan yagona maktab formasi majburiydir (to'q ko'k nimcha, oq ko'ylak, klassik shim/yubka, maktab emblemasi tushirilgan galstuk).",
              "Sport kiyimlari faqat jismoniy tarbiya darslari va to'garak vaqtlarida kiyilishiga ruxsat etiladi.",
            ],
          },
        ],
        signatory: {
          role: "Tarbiyaviy ishlar bo'limi boshlig'i",
          name: "X. Z. Ergashev",
          date: "05.09.2024",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» INTIZOM KENGASHI",
          inn: "304218942",
          regCode: "RULE-P1-24",
          verified: true,
        },
      },
      {
        pageNumber: 2,
        title: "SMARTFONLAR VA ODOB-AXLOQ MEZONLARI",
        subtitle: "2-bo'lim: Raqamli qurilmalar va o'zaro munosabat madaniyati",
        sections: [
          {
            heading: "3. Smartfon va elektron vositalardan foydalanish",
            bulletPoints: [
              "Maktab hududida dars vaqtlari mobaynida smartfonlardan erkin foydalanish qat'iyan taqiqlanadi.",
              "Dars boshlanishidan oldin barcha smartfonlar sinf rahbarining maxsus saqlash seyfiga topshiriladi va darslar tugagach (17:30 da) qaytariladi.",
            ],
          },
          {
            heading: "4. Rag'batlantirish va intizomiy choralar",
            paragraphs: [
              "Chorak yakunlari bo'yicha a'lo baholarga o'qigan va namunali xulqli o'quvchilar «Ziyo-Zukko Faxriy Yorlig'i» va maxsus esdalik sovg'alari bilan taqdirlanadi.",
            ],
          },
        ],
        signatory: {
          role: "Maktab Direktori",
          name: "S. A. Rahmatullayev",
          date: "05.09.2024",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» NODAVLAT UMUMTA'LIM MUASSASASI",
          inn: "304218942",
          regCode: "RULE-P2-24",
          verified: true,
        },
      },
    ],
  },
  {
    id: "sanitariya-xavfsizlik-xulosasi",
    slug: "xavfsizlik",
    title: {
      uz: "Sanitariya-Epidemiologik va Yong'in Xavfsizligi Xulosalari",
      ru: "Санитарно-эпидемиологические и пожарные заключения",
      en: "Sanitary, Epidemiological & Fire Safety Certifications",
    },
    category: "safety",
    format: "PDF",
    fileSize: "1.6 MB",
    updatedDate: "2024-08-28",
    regNumber: "№ SAN-EPID-992/24",
    pagesCount: 2,
    summary: {
      uz: "Toshkent shahar SanEpidemiyologiya qo'mitasi va FVB tomonidan berilgan, maktab oshxonasi, dars xonalari va kampusi to'liq xavfsizligini tasdiqlovchi rasmiy davlat dalolatnomalari.",
      ru: "Официальные заключения СЭС и МЧС, подтверждающие полную безопасность пищеблока, учебных кабинетов и кампуса школы.",
      en: "Official state health, sanitation and fire safety inspection certificates confirming full compliance of facilities, cafeteria, and labs.",
    },
    fileUrl: "/documents/sanitariya-xavfsizlik-xulosasi.pdf",
    r2PublicUrl: "https://pub-69ff7ae8204e40d696438bd71f06a2b6.r2.dev/documents/sanitariya-xavfsizlik-xulosasi.pdf",
    pages: [
      {
        pageNumber: 1,
        title: "SANITARIYA-EPIDEMIOLOGIK EKSPERTIZA XULOSASI",
        subtitle: "SanEpidemiyologik osoyishtalik va jamoat salomatligi xizmati",
        sections: [
          {
            heading: "Tekshiruv dalolatnomasi № 992-SES",
            paragraphs: [
              "O'zbekiston Respublikasi SanPiN 0289-10 talablariga muvofiq, Toshkent shahri Olmazor tumani Zarqaynar 18-berk ko'chasi 47-uy manzilida joylashgan «ZIYO-ZUKKO» maktab binosi va oshxona bloki to'liq davlat sanitariya ekspertizasidan o'tkazildi.",
              "Xulosa: O'quv xonalarining yoritilishi, shamollatish (ventilyatsiya) tizimi, ichimlik suvi filtrlari va oshxona jihozlari davlat sanitariya me'yorlariga 100% to'la muvofiq deb topildi.",
            ],
          },
        ],
        signatory: {
          role: "Bosh Davlat Sanitariya vrachi",
          name: "Dr. A. E. Mirzayev",
          date: "28.08.2024",
        },
        stampDetails: {
          organization: "TOSHKENT SHAHAR SANITARIYA-EPIDEMIOLOGIYA BOSHQARMASI",
          inn: "201948191",
          regCode: "SES-UZ-2024-992",
          verified: true,
        },
      },
      {
        pageNumber: 2,
        title: "YONG'IN XAVFSIZLIGI DALOLATNOMASI",
        subtitle: "Favqulodda vaziyatlar vazirligi Yong'in xavfsizligi boshqarmasi",
        sections: [
          {
            heading: "Avtomatlashtirilgan xavfsizlik tizimlari holati",
            bulletPoints: [
              "Barcha 4 qavatda zamonaviy tutun va olov sezuvchi avtomat detektorlar o'rnatilgan.",
              "Favqulodda zaxira chiqish yo'llari, yoritgichli evakuatsiya belgilari va o't o'chirish moslamalari soz holatda.",
              "Videokuzatuv tizimi 24/7 rejimda kampus perimetri va koridorlarini to'liq qamrab olgan.",
            ],
          },
        ],
        signatory: {
          role: "FVB Yong'in nazorati bosh noziri",
          name: "Mayor O. R. Boboxonov",
          date: "28.08.2024",
        },
        stampDetails: {
          organization: "FAVQULODDA VAZIYATLAR BOSHQARMASI YONG'IN NAZORATI",
          inn: "200849102",
          regCode: "FVB-ACT-2024-814",
          verified: true,
        },
      },
    ],
  },
  {
    id: "maktabga-qabul-ariza-blanki",
    slug: "ariza-blanki",
    title: {
      uz: "Maktabga Qabul Qilish To'g'risida Ariza Blanki",
      ru: "Бланк заявления о приёме в школу",
      en: "School Admission Application Form & Blank",
    },
    category: "admissions",
    format: "DOCX",
    fileSize: "520 KB",
    updatedDate: "2026-05-15",
    regNumber: "№ BLANK-2026",
    pagesCount: 2,
    summary: {
      uz: "Qabul komissiyasiga topshiriladigan ota-onalar arizasi namunasi, o'quvchi ma'lumotnomasi va tibbiy karta rozilik hujjati shakli.",
      ru: "Образец заявления родителей в приемную комиссию, анкета учащегося и форма согласия на медицинскую карту.",
      en: "Official printable application form for admissions committee, including student dossier and parental consent forms.",
    },
    fileUrl: "/documents/maktabga-qabul-ariza-blanki.docx",
    r2PublicUrl: "https://pub-69ff7ae8204e40d696438bd71f06a2b6.r2.dev/documents/maktabga-qabul-ariza-blanki.docx",
    pages: [
      {
        pageNumber: 1,
        title: "QABUL ARIZASI (NAMUNA)",
        subtitle: "«Ziyo-Zukko» umumta'lim maktabi direktoriga",
        sections: [
          {
            heading: "Ariza matni",
            paragraphs: [
              "Men, __________________________________________________ (ota-ona F.I.Sh.), farzandim __________________________________________________ ni 2026–2027 o'quv yili uchun «Ziyo-Zukko» maktabining ______-sinfiga qabul qilishingizni so'rayman.",
              "Maktab Nizomi, ichki tartib-qoidalari va o'quv shartnomasi talablari bilan to'liq tanishdim va ularga rioya etish majburiyatini olaman.",
            ],
          },
          {
            heading: "Biriktirilgan hujjatlar ro'yxati",
            bulletPoints: [
              "O'quvchining tug'ilganlik haqidagi guvohnomasi nusxasi",
              "Ota-onasining fuqarolik pasporti nusxasi",
              "O'quvchining 3x4 o'lchamli 6 dona rangli fotosurati",
              "086-U shakldagi tibbiy ma'lumotnoma va emlash kartasi (063-shakl)",
              "Oldingi maktabdan baholar tabeli yoki shaxsiy hujjati (2–11-sinflar uchun)",
            ],
          },
        ],
        signatory: {
          role: "Ariza beruvchi ota-ona (vasiy)",
          name: "Imzo: ___________________",
          date: "«____» _____________ 2026-yil",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» QABUL KOMISSIYASI",
          inn: "304218942",
          regCode: "APP-FORM-26",
          verified: true,
        },
      },
      {
        pageNumber: 2,
        title: "O'QUVCHINING IJTIMOIY-PSIXOLOGIK ANKETASI",
        subtitle: "Individual pedagogik yondashuv uchun zaruriy ma'lumotlar",
        sections: [
          {
            heading: "Qo'shimcha ma'lumotlar",
            bulletPoints: [
              "O'quvchining sevimli fanlari va qiziqishlari (sport, musiqa, IT, tillar)",
              "Surunkali allergik yoki parhez talab qiluvchi oziq-ovqat cheklovlari mavjudligi",
              "Favqulodda vaziyatlarda bog'lanish uchun ota-onaning 2 ta telefon raqami",
            ],
          },
        ],
        signatory: {
          role: "Qabul komissiyasi mas'ul kotibi",
          name: "M. Sh. Karimova",
          date: "15.05.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» QABUL KOMISSIYASI",
          inn: "304218942",
          regCode: "ANKETA-26",
          verified: true,
        },
      },
    ],
  },
  {
    id: "tolov-va-grantlar-nizomi",
    slug: "grant-nizomi",
    title: {
      uz: "Ta'lim To'lovlari Tariflari va Maktab Grantlari Nizomi",
      ru: "Положение о тарифах оплаты и школьных грантах",
      en: "Tuition Fees Schedule & Scholarship Grant Regulations",
    },
    category: "academic",
    format: "PDF",
    fileSize: "1.3 MB",
    updatedDate: "2026-08-01",
    regNumber: "№ GRANT-NIZOM-26",
    pagesCount: 2,
    summary: {
      uz: "2026–2027 o'quv yili uchun to'lov tariflari, bitta oiladan bir nechta farzand o'qisa beriladigan imtiyozlar hamda olimpiada g'oliblariga 100% gacha ajratiladigan grantlar tartibi.",
      ru: "Тарифы на 2026–2027 уч. год, семейные льготы и порядок предоставления академических грантов до 100% победителям олимпиад.",
      en: "Tuition fee packages, sibling discounts, and 100% academic scholarship grant rules for outstanding olympiad champions.",
    },
    fileUrl: "/documents/tolov-va-grantlar-nizomi.pdf",
    r2PublicUrl: "https://pub-69ff7ae8204e40d696438bd71f06a2b6.r2.dev/documents/tolov-va-grantlar-nizomi.pdf",
    pages: [
      {
        pageNumber: 1,
        title: "TA'LIM TO'LOV PAKETLARI (2026–2027)",
        subtitle: "Xizmatlar to'plami va to'lov turlari",
        sections: [
          {
            heading: "Ta'lim to'loviga kiritilgan xizmatlar",
            bulletPoints: [
              "08:30–17:30 to'liq kunlik ta'lim va chuqurlashtirilgan akademik darslar.",
              "Parhezshunos nazoratidagi 3 mahal issiq ovqat (nonushta, tushlik, mevali tamaddi).",
              "Barcha fan to'garaklari, shaxmat, sport seksiyalari va uy vazifalarini maktabda tayyorlash.",
              "Tibbiy hamshira va psixologning doimiy nazorati hamda 24/7 videokuzatuv.",
            ],
          },
          {
            heading: "Oila a'zolari uchun chegirmalar",
            paragraphs: [
              "Bitta oiladan 2 nafar farzand o'qisa — ikkinchi farzand uchun 10% chegirma, 3 nafar yoki undan ortiq farzand o'qisa — uchinchi farzand uchun 15% chegirma beriladi.",
            ],
          },
        ],
        signatory: {
          role: "Moliya direktori",
          name: "R. A. Qosimov",
          date: "01.08.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» MOLIYA BOSHQARMASI",
          inn: "304218942",
          regCode: "PRICE-2026-P1",
          verified: true,
        },
      },
      {
        pageNumber: 2,
        title: "ZIYO-ZUKKO AKADEMIK GRANTLARI NIZOMI",
        subtitle: "Iqtidorli va olimpiadachi o'quvchilarni qo'llab-quvvatlash",
        sections: [
          {
            heading: "100% va 50% gacha bo'lgan maktab grantlari shartlari",
            bulletPoints: [
              "Respublika fan olimpiadalarining shahar va respublika bosqichi g'oliblariga (1–3-o'rin) 100% gacha o'qish granti ajratiladi.",
              "IELTS 8.0+ yoki SAT 1450+ natijaga ega yuqori sinf o'quvchilariga alohida rag'batlantiruvchi grant belgilanadi.",
              "Grant har o'quv yili yakunida o'quvchining akademik o'zlashtirishi va xulq-atvori asosida qayta tasdiqlanadi.",
            ],
          },
        ],
        signatory: {
          role: "Grant Komissiyasi Raisi",
          name: "Prof. Z. M. Islomov",
          date: "01.08.2026",
        },
        stampDetails: {
          organization: "«ZIYO-ZUKKO» GRANT KOMISSIYASI",
          inn: "304218942",
          regCode: "GRANT-2026-P2",
          verified: true,
        },
      },
    ],
  },
];
