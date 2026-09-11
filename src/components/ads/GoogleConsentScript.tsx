"use client";

import { useEffect } from "react";
import { ADSENSE_PUBLISHER_ID, GOOGLE_CMP_ENABLED } from "@/lib/adsense";

const SCRIPT_ID = "zoepic-google-funding-choices";

export type GoogleFcCallbackQueue = Array<unknown> & {
  push: (...commands: unknown[]) => number;
};

export interface GoogleFcApi {
  callbackQueue?: GoogleFcCallbackQueue;
  showRevocationMessage?: () => void;
}

declare global {
  interface Window {
    googlefc?: GoogleFcApi;
  }
}

function getFundingChoicesPublisherId(): string {
  return ADSENSE_PUBLISHER_ID.replace(/^ca-/, "");
}

export function GoogleConsentScript() {
  useEffect(() => {
    if (!GOOGLE_CMP_ENABLED || document.getElementById(SCRIPT_ID)) return;

    const googlefc = (window.googlefc = window.googlefc || {});
    googlefc.callbackQueue = googlefc.callbackQueue || ([] as unknown as GoogleFcCallbackQueue);

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://fundingchoicesmessages.google.com/i/${getFundingChoicesPublisherId()}?ers=1`;
    script.onerror = () => {
      window.dispatchEvent(new Event("zoepic:consent-unavailable"));
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
