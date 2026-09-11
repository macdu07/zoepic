"use client";

import { useEffect } from "react";
import { ADSENSE_ENABLED, ADSENSE_PUBLISHER_ID } from "@/lib/adsense";

declare global {
  interface Window { adsbygoogle?: Record<string, unknown>[]; }
}

interface AdSlotProps { slot?: string; label?: string; }

export function AdSlot({ slot, label = "Anuncio" }: AdSlotProps) {
  useEffect(() => {
    if (!ADSENSE_ENABLED || !slot) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, [slot]);

  if (!ADSENSE_ENABLED || !slot) return null;

  return (
    <aside className="my-12 border-y border-border/70 py-5" aria-label={label}>
      <p className="mb-3 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <ins
        className="adsbygoogle block min-h-[100px]"
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
