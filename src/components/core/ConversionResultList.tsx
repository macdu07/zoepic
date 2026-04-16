"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, XCircle } from "lucide-react";
import {
  formatBytes,
  type ImageMetadata,
  type WebPConversionResult,
} from "@/lib/imageUtils";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

export interface ConversionItem {
  id: string;
  originalFile: File;
  originalMetadata: ImageMetadata | null;
  convertedResult: WebPConversionResult | null;
  finalName: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

interface ConversionResultListProps {
  items: ConversionItem[];
  compressionQuality: number;
  useAiForName: boolean;
}

export function ConversionResultList({
  items,
  compressionQuality,
  useAiForName,
}: ConversionResultListProps) {
  const { toast } = useToast();

  const handleDownload = (item: ConversionItem) => {
    if (!item.convertedResult?.dataUrl || !item.finalName) {
      toast({
        title: "Error de Descarga",
        description: "No hay imagen convertida válida para descargar.",
        variant: "destructive",
      });
      return;
    }
    const link = document.createElement("a");
    link.href = item.convertedResult.dataUrl;
    link.download = item.finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Descarga Iniciada",
      description: `Descargando ${item.finalName}`,
    });
  };

  const handleDownloadAll = async () => {
    const completedItems = items.filter(
      (item) => item.status === "done" && item.convertedResult?.dataUrl,
    );
    if (completedItems.length === 0) {
      toast({
        title: "Sin imágenes",
        description: "No hay imágenes convertidas para descargar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const zip = new JSZip();
      for (const item of completedItems) {
        // dataUrl is "data:image/webp;base64,..."
        const base64 = item.convertedResult!.dataUrl.split(",")[1];
        zip.file(item.finalName, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "zoepic-imagenes.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Descarga Lista",
        description: `${completedItems.length} imagen(es) empaquetadas en ZIP.`,
      });
    } catch {
      toast({
        title: "Error al crear ZIP",
        description: "No se pudo empaquetar las imágenes.",
        variant: "destructive",
      });
    }
  };

  const completedCount = items.filter((item) => item.status === "done").length;
  const errorCount = items.filter((item) => item.status === "error").length;
  const processingCount = items.filter(
    (item) => item.status === "processing",
  ).length;

  if (items.length === 0) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Resultados de Conversión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Sube imágenes y haz clic en "Convertir" para ver los resultados aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">
            Resultados de Conversión
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1" aria-live="polite">
            {completedCount}/{items.length} completadas
            {errorCount > 0 && ` • ${errorCount} error(es)`}
          </p>
        </div>
        {completedCount > 1 && (
          <Button
            onClick={handleDownloadAll}
            variant="outline"
            size="sm"
            disabled={processingCount > 0}
            aria-label={`Descargar las ${completedCount} imágenes convertidas como ZIP`}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Descargar ZIP ({completedCount})
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
          >
            {/* Thumbnail */}
            <div
              className="w-16 h-16 rounded-md overflow-hidden bg-background flex-shrink-0"
              aria-hidden="true"
            >
              {item.convertedResult?.dataUrl ? (
                <img
                  src={item.convertedResult.dataUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : item.originalMetadata?.dataUrl ? (
                <img
                  src={item.originalMetadata.dataUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <p
                className="text-sm font-medium truncate"
                title={item.finalName}
              >
                {item.status === "processing"
                  ? "Procesando..."
                  : item.status === "pending"
                    ? item.originalFile.name
                    : item.finalName}
              </p>
              {item.status === "done" &&
                item.originalMetadata &&
                item.convertedResult && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>
                      {formatBytes(item.originalMetadata.sizeBytes)} →{" "}
                      {formatBytes(item.convertedResult.sizeBytes)}
                    </span>
                    <span className="text-green-500 font-medium">
                      -
                      {Math.round(
                        (1 -
                          item.convertedResult.sizeBytes /
                            item.originalMetadata.sizeBytes) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                )}
              {item.status === "error" && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {item.error || "Error desconocido"}
                </p>
              )}
              {item.status === "processing" && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  Procesando imagen...
                </p>
              )}
            </div>

            {/* Status Icon / Action */}
            <div className="flex-shrink-0">
              {item.status === "processing" && (
                <Loader2
                  className="h-5 w-5 animate-spin text-primary"
                  aria-label="Procesando"
                />
              )}
              {item.status === "done" && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDownload(item)}
                  className="h-8 w-8"
                  aria-label={`Descargar ${item.finalName}`}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
              {item.status === "error" && (
                <XCircle className="h-5 w-5 text-destructive" aria-label="Error" />
              )}
              {item.status === "pending" && (
                <div
                  className="h-5 w-5 rounded-full border-2 border-muted-foreground/30"
                  aria-label="En espera"
                />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
