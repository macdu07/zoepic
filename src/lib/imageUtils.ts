"use client";

export const MAX_CUSTOM_DIMENSION = 4096;

export type ResizeMode = "original" | "preset" | "aspect-ratio" | "custom";

export interface ImageSizingSettings {
  mode: ResizeMode;
  targetWidth?: number;
  targetHeight?: number;
  aspectRatio?: number;
  cropPosition: "center";
  allowUpscale: boolean;
}

export interface ImageSizePreset {
  id: string;
  name: string;
  category: "web" | "social";
  width: number;
  height: number;
  aspectRatio: number;
}

export interface AspectRatioPreset {
  id: string;
  label: string;
  value: number;
}

export const IMAGE_SIZE_PRESETS: ImageSizePreset[] = [
  { id: "web-hero", name: "Hero", category: "web", width: 1920, height: 1080, aspectRatio: 16 / 9 },
  { id: "web-wide-banner", name: "Banner ancho", category: "web", width: 1920, height: 600, aspectRatio: 16 / 5 },
  { id: "web-open-graph", name: "Open Graph", category: "web", width: 1200, height: 630, aspectRatio: 40 / 21 },
  { id: "web-card", name: "Card / blog", category: "web", width: 1200, height: 800, aspectRatio: 3 / 2 },
  { id: "web-thumbnail", name: "Miniatura", category: "web", width: 800, height: 450, aspectRatio: 16 / 9 },
  { id: "web-avatar", name: "Avatar", category: "web", width: 400, height: 400, aspectRatio: 1 },
  { id: "social-square-post", name: "Post cuadrado", category: "social", width: 1080, height: 1080, aspectRatio: 1 },
  { id: "social-portrait-post", name: "Post vertical", category: "social", width: 1080, height: 1350, aspectRatio: 4 / 5 },
  { id: "social-story", name: "Story / reel", category: "social", width: 1080, height: 1920, aspectRatio: 9 / 16 },
  { id: "social-video-thumbnail", name: "Miniatura de video", category: "social", width: 1280, height: 720, aspectRatio: 16 / 9 },
];

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  { id: "1:1", label: "1:1 · Cuadrado", value: 1 },
  { id: "4:3", label: "4:3 · Clásico", value: 4 / 3 },
  { id: "3:4", label: "3:4 · Clásico vertical", value: 3 / 4 },
  { id: "3:2", label: "3:2 · Fotografía", value: 3 / 2 },
  { id: "2:3", label: "2:3 · Fotografía vertical", value: 2 / 3 },
  { id: "16:9", label: "16:9 · Panorámico", value: 16 / 9 },
  { id: "9:16", label: "9:16 · Vertical", value: 9 / 16 },
  { id: "4:5", label: "4:5 · Retrato", value: 4 / 5 },
  { id: "21:9", label: "21:9 · Ultra panorámico", value: 21 / 9 },
];

export interface ImageMetadata {
  dataUrl: string;
  sizeBytes: number;
  type: string;
  name: string;
  width: number;
  height: number;
}

export interface WebPConversionResult {
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export interface ConvertToWebPOptions {
  targetMaxKB?: number;
  quality?: number;
  targetWidth?: number;
  targetHeight?: number;
  aspectRatio?: number;
}

interface CropRectangle {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

export function getCenteredCropRectangle(
  sourceWidth: number,
  sourceHeight: number,
  targetAspectRatio: number,
): CropRectangle {
  const sourceAspectRatio = sourceWidth / sourceHeight;

  if (sourceAspectRatio > targetAspectRatio) {
    const cropWidth = sourceHeight * targetAspectRatio;
    return {
      sourceX: (sourceWidth - cropWidth) / 2,
      sourceY: 0,
      sourceWidth: cropWidth,
      sourceHeight,
    };
  }

  const cropHeight = sourceWidth / targetAspectRatio;
  return {
    sourceX: 0,
    sourceY: (sourceHeight - cropHeight) / 2,
    sourceWidth,
    sourceHeight: cropHeight,
  };
}

export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl,
          sizeBytes: file.size,
          type: file.type,
          name: file.name,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function convertToWebP(
  originalImage: { dataUrl: string; width: number; height: number },
  options: ConvertToWebPOptions = {},
): Promise<WebPConversionResult> {
  const { quality = 0.95, targetWidth, targetHeight, aspectRatio } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo preparar el lienzo de conversión."));
        return;
      }

      let outputWidth = originalImage.width;
      let outputHeight = originalImage.height;
      let crop: CropRectangle = {
        sourceX: 0,
        sourceY: 0,
        sourceWidth: originalImage.width,
        sourceHeight: originalImage.height,
      };

      if (targetWidth && targetHeight) {
        outputWidth = Math.round(targetWidth);
        outputHeight = Math.round(targetHeight);
        crop = getCenteredCropRectangle(
          originalImage.width,
          originalImage.height,
          outputWidth / outputHeight,
        );
      } else if (aspectRatio) {
        crop = getCenteredCropRectangle(
          originalImage.width,
          originalImage.height,
          aspectRatio,
        );
        outputWidth = Math.max(1, Math.round(crop.sourceWidth));
        outputHeight = Math.max(1, Math.round(outputWidth / aspectRatio));
      } else if (targetWidth && originalImage.width > targetWidth) {
        outputWidth = Math.round(targetWidth);
        outputHeight = Math.max(
          1,
          Math.round(targetWidth * (originalImage.height / originalImage.width)),
        );
      } else if (targetHeight && originalImage.height > targetHeight) {
        outputHeight = Math.round(targetHeight);
        outputWidth = Math.max(
          1,
          Math.round(targetHeight * (originalImage.width / originalImage.height)),
        );
      }

      canvas.width = outputWidth;
      canvas.height = outputHeight;
      ctx.drawImage(
        img,
        crop.sourceX,
        crop.sourceY,
        crop.sourceWidth,
        crop.sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      const webpDataUrl = canvas.toDataURL("image/webp", quality);
      const blob = dataURLtoBlob(webpDataUrl);

      resolve({
        dataUrl: webpDataUrl,
        sizeBytes: blob.size,
        width: outputWidth,
        height: outputHeight,
      });
    };
    img.onerror = () => reject(new Error("No se pudo cargar la imagen para convertirla."));
    img.src = originalImage.dataUrl;
  });
}

function dataURLtoBlob(dataurl: string): Blob {
  const parts = dataurl.split(",");
  if (parts.length < 2) throw new Error("Data URL inválida");
  const mimeMatch = parts[0].match(/:(.*?);/);
  if (!mimeMatch || mimeMatch.length < 2) {
    throw new Error("No se pudo identificar el tipo de la imagen");
  }
  const mime = mimeMatch[1];
  const binary = atob(parts[1]);
  let index = binary.length;
  const bytes = new Uint8Array(index);
  while (index--) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const unit = 1024;
  const decimalPlaces = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(unit));
  return `${parseFloat((bytes / Math.pow(unit, sizeIndex)).toFixed(decimalPlaces))} ${sizes[sizeIndex]}`;
}
