import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - Ziyo Zukko",
  description: "Ziyo Zukko maktabi admin paneli",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
