import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZIYO-ZUKKO — Xususiy Maktab",
  description: "ZIYO-ZUKKO xususiy maktabi — Bilim, tarbiya va kelajak bir maskanda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc] text-[#071a33]">
        {children}
      </body>
    </html>
  );
}
