import KeyboardScroll from "@/components/KeyboardScroll";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import NewsSection from "@/components/NewsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import UniversitiesSection from "@/components/UniversitiesSection";
import ResultsSection from "@/components/ResultsSection";
import OlympiadsSection from "@/components/OlympiadsSection";
import GallerySection from "@/components/GallerySection";
import AdmissionsSection from "@/components/AdmissionsSection";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  return (
    <main className="relative w-full overflow-x-clip bg-[#f8fafc]">
      <div style={{ zoom: "120%" }}>
        <Navbar />
      </div>

      {/* 1. Main Hero Keyboard Scroll Animation */}
      <div id="home">
        <KeyboardScroll />
      </div>

      {/* 2. About & President Section */}
      <AboutSection />

      {/* 3. News Section */}
      <NewsSection />

      {/* 4. Parent Testimonials (Shorts style) */}
      <TestimonialsSection />

      {/* 5. Graduates & University Marquee */}
      <UniversitiesSection />

      {/* 6. Results & Certificates Stats */}
      <ResultsSection />

      {/* 7. Olympiad Winners (Dark Theme) */}
      <OlympiadsSection />

      {/* 8. Photo Gallery */}
      <GallerySection />

      {/* 9. Qabul 2026–2027 Section */}
      <AdmissionsSection />

      {/* 10. FAQ Section */}
      <FaqSection />

      {/* 11. Bog'lanish & Maps Section */}
      <ContactSection />

      {/* 12. Site Footer */}
      <Footer />

      {/* Global Scroll to Top Button */}
      <ScrollToTop />
    </main>
  );
}
