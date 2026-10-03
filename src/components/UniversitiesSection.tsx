"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduateInfoCard } from "@/components/ui/info-card";

export default function UniversitiesSection() {
  const graduates = [
    {
      id: 1,
      name: "Javlonbek Xoliqulov",
      university: "XALQARO ISLOMSHUNOSLIK AKADEMIYASI",
      status: "Grant",
      image: "/talaba_rasm.png",
    },
    {
      id: 2,
      name: "Maxmarayimov Abduhakim",
      university: "JAHON IQTISODIYOTI VA DIPLOMATIYA UNIVERSITETI",
      status: "Grant",
      image: "/talaba_rasm.png",
    },
    {
      id: 3,
      name: "Qodirov Laziz",
      university: "JAHON IQTISODIYOTI VA DIPLOMATIYA UNIVERSITETI",
      status: "Grant",
      image: "/talaba_rasm.png",
    },
    {
      id: 4,
      name: "Ahmedov Navruz",
      university: "TOSHKENT DAVLAT IQTISODIYOT UNIVERSITETI",
      status: "Grant",
      image: "/talaba_rasm.png",
    },
    {
      id: 5,
      name: "Karolberdiyev Shoxrux",
      university: "JAHON IQTISODIYOTI VA DIPLOMATIYA UNIVERSITETI",
      status: "Grant",
      image: "/talaba_rasm.png",
    },
    {
      id: 6,
      name: "Ismoilov Behruz",
      university: "TOSHKENT DAVLAT IQTISODIYOT UNIVERSITETI",
      status: "Grant",
      image: "/talaba_rasm.png",
    },
  ];

  const universityPills = [
    "Toshkent Davlat Iqtisodiyot Universiteti",
    "Jahon iqtisodiyoti va diplomatiya universiteti",
    "Jahon Tillari Universiteti",
    "O'zbekiston Milliy Universiteti",
    "Toshkent Axborot Texnologiyalari Universiteti",
    "Westminster Xalqaro Universiteti",
    "Inha Universiteti",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="graduates" className="py-24 bg-[#f8fafc] text-[#071a33] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Part 1: Circular Graduate Cards (Screenshot) */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3"
          >
            BIZNING BITIRUVCHILAR
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-tight text-[#071a33]"
          >
            ULAR ALLAQACHON <br className="hidden sm:block" />
            UNIVERSITETLARDA
          </motion.h2>
        </div>

        {/* Graduates Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
        >
          {graduates.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <GraduateInfoCard
                id={item.id}
                name={item.name}
                university={item.university}
                status={item.status}
                image={item.image}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Part 2: University Pills Marquee (Screenshot 2) */}
        <div className="pt-12 border-t border-black/10">
          <div className="text-center mb-10">
            <p className="text-[#ff6b00] font-bold text-xs md:text-sm tracking-widest uppercase mb-3">
              UNIVERSITETLAR
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#071a33]">
              O'quvchilarimiz qaysi universitetlarga kirishdi?
            </h2>
          </div>

          <div className="relative w-full overflow-hidden my-8 py-2">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f8fafc] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f8fafc] to-transparent z-10"></div>

            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex gap-4 w-max whitespace-nowrap"
            >
              {[...universityPills, ...universityPills].map((uni, idx) => (
                <div
                  key={idx}
                  className="bg-white px-7 py-4 rounded-2xl border border-black/5 shadow-sm text-sm md:text-base font-bold text-[#071a33] shrink-0"
                >
                  {uni}
                </div>
              ))}
            </motion.div>
          </div>

          <div className="text-center mt-8 flex flex-col items-center gap-5">
            <p className="text-sm md:text-base text-black/60 font-medium">
              ZIYO-ZUKKO bitiruvchilari TOP universitetlar sari dadil qadam tashlaydi
            </p>
            <Link
              href="#all-universities"
              className="inline-flex items-center gap-2 border-2 border-[#ff6b00] text-[#ff6b00] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#ff6b00] hover:text-white transition-all shadow-sm"
            >
              Barchasini ko'rish &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
