import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { InsforgeProvider } from "./providers";
import SmoothScroll from "@/components/core/SmoothScroll";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";
import { ADSENSE_PUBLISHER_ID } from "@/lib/adsense";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ZoePic | Convertidor WebP con IA — Optimiza tus Imágenes",
    template: "%s | ZoePic",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
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
  other: {
    "google-adsense-account": ADSENSE_PUBLISHER_ID,
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
