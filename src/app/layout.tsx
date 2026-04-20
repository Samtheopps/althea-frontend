import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import LayoutShell from '@/components/layout/LayoutShell';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Althea Systems - Équipements Médicaux Professionnels",
  description: "Fournisseur d'équipements médicaux de pointe pour professionnels de santé. Diagnostic, instruments, mobilier médical, stérilisation et consommables.",
  keywords: "équipement médical, matériel médical, stéthoscope, échographe, autoclave, mobilier médical",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
