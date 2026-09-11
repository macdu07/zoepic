"use client";

import { useEffect, useState } from "react";

const SOURCE_PATH = "/guides/zoepic-muestra-producto.png";
const SOURCE_BYTES = 21369;

function formatBytes(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

export function MeasuredExample() {
  const [result, setResult] = useState<{ href: string; sizeBytes: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | undefined;
    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const context = canvas.getContext("2d");
      if (!context) {
        setError(true);
        return;
      }
      context.drawImage(image, 0, 0, 1200, 800);
      canvas.toBlob((blob) => {
        if (!blob) {
          setError(true);
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setResult({ href: objectUrl, sizeBytes: blob.size });
      }, "image/webp", 0.82);
    };
    image.onerror = () => setError(true);
    image.src = SOURCE_PATH;

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div className="border-t border-white/10 px-5 py-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-white/60">Prueba medida en este navegador</p>
          <p className="mt-1 font-medium">zoepic-muestra-producto.png</p>
        </div>
        <div className="flex items-center gap-2 font-semibold tabular-nums text-[#a9d9b9]" aria-live="polite">
          <span>{formatBytes(SOURCE_BYTES)} PNG</span>
          <span className="text-white/40">→</span>
          <span>{result ? `${formatBytes(result.sizeBytes)} WebP` : error ? "no disponible" : "calculando…"}</span>
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/55">
        1200 × 800 px · calidad 82 · conversión local. El peso final puede cambiar según el navegador.
      </p>
      {result && (
        <a href={result.href} download="zoepic-muestra-producto.webp" className="mt-3 inline-flex text-xs font-semibold text-[#a9d9b9] underline-offset-4 hover:underline">
          Descargar resultado WebP
        </a>
      )}
    </div>
  );
}
