"use client";

import { useEffect } from "react";
import { ADSENSE_PUBLISHER_ID } from "@/lib/adsense";

const SCRIPT_ID = "zoepic-adsense";

export function AdSenseScript() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
    document.head.appendChild(script);

    return () => { document.getElementById(SCRIPT_ID)?.remove(); };
  }, []);

  return null;
}
