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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://zepic.online"),
  title: "ZoePic",
  description:
    "Conversión Inteligente de Imágenes a WebP — optimiza tus imágenes automáticamente con calidad profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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
