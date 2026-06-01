import type { Metadata } from "next";
import { Inter, Sora, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALTTEZ | Ecosistema Operativo Deportivo",
  description: "Organiza hoy. Escala mañana. Todos los deportes, un solo sistema.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} ${sora.variable} antialiased`} style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
