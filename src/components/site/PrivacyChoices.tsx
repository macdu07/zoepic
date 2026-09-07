"use client";

declare global {
  interface Window {
    googleFC?: { prompt: (options: Record<string, unknown>) => void };
  }
}

export function PrivacyChoices() {
  const openChoices = () => {
    if (window.googleFC?.prompt) {
      window.googleFC.prompt({ consent: window.googleFC, expireCache: true });
      return;
    }
    window.location.href = "/politica-de-privacidad#cookies-publicidad";
  };

  return <button type="button" onClick={openChoices} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Privacidad y cookies</button>;
}
