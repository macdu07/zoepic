import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { InsforgeProvider } from "./providers";
import SmoothScroll from "@/components/core/SmoothScroll";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://zoepic.online"),
  title: {
    default: "ZoePic | Convertidor WebP con IA — Optimiza tus Imágenes",
    template: "%s | ZoePic",
  },
  description:
    "Convierte JPG y PNG a WebP, ajusta dimensiones y prepara nombres descriptivos. La conversión WebP se realiza localmente en tu navegador.",
  openGraph: {
    type: "website",
    url: "https://zoepic.online",
    siteName: "ZoePic",
    title: "ZoePic | Convertidor WebP con IA",
    description:
      "Convierte imágenes a WebP, ajusta dimensiones y revisa el ahorro de cada archivo.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ZoePic — Convierte imágenes a WebP con IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZoePic | Convertidor WebP con IA",
    description: "Convierte imágenes a WebP y prepara cada lote para publicar.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${figtree.variable} antialiased font-sans`}>
        <InsforgeProvider>
          <SmoothScroll>
            {children}
            <Toaster />
          </SmoothScroll>
        </InsforgeProvider>
      </body>
    </html>
  );
}
