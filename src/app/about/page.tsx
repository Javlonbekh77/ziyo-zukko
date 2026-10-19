"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Clock,
  Users,
  Utensils,
  ShieldCheck,
  Award,
  BookOpen,
  Compass,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Languages,
  Activity,
  Smile,
  Dna,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage, Language } from "@/context/LanguageContext";
import { scrollToSection } from "@/lib/scrollUtils";

export default function AboutPage() {
  const { lang, t } = useLanguage();

  // Content dictionary for multi-language support
  const content = {
    uz: {
      badge: "O'zbekiston Xalqaro Islom Akademiyasi qoshidagi",
      mainTitle: "«ZIYO-ZUKKO» UMUMTA'LIM MAKTABI",
      subTitle:
        "2016-yildan buyon ilm-fan, chuqurlashtirilgan xorijiy tillar, milliy qadriyatlar va komil inson tarbiyasini o'zida mujassam etgan zamonaviy xususiy ta'lim dargohi.",
      quickApply: "Qabulga ariza topshirish",
      callUs: "Qo'ng'iroq qilish",
      statsTitle: "Maktabimiz raqamlarda",
      stats: [
        { value: "2016", label: "Tashkil etilgan yil", sub: "10 yillik mustahkam ta'lim tajribasi" },
        { value: "20–24", label: "O'quvchi sinfda", sub: "Har bir bolaga individual pedagogik e'tibor" },
        { value: "08:30–17:30", label: "To'liq kun tartibi", sub: "Darslar, to'garaklar va vazifalar maktabda" },
        { value: "3 mahal", label: "Issiq taomnoma", sub: "Balanslangan va parhezshunos nazoratidagi ovqat" },
        { value: "460 o'rin", label: "Katta anjumanlar zali", sub: "Ma'naviy-ma'rifiy va xalqaro tadbirlar maskani" },
        { value: "100%", label: "Xavfsiz muhit", sub: "24/7 xonama-xona videokuzatuv va tibbiy nazorat" },
      ],
      missionBadge: "BIZNING FALSAFAMIZ VA MAQSADIMIZ",
      missionTitle: "Ilm va go'zal axloq — porloq kelajak poydevori",
      missionDesc:
        "«Ziyo-Zukko» maktabi O'zbekiston Xalqaro Islom Akademiyasi qoshida faoliyat yuritib, o'quvchilarda nafaqat yuqori akademik salohiyat, balki chuqur ma'naviy dunyoqarash, odob-axloq, milliy iftixor va zamonaviy tafakkurni kamol toptirishni o'zining bosh maqsadi deb biladi.",
      pillars: [
        {
          title: "Akademik mukammallik",
          desc: "Davlat ta'lim standartlari bilan birga chet tillari, matematika va tarix fanlarini chuqurlashtirilgan dasturlar asosida o'qitish.",
        },
        {
          title: "Xalqaro Islom Akademiyasi an'analari",
          desc: "Milliy qadriyatlar, halollik, xushmuomalalik, bag'rikenglik va ajdodlar merosiga hurmat ruhida tarbiyalash.",
        },
        {
          title: "Kalligrafiya va madaniyat",
          desc: "Ikkinchi chet tili sifatida arab tili hamda qadimiy xattotlik (kalligrafiya) san'atini professional o'rgatish.",
        },
        {
          title: "Zamonaviy dunyoqarash",
          desc: "Axborot texnologiyalari, tanqidiy fikrlash, notiqlik mahorati va xalqaro olimpiadalarga maqsadli yo'naltirish.",
        },
      ],
      stagesBadge: "TA'LIM BOSQICHLARI",
      stagesTitle: "Har bir yosh davriga xos tizimli ta'lim",
      stages: [
        {
          name: "First Step (Maktabga tayyorlov)",
          age: "5–7 yosh",
          highlight: "Maktabga yumshoq va qiziqarli moslashuv",
          items: [
            "Nutq o'stirish, harflar va tovushlar bilan ilk tanishuv",
            "Mantiqiy o'yinlar va mayda motorika mashqlari",
            "Ijtimoiy ko'nikmalar va do'stona muhitga o'rganish",
            "Qiziqarli ingliz tili va ritmika mashg'ulotlari",
          ],
        },
        {
          name: "Boshlang'ich ta'lim",
          age: "1–4 sinflar",
          highlight: "Pishiq fundamental bilim va qobiliyatlarni kashf etish",
          items: [
            "Tez o'qish, chiroyli husnixat va matematika",
            "Intensiv ingliz tili (Speaking & Fun Grammar)",
            "Arab tili alifbosi va boshlang'ich xattotlik asoslari",
            "Shaxmat, sport seksiyalari va ijodiy ustaxonalar",
          ],
        },
        {
          name: "Umumiy o'rta ta'lim",
          age: "5–9 sinflar",
          highlight: "Chuqurlashtirilgan fanlar va xalqaro imtihonlarga tayyorgarlik",
          items: [
            "Matematika, aniq va tabiiy fanlarni chuqur o'rganish",
            "English Club, Cambridge darajalari (Flyers, KET, PET) va IELTS poydevori",
            "Arab tili grammatikasi va nutq so'zlashuv mahorati",
            "Olimpiada to'garaklari va davlat namunasi bo'yicha attestat",
          ],
        },
      ],
      programsBadge: "CHUQURLASHTIRILGAN YO'NALISHLAR",
      programsTitle: "Maktabimizning ustuvor fan yo'nalishlari",
      programs: [
        {
          title: "Tarix va Jahon Sivilizatsiyasi",
          desc: "Buyuk allomalar merosi, O'zbekiston va jahon tarixi chuqur tahlil va madaniy sayohatlar orqali o'rgatiladi.",
          icon: Compass,
          color: "bg-amber-500/10 text-amber-600 border-amber-200",
        },
        {
          title: "Ingliz tili (Cambridge YLE & English Club)",
          desc: "Xalqaro standartlar asosida interaktiv so'zlashuv, grammatika va xalqaro olimpiada hamda imtihonlarga tayyorlov.",
          icon: Languages,
          color: "bg-blue-500/10 text-blue-600 border-blue-200",
        },
        {
          title: "Arab tili va Xattotlik san'ati",
          desc: "Sharq tillarining durdonasi bo'lgan arab tili hamda nozik milliy xattotlik (kalligrafiya) bo'yicha maxsus darslar.",
          icon: BookOpen,
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        },
        {
          title: "Matematika va Mantiqiy Tafakkur",
          desc: "Murakkab masalalarni yechish, fazoviy va mantiqiy fikrlash, mental arifmetika hamda respublika olimpiadalariga tayyorgarlik.",
          icon: Sparkles,
          color: "bg-purple-500/10 text-purple-600 border-purple-200",
        },
        {
          title: "IT va Kompyuter Savodxonligi",
          desc: "Zamonaviy IT-laboratoriyada algoritmlash, dasturlash asoslari va axborot texnologiyalaridan unumli foydalanish.",
          icon: Dna,
          color: "bg-rose-500/10 text-rose-600 border-rose-200",
        },
        {
          title: "Sport va Sog'lom Turmush Tarzi",
          desc: "Futbol, taekvondo, shaxmat, gimnastika va yengil atletika bo'yicha malakali murabbiylar mashg'ulotlari.",
          icon: Activity,
          color: "bg-teal-500/10 text-teal-600 border-teal-200",
        },
      ],
      scheduleBadge: "KUN TARTIBI",
      scheduleTitle: "Farzandingiz kuni qanday o'tadi?",
      scheduleSub: "To'liq kunlik ta'lim tizimi ota-onalarni ortiqcha uy vazifalari tashvishidan xalos etadi.",
      schedule: [
        { time: "08:30 – 09:00", title: "Ertalabki kutib olish & Badantarbiya", desc: "Bolalarni quvnoq kutib olish, ertalabki jismoniy chigilyozdi va foydali nonushta." },
        { time: "09:00 – 13:00", title: "Asosiy akademik darslar", desc: "Davlat standarti va chuqurlashtirilgan dastur bo'yicha intensiv mashg'ulotlar." },
        { time: "13:00 – 14:00", title: "Issiq tushlik & Toza havoda sayr", desc: "3 taomdan iborat to'yimli issiq tushlik va maktab xavfsiz hovlisida erkin dam olish." },
        { time: "14:00 – 15:30", title: "Uy vazifalarini bajarish (Samopodgotovka)", desc: "Tajribali ustoz va repetitorlar ko'magida barcha vazifalar maktabning o'zida bajariladi." },
        { time: "15:30 – 16:00", title: "Ikkinchi tushlik (Poldnik)", desc: "Meva, yangi pishiriqlar va vitaminli ichimliklar bilan quvvatni tiklash." },
        { time: "16:00 – 17:30", title: "To'garaklar & Sport seksiyalari", desc: "Shaxmat, futbol, taekvondo, xattotlik, san'at va xorijiy til klublari mashg'ulotlari." },
      ],
      facilitiesBadge: "INFRATUZILMA VA SHAROITLAR",
      facilitiesTitle: "Zamonaviy kampus va barcha qulayliklar",
      facilities: [
        { title: "Yorug' va keng sinflar", desc: "Ergonomik partalar, multimediya ekranlari va toza mikroiqlimga ega dars xonalari." },
        { title: "IT va kompyuter sinfi", desc: "Zamonaviy kompyuterlar bilan jihozlangan raqamli texnologiyalar xonasi." },
        { title: "460 kishilik akt zal", desc: "Katta sahna, professional ovoz va yoritish tizimiga ega muhtasham anjumanlar zali." },
        { title: "Sport zali va futbol maydoni", desc: "Yopiq sport majmuasi, yugurish yo'laklari va zamonaviy chimli futbol maydoni." },
        { title: "Boy maktab kutubxonasi", desc: "Klassik va zamonaviy o'zbek, jahon adabiyoti hamda ensiklopediyalar fondi." },
        { title: "Shifokor, logoped va psixolog", desc: "Doimiy tibbiy navbatchilik, bolalar psixologi va nutq rivojlantirish mutaxassisi xizmati." },
      ],
      safetyBadge: "XAVFSIZLIK VA G'AMXO'RLIK",
      safetyTitle: "Farzandingiz to'liq xavfsiz va ishonchli qo'llarda",
      safetyPoints: [
        "24/7 hududiy va xonama-xona to'liq videokuzatuv tizimi",
        "Elektron turniketli nazorat-o'tish punkti va professional qo'riqlash",
        "O'quvchilar salomatligi ustidan doimiy shifokor va hamshira nazorati",
        "Sanitariya-gigiyena me'yorlariga qat'iy javob beradigan toza oshxona",
        "Toshkent shahri bo'ylab qiziqarli muzeylar va ilmiy markazlarga sayyor darslar",
      ],
      ctaTitle: "Farzandingiz kelajagini bugundan birgalikda barpo etamiz",
      ctaDesc:
        "«Ziyo-Zukko» maktabiga qabul shartlari, ochiq eshiklar kuni va saralash imtihonlari haqida to'liq ma'lumot olish uchun biz bilan bog'laning.",
      ctaButton: "Ariza qoldirish",
      addressText: "Toshkent sh., Shayxontohur tumani, Abdulla Qodiriy ko'chasi, 11 (mo'ljal: Xalqaro Islom Akademiyasi)",
      openMaps: "Xaritada ko'rish",
    },
    ru: {
      badge: "При Международной исламской академии Узбекистана",
      mainTitle: "ОБЩЕОБРАЗОВАТЕЛЬНАЯ ШКОЛА «ZIYO-ZUKKO»",
      subTitle:
        "Современная частная школа, работающая с 2016 года и гармонично сочетающая фундаментальные науки, углублённые иностранные языки, национальные традиции и высокое воспитание.",
      quickApply: "Подать заявку на приём",
      callUs: "Позвонить нам",
      statsTitle: "Наша школа в цифрах",
      stats: [
        { value: "2016", label: "Год основания", sub: "10 лет безупречного образовательного опыта" },
        { value: "20–24", label: "Ученика в классе", sub: "Индивидуальное внимание к каждому ребёнку" },
        { value: "08:30–17:30", label: "Режим полного дня", sub: "Уроки, кружки и домашние задания в школе" },
        { value: "3 раза", label: "Горячее питание", sub: "Сбалансированное меню под контролем диетолога" },
        { value: "460 мест", label: "Большой актовый зал", sub: "Площадка для культурных и международных событий" },
        { value: "100%", label: "Безопасная среда", sub: "Круглосуточное видеонаблюдение и врач" },
      ],
      missionBadge: "НАША ФИЛОСОФИЯ И ЦЕЛЬ",
      missionTitle: "Знания и высокая нравственность — основа светлого будущего",
      missionDesc:
        "Школа «Ziyo-Zukko» действует при Международной исламской академии Узбекистана и ставит своей главной целью воспитание всесторонне развитой личности с высоким академическим уровнем, широким кругозором и глубоким уважением к национальным духовным ценностям.",
      pillars: [
        {
          title: "Академическое превосходство",
          desc: "Сочетание государственных стандартов с углублённым изучением иностранных языков, математики и истории.",
        },
        {
          title: "Традиции Исламской академии",
          desc: "Воспитание честности, доброты, взаимоуважения, толерантности и почтительного отношения к великому наследию предков.",
        },
        {
          title: "Каллиграфия и культура",
          desc: "Изучение арабского языка как второго иностранного и профессиональные уроки восточной каллиграфии (хаттотлик).",
        },
        {
          title: "Современное мышление",
          desc: "Информационные технологии, логическое мышление, ораторское искусство и целевая подготовка к международным олимпиадам.",
        },
      ],
      stagesBadge: "СТУПЕНИ ОБУЧЕНИЯ",
      stagesTitle: "Системное обучение для каждого возраста",
      stages: [
        {
          name: "First Step (Подготовка к школе)",
          age: "5–7 лет",
          highlight: "Мягкая и увлекательная адаптация к школьной жизни",
          items: [
            "Развитие речи, знакомство со звуками и буквами",
            "Логические игры и развитие мелкой моторики",
            "Социализация и уверенность в коллективе сверстников",
            "Игровой английский язык и ритмика",
          ],
        },
        {
          name: "Начальная школа",
          age: "1–4 классы",
          highlight: "Прочный фундамент знаний и раскрытие талантов",
          items: [
            "Скорочтение, красивый почерк и логическая математика",
            "Интенсивный английский язык (Speaking & Fun Grammar)",
            "Основы арабского языка и уроки каллиграфии",
            "Шахматы, спортивные секции и творческие мастерские",
          ],
        },
        {
          name: "Основная средняя школа",
          age: "5–9 классы",
          highlight: "Углублённые предметы и подготовка к олимпиадам",
          items: [
            "Углублённая математика, точные и естественные науки",
            "English Club, подготовка к ступеням Cambridge и IELTS",
            "Грамматика и разговорная речь арабского языка",
            "Олимпиадные кружки и государственный аттестат",
          ],
        },
      ],
      programsBadge: "УГЛУБЛЁННЫЕ НАПРАВЛЕНИЯ",
      programsTitle: "Приоритетные направления нашей школы",
      programs: [
        {
          title: "История и Мировая Цивилизация",
          desc: "Глубокое изучение истории Узбекистана и мира через аналитические уроки и выездные культурные экскурсии.",
          icon: Compass,
          color: "bg-amber-500/10 text-amber-600 border-amber-200",
        },
        {
          title: "Английский язык (Cambridge YLE & English Club)",
          desc: "Интерактивная разговорная речь, грамматика и подготовка к сдаче международных сертификатов по стандартам Cambridge.",
          icon: Languages,
          color: "bg-blue-500/10 text-blue-600 border-blue-200",
        },
        {
          title: "Арабский язык и искусство каллиграфии",
          desc: "Жемчужина восточных языков и утончённое искусство арабской каллиграфии с опытными мастерами.",
          icon: BookOpen,
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        },
        {
          title: "Математика и логическое мышление",
          desc: "Решение нестандартных олимпиадных задач, пространственное мышление и ментальная арифметика.",
          icon: Sparkles,
          color: "bg-purple-500/10 text-purple-600 border-purple-200",
        },
        {
          title: "IT и цифровая грамотность",
          desc: "Алгоритмическое мышление, базовое программирование и безопасная работа в современном цифровом пространстве.",
          icon: Dna,
          color: "bg-rose-500/10 text-rose-600 border-rose-200",
        },
        {
          title: "Спорт и здоровый образ жизни",
          desc: "Секции футбола, тхэквондо, шахмат, гимнастики и лёгкой атлетики с квалифицированными тренерами.",
          icon: Activity,
          color: "bg-teal-500/10 text-teal-600 border-teal-200",
        },
      ],
      scheduleBadge: "РАСПОРЯДОК ДНЯ",
      scheduleTitle: "Как проходит день ученика?",
      scheduleSub: "Школа полного дня освобождает родителей от хлопот с выполнением домашних заданий по вечерам.",
      schedule: [
        { time: "08:30 – 09:00", title: "Встреча детей & Утренняя зарядка", desc: "Радостная встреча, бодрящая разминка и вкусный питательный завтрак." },
        { time: "09:00 – 13:00", title: "Основные академические занятия", desc: "Интенсивные уроки по государственным и углублённым авторским программам." },
        { time: "13:00 – 14:00", title: "Горячий обед & Прогулка на воздухе", desc: "Полноценный обед из трёх блюд и активный отдых на охраняемой территории." },
        { time: "14:00 – 15:30", title: "Самоподготовка (Домашние задания)", desc: "Выполнение всех уроков под чутким контролем учителей-предметников и тьюторов." },
        { time: "15:30 – 16:00", title: "Полдник", desc: "Свежая выпечка, сезонные фрукты и витаминные напитки для восстановления сил." },
        { time: "16:00 – 17:30", title: "Кружки & Спортивные секции", desc: "Шахматы, футбол, тхэквондо, каллиграфия, творчество и языковые клубы." },
      ],
      facilitiesBadge: "ИНФРАСТРУКТУРА И УСЛОВИЯ",
      facilitiesTitle: "Современный кампус и максимум удобств",
      facilities: [
        { title: "Светлые просторные классы", desc: "Эргономичная мебель, интерактивные экраны и комфортный микроклимат." },
        { title: "IT-лаборатория", desc: "Современные компьютеры и высокоскоростное подключение для цифрового творчества." },
        { title: "Актовый зал на 460 мест", desc: "Большая сцена, профессиональный звук и свет для школьных торжеств и конференций." },
        { title: "Спортивный комплекс", desc: "Крытый зал, беговые дорожки и футбольное поле с качественным искусственным покрытием." },
        { title: "Богатая библиотека", desc: "Большой фонд классической, художественной и научно-познавательной литературы." },
        { title: "Медицинский блок и психолог", desc: "Постоянное дежурство врача, кабинет детского психолога и логопеда." },
      ],
      safetyBadge: "БЕЗОПАСНОСТЬ И ЗАБОТА",
      safetyTitle: "Ваш ребёнок в надёжной и заботливой среде",
      safetyPoints: [
        "Круглосуточное видеонаблюдение 24/7 во всех кабинетах и по периметру",
        "Контрольно-пропускной пункт с электронными турникетами и охраной",
        "Постоянный мониторинг здоровья школьным врачом и медсестрой",
        "Строгое соблюдение санитарно-гигиенических стандартов на кухне",
        "Тематические выездные уроки в музеи и научные центры Ташкента",
      ],
      ctaTitle: "Создайте успешное будущее вашего ребёнка вместе с нами",
      ctaDesc:
        "Свяжитесь с нами, чтобы узнать подробности о правилах приёма, днях открытых дверей и вступительном тестировании.",
      ctaButton: "Оставить заявку",
      addressText: "г. Ташкент, Шайхантахурский район, ул. Абдуллы Кадыри, 11 (ориентир: Исламская Академия)",
      openMaps: "Открыть на карте",
    },
    en: {
      badge: "Under the International Islamic Academy of Uzbekistan",
      mainTitle: "«ZIYO-ZUKKO» GENERAL EDUCATION SCHOOL",
      subTitle:
        "A premier private school founded in 2016, harmonizing academic excellence, advanced foreign languages, cultural heritage, and moral character education.",
      quickApply: "Apply for Admission",
      callUs: "Call Us",
      statsTitle: "Our School in Numbers",
      stats: [
        { value: "2016", label: "Year Established", sub: "10 years of trusted academic excellence" },
        { value: "20–24", label: "Students per Class", sub: "Tailored individual care for every student" },
        { value: "08:30–17:30", label: "Full-Day Schedule", sub: "Classes, homework, and clubs completed at school" },
        { value: "3 Meals", label: "Nutritious Dining", sub: "Balanced meals overseen by certified dietitians" },
        { value: "460 Seats", label: "Grand Assembly Hall", sub: "Venue for academic conferences and cultural events" },
        { value: "100%", label: "Safe Environment", sub: "24/7 campus video surveillance & medical support" },
      ],
      missionBadge: "OUR PHILOSOPHY & MISSION",
      missionTitle: "Knowledge and noble values form the foundation of a bright future",
      missionDesc:
        "Affiliated with the International Islamic Academy of Uzbekistan, ZIYO-ZUKKO School is dedicated to fostering intellectually accomplished, morally upright, and globally minded future leaders.",
      pillars: [
        {
          title: "Academic Rigor",
          desc: "Merging state curriculum standards with advanced study in mathematics, foreign languages, and world history.",
        },
        {
          title: "Ethical & Cultural Heritage",
          desc: "Instilling honesty, kindness, mutual respect, and reverence for timeless cultural wisdom.",
        },
        {
          title: "Arabic & Fine Calligraphy",
          desc: "Comprehensive Arabic language instruction alongside masterclasses in traditional oriental calligraphy (Khattatlik).",
        },
        {
          title: "Modern Global Mindset",
          desc: "Digital literacy, public speaking, critical reasoning, and dedicated preparation for international Olympiads.",
        },
      ],
      stagesBadge: "EDUCATIONAL STAGES",
      stagesTitle: "Structured programs tailored for each developmental age",
      stages: [
        {
          name: "First Step (Preschool Readiness)",
          age: "Ages 5–7",
          highlight: "Gentle and engaging transition into school life",
          items: [
            "Speech development and foundational phonics",
            "Logic games, spatial reasoning, and fine motor skills",
            "Socialization in a friendly peer community",
            "Fun conversational English and rhythmics",
          ],
        },
        {
          name: "Primary Education",
          age: "Grades 1–4",
          highlight: "Strong academic foundations and talent discovery",
          items: [
            "Speed reading, neat handwriting, and mental arithmetic",
            "Interactive English (Speaking & Fun Grammar)",
            "Arabic alphabet and foundational calligraphy lessons",
            "Chess, sports clubs, and creative art workshops",
          ],
        },
        {
          name: "Middle & High Education",
          age: "Grades 5–9",
          highlight: "In-depth subjects and international examination preparation",
          items: [
            "Advanced mathematics, STEM, and natural sciences",
            "English Club, Cambridge levels (Flyers, KET, PET) & IELTS prep",
            "Arabic language grammar and conversational fluency",
            "Olympiad training and official State Graduation Certificate",
          ],
        },
      ],
      programsBadge: "SPECIALIZED ACADEMIC PATHWAYS",
      programsTitle: "Key Academic Priorities at Ziyo-Zukko",
      programs: [
        {
          title: "History & World Civilization",
          desc: "In-depth historical exploration of Uzbekistan and world civilization through interactive classes and excursions.",
          icon: Compass,
          color: "bg-amber-500/10 text-amber-600 border-amber-200",
        },
        {
          title: "English Language (Cambridge YLE & Club)",
          desc: "Interactive communication, grammar, and specialized prep for Cambridge qualifications and global contests.",
          icon: Languages,
          color: "bg-blue-500/10 text-blue-600 border-blue-200",
        },
        {
          title: "Arabic Language & Calligraphy",
          desc: "Study of classical and modern Arabic paired with exquisite traditional calligraphy instruction.",
          icon: BookOpen,
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        },
        {
          title: "Mathematics & Critical Thinking",
          desc: "Challenging Olympiad problem solving, spatial logic, and mental arithmetic training.",
          icon: Sparkles,
          color: "bg-purple-500/10 text-purple-600 border-purple-200",
        },
        {
          title: "IT & Digital Literacy",
          desc: "Modern computer laboratory classes covering coding basics, algorithmic problem solving, and digital safety.",
          icon: Dna,
          color: "bg-rose-500/10 text-rose-600 border-rose-200",
        },
        {
          title: "Sports & Physical Wellness",
          desc: "Football, Taekwondo, Chess, Gymnastics, and Athletics under the direction of experienced sports mentors.",
          icon: Activity,
          color: "bg-teal-500/10 text-teal-600 border-teal-200",
        },
      ],
      scheduleBadge: "DAILY ROUTINE",
      scheduleTitle: "A Productive Day in the Life of a Student",
      scheduleSub: "Our full-day model ensures all lessons, homework, and enrichment occur on campus without evening stress at home.",
      schedule: [
        { time: "08:30 – 09:00", title: "Morning Welcome & Warm-up", desc: "Warm teacher greeting, light morning calisthenics, and a wholesome breakfast." },
        { time: "09:00 – 13:00", title: "Core Academic Classes", desc: "Intensive academic curriculum aligned with state and proprietary standards." },
        { time: "13:00 – 14:00", title: "Hot Lunch & Outdoor Recreation", desc: "Balanced 3-course warm meal followed by supervised recess in the courtyard." },
        { time: "14:00 – 15:30", title: "Guided Study & Homework Completion", desc: "All homework completed on campus under expert subject teacher guidance." },
        { time: "15:30 – 16:00", title: "Afternoon Snack", desc: "Fresh pastries, seasonal fruits, and vitamin-rich beverages." },
        { time: "16:00 – 17:30", title: "Enrichment Clubs & Sports Sections", desc: "Chess, football, martial arts, calligraphy, arts, and foreign language clubs." },
      ],
      facilitiesBadge: "CAMPUS & FACILITIES",
      facilitiesTitle: "Modern Campus with Premium Amenities",
      facilities: [
        { title: "Bright, Ergonomic Classrooms", desc: "Natural lighting, multimedia displays, and ergonomic student desks." },
        { title: "Dedicated IT Laboratory", desc: "Equipped with modern PCs and high-speed infrastructure for digital exploration." },
        { title: "460-Seat Auditorium", desc: "Expansive stage, professional acoustic and lighting system for assemblies and performances." },
        { title: "Sports Complex & Football Pitch", desc: "Indoor athletics hall, running tracks, and high-grade artificial turf football pitch." },
        { title: "Curated Library", desc: "Comprehensive collection of classical, world literature, encyclopedias, and study guides." },
        { title: "Medical Center & Counseling", desc: "On-site school physician, nurse, child psychologist, and speech therapist." },
      ],
      safetyBadge: "SAFETY & WELLBEING",
      safetyTitle: "Your child's safety is our highest priority",
      safetyPoints: [
        "24/7 video monitoring across all classrooms, corridors, and campus perimeter",
        "Gated access with electronic turnstiles and professional security personnel",
        "Dedicated full-time medical station with qualified doctor and nurse",
        "Rigorous hygiene, sanitary standards, and nutritious halal dining",
        "Enriching field trips and educational visits to major Tashkent museums",
      ],
      ctaTitle: "Shape your child's future with ZIYO-ZUKKO today",
      ctaDesc:
        "Get in touch with our admissions team to learn more about enrollment criteria, entrance testing, and campus tours.",
      ctaButton: "Apply for Admission",
      addressText: "Tashkent city, Shaykhantakhur district, Abdulla Qodiriy str., 11 (near International Islamic Academy)",
      openMaps: "View on Google Maps",
    },
  };

  const tAbout = content[lang] || content.uz;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#071a33] selection:bg-[#ff6b00]/20 selection:text-[#ff6b00]">
      {/* Top Navbar with solid background */}
      <Navbar solidAtTop />

      <main className="pt-24 md:pt-28 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="flex items-center gap-2 text-sm text-[#071a33]/60">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-[#ff6b00] transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("home")}
            </Link>
            <span>/</span>
            <span className="text-[#071a33] font-semibold">{t("about")}</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071a33] via-[#0d2a4f] to-[#163a66] text-white p-8 md:p-14 lg:p-16 shadow-2xl">
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ff6b00]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7 space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs md:text-sm font-semibold tracking-wide text-[#ff9f43]">
                  <Sparkles className="w-4 h-4 text-[#ff6b00]" />
                  <span>{tAbout.badge}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                  {tAbout.mainTitle}
                </h1>

                <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl font-normal">
                  {tAbout.subTitle}
                </p>

                {/* Badges / Key Highlights */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="px-3.5 py-1.5 rounded-lg bg-white/10 text-white/90 text-xs font-medium border border-white/10">
                    🏛 2016-yildan buyon
                  </span>
                  <span className="px-3.5 py-1.5 rounded-lg bg-white/10 text-white/90 text-xs font-medium border border-white/10">
                    🎓 Davlat Attestati
                  </span>
                  <span className="px-3.5 py-1.5 rounded-lg bg-white/10 text-white/90 text-xs font-medium border border-white/10">
                    🇬🇧 Cambridge YLE & IELTS
                  </span>
                  <span className="px-3.5 py-1.5 rounded-lg bg-white/10 text-white/90 text-xs font-medium border border-white/10">
                    ✍️ Arab tili & Xattotlik
                  </span>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    href="/#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("contact");
                    }}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold text-sm shadow-lg shadow-[#ff6b00]/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>{tAbout.quickApply}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="tel:+998712443581"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all"
                  >
                    <Phone className="w-4 h-4 text-[#ff9f43]" />
                    <span>+998 71 244 35 81</span>
                  </a>
                </div>
              </motion.div>

              {/* Right Column: Hero Image with Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:col-span-5 relative"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/15">
                  <Image
                    src="/data/maktab_binosi.png"
                    alt="ZIYO-ZUKKO maktab binosi"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-xs uppercase tracking-widest text-[#ff9f43] font-bold">
                      Toshkent shahar, Shayxontohur tumani
                    </p>
                    <h3 className="text-lg font-bold">ZIYO-ZUKKO Zamonaviy Kampusi</h3>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* METRICS / STATS GRID */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b00]">
              {tAbout.statsTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071a33] mt-2">
              Sifatli ta&apos;lim va qulay shart-sharoit kafolati
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tAbout.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all group hover:border-[#ff6b00]/30"
              >
                <div className="text-3xl sm:text-4xl font-black text-[#071a33] tracking-tight group-hover:text-[#ff6b00] transition-colors">
                  {stat.value}
                </div>
                <div className="text-base font-bold text-slate-800 mt-2">{stat.label}</div>
                <div className="text-sm text-slate-500 mt-1 leading-relaxed">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PHILOSOPHY & ISLAMIC ACADEMY AFFILIATION */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/80 shadow-sm">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b00]">
                {tAbout.missionBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071a33] mt-3 leading-tight">
                {tAbout.missionTitle}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
                {tAbout.missionDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tAbout.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#071a33] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#071a33] mb-2">{pillar.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote block */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-[#ff6b00]">
              <p className="text-base sm:text-lg italic font-medium text-slate-800 leading-relaxed">
                &ldquo;Yangi O&apos;zbekistonning asosiy ustuni – bilim, ta&apos;lim va tarbiya bo&apos;ladi!&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm text-slate-600 font-semibold">
                <span>Shavkat Mirziyoyev — O&apos;zbekiston Respublikasi Prezidenti</span>
                <span className="text-[#ff6b00]">ZIYO-ZUKKO ta&apos;lim dasturi</span>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATIONAL STAGES */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b00]">
              {tAbout.stagesBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071a33] mt-2">
              {tAbout.stagesTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tAbout.stages.map((stage, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3.5 py-1 rounded-full bg-[#071a33]/5 text-[#071a33] text-xs font-bold uppercase tracking-wide">
                      {stage.age}
                    </span>
                    <GraduationCap className="w-6 h-6 text-[#ff6b00]" />
                  </div>

                  <h3 className="text-xl font-extrabold text-[#071a33] mb-2">{stage.name}</h3>
                  <p className="text-xs font-semibold text-[#ff6b00] uppercase tracking-wide mb-6">
                    {stage.highlight}
                  </p>

                  <div className="space-y-3.5 pt-2 border-t border-slate-100">
                    {stage.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link
                    href="/#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("contact");
                    }}
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-[#ff6b00] hover:text-white text-slate-700 transition-colors"
                  >
                    Ariza topshirish →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* IN-DEPTH SUBJECTS & PROGRAMS */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b00]">
              {tAbout.programsBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071a33] mt-2">
              {tAbout.programsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tAbout.programs.map((prog, idx) => {
              const IconComp = prog.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${prog.color}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#071a33] mb-2">{prog.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{prog.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* DAILY SCHEDULE TIMELINE */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-[#071a33] rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mb-12 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f43]">
                {tAbout.scheduleBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-3">
                {tAbout.scheduleTitle}
              </h2>
              <p className="text-white/70 text-base mt-3 leading-relaxed">
                {tAbout.scheduleSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {tAbout.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ff6b00]/20 text-[#ff9f43] text-xs font-bold tracking-wider mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.time}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAMPUS FACILITIES */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b00]">
              {tAbout.facilitiesBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071a33] mt-2">
              {tAbout.facilitiesTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tAbout.facilities.map((fac, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-[#ff6b00]/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff6b00] flex items-center justify-center font-bold text-sm mb-4">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#071a33] mb-2">{fac.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{fac.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SAFETY & HEALTH */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-gradient-to-br from-slate-900 to-[#071a33] rounded-3xl p-8 sm:p-12 lg:p-14 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff9f43]">
                  {tAbout.safetyBadge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {tAbout.safetyTitle}
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  Har bir ota-ona o&apos;z farzandining xavfsizligi va salomatligi uchun to&apos;liq xotirjam bo&apos;lishi bizning eng ustuvor burchimizdir.
                </p>

                <div className="space-y-3 pt-4">
                  {tAbout.safetyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/85 leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <Utensils className="w-8 h-8 text-[#ff9f43] mb-3" />
                    <h4 className="text-base font-bold text-white mb-1">3 Mahal Halol Taom</h4>
                    <p className="text-xs text-white/70">
                      Sifatli, yangi mahsulotlar va sanitariya nazorati.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
                    <h4 className="text-base font-bold text-white mb-1">24/7 Qo&apos;riqlash</h4>
                    <p className="text-xs text-white/70">
                      Yopiq hudud, turniket va professional xavfsizlik.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <HeartHandshake className="w-8 h-8 text-rose-400 mb-3" />
                    <h4 className="text-base font-bold text-white mb-1">Psixolog & Logoped</h4>
                    <p className="text-xs text-white/70">
                      Har bir bolaning emotsional va nutqiy rivojlanishi.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                    <Users className="w-8 h-8 text-blue-400 mb-3" />
                    <h4 className="text-base font-bold text-white mb-1">Sinf Tyutori</h4>
                    <p className="text-xs text-white/70">
                      Kun davomida bolalar tartibi va tarbiyasini kuzatuvchi mas&apos;ul.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM ADMISSIONS CALL TO ACTION */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-200/80 shadow-md text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b00]">
              QABUL JARAYONI
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071a33] mt-2 max-w-2xl mx-auto">
              {tAbout.ctaTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
              {tAbout.ctaDesc}
            </p>

            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              <Link
                href="/#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
                className="px-8 py-4 rounded-xl bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold text-sm shadow-lg shadow-[#ff6b00]/30 transition-all transform hover:-translate-y-0.5"
              >
                {tAbout.ctaButton}
              </Link>
              <a
                href="tel:+998712443581"
                className="px-8 py-4 rounded-xl bg-[#071a33] hover:bg-[#0d2a4f] text-white font-semibold text-sm transition-all"
              >
                +998 71 244 35 81
              </a>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff6b00]" />
                <span>{tAbout.addressText}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <a
                href="https://www.google.com/maps?q=41.3237234294552,69.25740194417808"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#ff6b00] font-semibold hover:underline"
              >
                <span>{tAbout.openMaps}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
