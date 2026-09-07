import { type ReactNode } from "react";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function PublicShell({ children, ads = false }: { children: ReactNode; ads?: boolean }) {
  return <div className="min-h-screen bg-background text-foreground">{ads && <AdSenseScript />}<PublicHeader />{children}<PublicFooter /></div>;
}
