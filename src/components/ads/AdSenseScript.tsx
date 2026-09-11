"use client";

import { useEffect } from "react";
import {
  ADSENSE_ENABLED,
  ADSENSE_PUBLISHER_ID,
  ADSENSE_SLOTS,
  GOOGLE_CMP_ENABLED,
} from "@/lib/adsense";

const SCRIPT_ID = "zoepic-adsense";

export function AdSenseScript() {
  useEffect(() => {
    if (!ADSENSE_ENABLED || !GOOGLE_CMP_ENABLED || !ADSENSE_SLOTS.guide) return;

    const googlefc = (window.googlefc = window.googlefc || {});

    const loadAdSense = () => {
      if (document.getElementById(SCRIPT_ID)) return;
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
      document.head.appendChild(script);
    };

    googlefc.callbackQueue =
      googlefc.callbackQueue ||
      ([] as unknown as NonNullable<typeof googlefc.callbackQueue>);
    googlefc.callbackQueue.push({ CONSENT_DATA_READY: loadAdSense });
  }, []);

  return null;
}
