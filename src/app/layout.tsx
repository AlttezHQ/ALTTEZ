import type { Metadata } from "next";
import { Inter, Sora, Geist, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

// Marca ALTTEZ v1.1: Manrope (tipografía oficial) + JetBrains Mono (datos/números)
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
    <html lang="es" suppressHydrationWarning className={"font-sans " + geist.variable}>
      <body className={`${inter.variable} ${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased`} style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
