import { type ReactNode } from "react";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { GoogleConsentScript } from "@/components/ads/GoogleConsentScript";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function PublicShell({ children, ads = false, consent = true }: { children: ReactNode; ads?: boolean; consent?: boolean }) {
  return <div className="min-h-screen bg-background text-foreground">{consent && <GoogleConsentScript />}{ads && <AdSenseScript />}<PublicHeader />{children}<PublicFooter /></div>;
}
