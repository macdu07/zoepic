"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import {
  generateImageName,
  type GenerateImageNameInput,
} from "@/ai/flows/generate-image-name";
import {
  getImageMetadata,
  convertToWebP,
  formatBytes,
  type ImageMetadata,
  type WebPConversionResult,
} from "@/lib/imageUtils";
import { checkUsageLimit, logConversion, getUserProfile } from "@/lib/usage";
import { type UsageCheck } from "@/lib/usage-types";
import { ImageUploader } from "./ImageUploader";
import { ConversionControls } from "./ConversionControls";
import {
  ConversionResultList,
  type ConversionItem,
} from "./ConversionResultList";
import { useSession } from "@/lib/auth-client";

// Number of images to process concurrently
const CONCURRENCY_LIMIT = 4;

export default function ConversionPage() {
  const { data: sessionData, isPending: isLoadedResponse } = useSession();
  const user = sessionData?.user as any;
  const isLoaded = !isLoadedResponse;
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversionItems, setConversionItems] = useState<ConversionItem[]>([]);
  const [prefix, setPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(90);
  const [language, setLanguage] = useState<"spanish" | "english">("spanish");
  const [useAiForName, setUseAiForName] = useState(true);
  const [brandPrompt, setBrandPrompt] = useState("");
  const [useSuffix, setUseSuffix] = useState(false);
  const [maxBatchSize, setMaxBatchSize] = useState(5);
  const { toast } = useToast();

  // Load user profile to get batch size limit
  useEffect(() => {
    if (isLoaded && user) {
      getUserProfile(user.id).then((profile) => {
        if (profile) {
          setMaxBatchSize(profile.max_batch_size);
        }
      });
    }
  }, [isLoaded, user]);

  const handleFilesSelect = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setConversionItems([]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setConversionItems([]);
  }, []);

  const processImage = async (
    file: File,
    itemId: string,
    currentPrefix: string,
    currentQuality: number,
    currentLanguage: "spanish" | "english",
    currentUseAi: boolean,
    currentUseSuffix: boolean,
    currentBrandPrompt: string,
  ): Promise<Partial<ConversionItem>> => {
    try {
      const metadata = await getImageMetadata(file);

      setConversionItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, originalMetadata: metadata, status: "processing" }
            : item,
        ),
      );

      const webpResult = await convertToWebP(metadata, {
        quality: currentQuality / 100,
      });

      let finalBaseName = "imagen-convertida";

      if (currentUseAi) {
        try {
          const smallImage = await convertToWebP(metadata, {
            targetWidth: 512,
            quality: 0.6,
          });
          const aiInput: GenerateImageNameInput = {
            photoDataUri: smallImage.dataUrl,
            language: currentLanguage,
            ...(currentBrandPrompt.trim() && { brandPrompt: currentBrandPrompt.trim() }),
          };
          const aiOutput = await generateImageName(aiInput);
          let generatedName = aiOutput.filename;
          if (currentPrefix.trim()) {
            generatedName = `${currentPrefix
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")}-${generatedName}`;
          }
          finalBaseName = generatedName;
        } catch (aiError) {
          console.error("AI naming error:", aiError);
          const lastDotIndex = file.name.lastIndexOf(".");
          finalBaseName = file.name
            .substring(0, lastDotIndex)
            .toLowerCase()
            .replace(/\s+/g, "-");
          if (currentPrefix.trim()) {
            finalBaseName = `${currentPrefix
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-")}-${finalBaseName}`;
          }
        }
      } else {
        const trimmedPrefix = currentPrefix.trim().toLowerCase().replace(/\s+/g, "-");
        if (trimmedPrefix) {
          finalBaseName = trimmedPrefix;
        } else {
          const lastDotIndex = file.name.lastIndexOf(".");
          finalBaseName = file.name
            .substring(0, lastDotIndex)
            .toLowerCase()
            .replace(/\s+/g, "-");
        }
      }

      let finalName: string;
      if (currentUseSuffix) {
        const now = new Date();
        const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
        const randomPart = String(Math.floor(Math.random() * 100000)).padStart(
          5,
          "0",
        );
        finalName = `${finalBaseName}-${datePart}-${randomPart}.webp`;
      } else {
        finalName = `${finalBaseName}.webp`;
      }

      return {
        originalMetadata: metadata,
        convertedResult: webpResult,
        finalName,
        status: "done",
      };
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "Error desconocido al procesar.";
      return {
        status: "error",
        error: errorMsg,
      };
    }
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Sin imágenes",
        description: "Por favor, sube al menos una imagen.",
        variant: "destructive",
      });
      return;
    }

    // Check usage limits if user is authenticated and AI is being used
    if (user && useAiForName) {
      const usageCheck = await checkUsageLimit(
        user.id,
        selectedFiles.length,
        true,
      );
      if (!usageCheck.allowed) {
        toast({
          title: "Límite alcanzado",
          description: `Has usado ${usageCheck.used} de ${usageCheck.limit} conversiones IA este mes. Te quedan ${usageCheck.remaining}. Desactiva la IA o actualiza tu plan.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    // Capture settings at the moment of conversion
    const snapshotPrefix = prefix;
    const snapshotQuality = compressionQuality;
    const snapshotLanguage = language;
    const snapshotUseAi = useAiForName;
    const snapshotUseSuffix = useSuffix;
    const snapshotBrandPrompt = brandPrompt;

    const initialItems: ConversionItem[] = selectedFiles.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      originalFile: file,
      originalMetadata: null,
      convertedResult: null,
      finalName: file.name,
      status: "pending",
    }));
    setConversionItems(initialItems);

    // Process images in parallel batches
    const processWithConcurrency = async (items: ConversionItem[]) => {
      const results: Array<{ id: string; result: Partial<ConversionItem> }> = [];

      for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
        const batch = items.slice(i, i + CONCURRENCY_LIMIT);

        // Mark batch as processing
        setConversionItems((prev) =>
          prev.map((item) =>
            batch.some((b) => b.id === item.id)
              ? { ...item, status: "processing" }
              : item,
          ),
        );

        const batchResults = await Promise.all(
          batch.map(async (item) => ({
            id: item.id,
            result: await processImage(
              item.originalFile,
              item.id,
              snapshotPrefix,
              snapshotQuality,
              snapshotLanguage,
              snapshotUseAi,
              snapshotUseSuffix,
              snapshotBrandPrompt,
            ),
          })),
        );

        // Apply batch results
        setConversionItems((prev) =>
          prev.map((item) => {
            const found = batchResults.find((r) => r.id === item.id);
            return found ? { ...item, ...found.result } : item;
          }),
        );

        results.push(...batchResults);
      }

      return results;
    };

    await processWithConcurrency(initialItems);

    setIsLoading(false);

    // Log the conversion
    if (user) {
      await logConversion(user.id, selectedFiles.length, useAiForName);
    }

    toast({
      title: "Conversión Completada",
      description: `Se procesaron ${selectedFiles.length} imagen(es).`,
    });
  };

  // Only clears files and results — preserves user settings
  const handleClearFiles = () => {
    setSelectedFiles([]);
    setConversionItems([]);
    toast({
      title: "Archivos Eliminados",
      description: "Puedes subir nuevas imágenes. Tu configuración se mantiene.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Controls & Info */}
        <Card className="shadow-lg bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Convierte tus imágenes a WebP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUploader
              selectedFiles={selectedFiles}
              onFilesSelect={handleFilesSelect}
              onRemoveFile={handleRemoveFile}
              onError={(msg) => {
                toast({
                  title: "Error",
                  description: msg,
                  variant: "destructive",
                });
              }}
              onClear={handleClearFiles}
              maxFiles={maxBatchSize}
            />

            <ConversionControls
              useAiForName={useAiForName}
              setUseAiForName={setUseAiForName}
              prefix={prefix}
              setPrefix={setPrefix}
              brandPrompt={brandPrompt}
              setBrandPrompt={setBrandPrompt}
              useSuffix={useSuffix}
              setUseSuffix={setUseSuffix}
              language={language}
              setLanguage={setLanguage}
              compressionQuality={compressionQuality}
              setCompressionQuality={setCompressionQuality}
              onConvert={handleConvert}
              onClearFiles={handleClearFiles}
              isLoading={isLoading}
              hasFile={selectedFiles.length > 0}
              hasResult={conversionItems.length > 0}
            />
          </CardContent>
        </Card>

        {/* Right Column: Results List */}
        <ConversionResultList
          items={conversionItems}
          compressionQuality={compressionQuality}
          useAiForName={useAiForName}
        />
      </div>
    </div>
  );
}
