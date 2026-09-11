"use client";

import { useEffect, useState } from "react";
import { GOOGLE_CMP_ENABLED } from "@/lib/adsense";

export function PrivacyChoices() {
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const handleUnavailable = () => setUnavailable(true);
    window.addEventListener("zoepic:consent-unavailable", handleUnavailable);
    return () =>
      window.removeEventListener("zoepic:consent-unavailable", handleUnavailable);
  }, []);

  const openChoices = () => {
    const googlefc = window.googlefc;
    if (googlefc?.callbackQueue && googlefc.showRevocationMessage) {
      googlefc.callbackQueue.push(googlefc.showRevocationMessage);
      return;
    }

    if (googlefc?.callbackQueue) {
      googlefc.callbackQueue.push({
        CONSENT_API_READY: () => {
          const readyGooglefc = window.googlefc;
          if (readyGooglefc?.callbackQueue && readyGooglefc.showRevocationMessage) {
            readyGooglefc.callbackQueue.push(readyGooglefc.showRevocationMessage);
            return;
          }
          setUnavailable(true);
        },
      });
      return;
    }

    setUnavailable(true);
  };

  return (
    <div>
      <button type="button" onClick={openChoices} aria-haspopup="dialog" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        Configuración de privacidad y cookies
      </button>
      {unavailable && (
        <p role="status" className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
          {GOOGLE_CMP_ENABLED
            ? <>Las preferencias de Google no están disponibles ahora. <a href="/politica-de-privacidad#cookies-publicidad" className="underline underline-offset-2">Consulta la política de privacidad</a> o inténtalo de nuevo más tarde.</>
            : <>La CMP de Google aún no está habilitada. <a href="/politica-de-privacidad#cookies-publicidad" className="underline underline-offset-2">Consulta la política de privacidad</a> mientras se completa la configuración.</>}
        </p>
      )}
    </div>
  );
}
