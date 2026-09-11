"use client";

import { useEffect, useState } from "react";

interface GuideExperimentProps {
  sourcePath: string;
  sourceBytes: number;
  variants: readonly GuideExperimentVariant[];
  browserLabel: string;
  title?: string;
  description?: string;
  attribution: string;
  methodology: string;
  limitations: string;
}

export interface GuideExperimentVariant {
  label: string;
  width: number;
  height: number;
  quality: number;
}

interface ConversionResult {
  variant: GuideExperimentVariant;
  href: string;
  sizeBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function GuideExperiment({
  sourcePath,
  sourceBytes,
  variants,
  browserLabel,
  title = "Exportación del mismo archivo",
  description = "La prueba utiliza el mismo PNG para comparar distintas salidas sin subirlo a un servidor.",
  attribution,
  methodology,
  limitations,
}: GuideExperimentProps) {
  const [variantsResult, setVariantsResult] = useState<ConversionResult[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];
    const revokeObjectUrls = () => {
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      objectUrls.length = 0;
    };
    setVariantsResult([]);
    setError(false);
    const image = new window.Image();

    image.onload = async () => {
      const generated: ConversionResult[] = [];

      for (const variant of variants) {
        const canvas = document.createElement("canvas");
        canvas.width = variant.width;
        canvas.height = variant.height;
        const context = canvas.getContext("2d");

        if (!context) {
          revokeObjectUrls();
          if (!cancelled) setError(true);
          return;
        }

        context.drawImage(image, 0, 0, variant.width, variant.height);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", variant.quality / 100),
        );

        if (!blob) {
          revokeObjectUrls();
          if (!cancelled) setError(true);
          return;
        }

        const href = URL.createObjectURL(blob);
        objectUrls.push(href);
        generated.push({ variant, href, sizeBytes: blob.size });
      }

      if (!cancelled) setVariantsResult(generated);
    };
    image.onerror = () => {
      if (!cancelled) setError(true);
    };
    image.src = sourcePath;

    return () => {
      cancelled = true;
      revokeObjectUrls();
    };
  }, [sourcePath, variants]);

  const preview = variants[0] ?? { width: 1200, height: 800 };

  return (
    <figure className="my-10 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(15rem,.8fr)] md:p-6">
        <div>
          <img
            src={sourcePath}
            alt="Muestra gráfica de un producto verde en una tarjeta de catálogo"
            width={preview.width}
            height={preview.height}
            loading="lazy"
            className="aspect-[3/2] w-full rounded-xl object-cover"
          />
          <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
            {attribution} <a href={sourcePath} download className="font-semibold text-primary underline-offset-4 hover:underline">Descargar original PNG</a>.
          </figcaption>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
            Prueba reproducible
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Original PNG</dt>
              <dd className="font-semibold tabular-nums">{formatBytes(sourceBytes)}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Navegador</dt>
              <dd className="text-right font-semibold">{browserLabel}</dd>
            </div>
          </dl>
          {variantsResult.length > 0 ? (
            <div className="mt-5 space-y-3" aria-live="polite">
              {variantsResult.map(({ variant, href, sizeBytes }) => (
                <div key={`${variant.width}-${variant.height}-${variant.quality}`} className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{variant.label}</p>
                    <p className="text-xs text-muted-foreground">{variant.width} × {variant.height} px · calidad {variant.quality} · {formatBytes(sizeBytes)}</p>
                  </div>
                  <a href={href} download={`zoepic-muestra-${variant.width}x${variant.height}-q${variant.quality}.webp`} className="shrink-0 font-semibold text-primary underline-offset-4 hover:underline">Descargar</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted-foreground" role="status">
              {error
                ? "Este navegador no pudo generar la vista WebP. Puedes descargar el original y repetir la prueba en el conversor."
                : "Generando una salida WebP local para que puedas descargarla."}
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-border bg-muted/40 px-5 py-4 text-sm leading-6 text-muted-foreground md:px-6">
        <p>{methodology}</p>
        <p className="mt-1">{limitations} Comprueba siempre el archivo antes de publicarlo.</p>
      </div>
    </figure>
  );
}
