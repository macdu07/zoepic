"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  generateImageName,
  type GenerateImageNameInput,
} from "@/ai/flows/generate-image-name";
import {
  getImageMetadata,
  convertToWebP,
  type ImageMetadata,
  type WebPConversionResult,
} from "@/lib/imageUtils";
import {
  checkUsageLimit,
  getUserProfile,
  logConversion,
} from "@/lib/usage";
import { PLANS, type UsageCheck } from "@/lib/usage-types";
import { ImageUploader } from "./ImageUploader";
import { ConversionControls } from "./ConversionControls";
import {
  ConversionResultList,
  type ConversionItem,
} from "./ConversionResultList";
import { useSession } from "@/lib/auth-client";
import { AnimatedSection } from "@/components/core/AnimatedSection";
import { FileImage } from "lucide-react";

// Number of images to process concurrently
const CONCURRENCY_LIMIT = 4;
const GUEST_USAGE_STORAGE_KEY = "zoepic_guest_webp_usage";

interface GuestUsageState {
  date: string;
  used: number;
}

interface DailyUsageSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getGuestUsageState(): GuestUsageState {
  if (typeof window === "undefined") {
    return { date: getTodayKey(), used: 0 };
  }

  const today = getTodayKey();
  const rawValue = window.localStorage.getItem(GUEST_USAGE_STORAGE_KEY);

  if (!rawValue) {
    return { date: today, used: 0 };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<GuestUsageState>;

    if (parsed.date !== today) {
      return { date: today, used: 0 };
    }

    return {
      date: today,
      used: typeof parsed.used === "number" ? parsed.used : 0,
    };
  } catch {
    return { date: today, used: 0 };
  }
}

function checkGuestWebpUsageLimit(fileCount: number): UsageCheck {
  const webpLimit = PLANS.starter.webpConversionsLimit ?? 0;
  const usageState = getGuestUsageState();
  const remaining = webpLimit - usageState.used;

  return {
    allowed: remaining >= fileCount,
    remaining,
    limit: webpLimit,
    used: usageState.used,
    maxBatchSize: PLANS.starter.maxBatchSize,
    plan: "starter",
  };
}

function logGuestWebpConversion(fileCount: number): void {
  if (typeof window === "undefined") {
    return;
  }

  const usageState = getGuestUsageState();
  const nextState: GuestUsageState = {
    date: getTodayKey(),
    used: usageState.used + fileCount,
  };

  window.localStorage.setItem(
    GUEST_USAGE_STORAGE_KEY,
    JSON.stringify(nextState),
  );
}

export default function ConversionPage() {
  const { data: sessionData, isPending: isLoadedResponse } = useSession();
  const user = sessionData?.user as any;
  const isLoaded = !isLoadedResponse;
  const canUseAi = Boolean(user);
  
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
  const [dailyUsageSummary, setDailyUsageSummary] = useState<DailyUsageSummary | null>(null);
  const { toast } = useToast();

  const refreshDailyUsageSummary = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      const guestUsage = checkGuestWebpUsageLimit(0);
      setDailyUsageSummary({
        used: guestUsage.used,
        limit: guestUsage.limit,
        remaining: guestUsage.remaining,
      });
      return;
    }

    const usage = await checkUsageLimit(user.id, 0, false);
    setDailyUsageSummary({
      used: usage.used,
      limit: usage.limit === -1 ? null : usage.limit,
      remaining: usage.remaining === -1 ? null : usage.remaining,
    });
  }, [isLoaded, user]);

  // Load user profile to get batch size limit
  useEffect(() => {
    if (isLoaded && user) {
      getUserProfile(user.id).then((profile) => {
        if (profile) {
          setMaxBatchSize(profile.maxBatchSize);
        }
      });
      return;
    }

    if (isLoaded && !user) {
      setUseAiForName(false);
      setMaxBatchSize(PLANS.starter.maxBatchSize);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    void refreshDailyUsageSummary();
  }, [refreshDailyUsageSummary]);

  const handleFilesSelect = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setConversionItems([]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setConversionItems([]);
  }, []);

  const handleUseAiForNameChange = useCallback(
    (value: boolean) => {
      if (!canUseAi) {
        if (value) {
          toast({
            title: "Inicia sesión para usar IA",
            description:
              "La conversión a WebP es pública, pero el renombrado con IA requiere una cuenta.",
          });
        }
        setUseAiForName(false);
        return;
      }

      setUseAiForName(value);
    },
    [canUseAi, toast],
  );

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
    if (!isLoaded) {
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "Sin imágenes",
        description: "Por favor, sube al menos una imagen.",
        variant: "destructive",
      });
      return;
    }

    if (useAiForName && !user) {
      toast({
        title: "Inicia sesión para usar IA",
        description:
          "Puedes convertir imágenes a WebP sin cuenta, pero el renombrado con IA requiere iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

    let usageCheck: UsageCheck | null = null;

    if (user) {
      usageCheck = await checkUsageLimit(user.id, selectedFiles.length, useAiForName);
    } else {
      usageCheck = checkGuestWebpUsageLimit(selectedFiles.length);
    }

    if (!usageCheck.allowed) {
      const description = useAiForName
        ? `Has usado ${usageCheck.used} de ${usageCheck.limit} conversiones IA este mes. Te quedan ${usageCheck.remaining}. Desactiva la IA o actualiza tu plan.`
        : user
          ? `Has usado ${usageCheck.used} de ${usageCheck.limit} conversiones WebP hoy en el plan gratuito. Te quedan ${usageCheck.remaining}.`
          : `Has usado ${usageCheck.used} de ${usageCheck.limit} conversiones WebP hoy como invitado. Te quedan ${usageCheck.remaining}. Crea una cuenta si quieres usar IA y gestionar tu suscripción.`;
      toast({
        title: "Límite alcanzado",
        description,
        variant: "destructive",
      });
      return;
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
    } else {
      logGuestWebpConversion(selectedFiles.length);
    }

    await refreshDailyUsageSummary();

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

  const isUnlimitedDailyUsage = dailyUsageSummary?.limit === null;
  const dailyUsagePercent =
    dailyUsageSummary && dailyUsageSummary.limit
      ? Math.min(
          Math.round((dailyUsageSummary.used / dailyUsageSummary.limit) * 100),
          100,
        )
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Controls & Info */}
        <AnimatedSection variant="fadeRight" delay={0.1}>
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

            {dailyUsageSummary && (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                      <FileImage className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Conversiones WebP hoy
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user
                          ? "Tu uso diario actual en el conversor."
                          : "Tu uso diario en este navegador."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isUnlimitedDailyUsage ? (
                      <p className="text-sm font-semibold text-emerald-600">
                        Ilimitado
                      </p>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-primary">
                          {dailyUsageSummary.used}
                          <span className="text-sm font-medium text-muted-foreground">
                            {" "}/ {dailyUsageSummary.limit}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Restan {dailyUsageSummary.remaining}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {!isUnlimitedDailyUsage && (
                  <>
                    <Progress value={dailyUsagePercent} className="h-2.5" />
                    <p className="text-xs text-muted-foreground">
                      {dailyUsagePercent}% del límite diario usado.
                    </p>
                  </>
                )}
              </div>
            )}

            <ConversionControls
              canUseAi={canUseAi}
              authLoaded={isLoaded}
              useAiForName={useAiForName}
              setUseAiForName={handleUseAiForNameChange}
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
      </AnimatedSection>

        {/* Right Column: Results List */}
        <AnimatedSection variant="fadeLeft" delay={0.2}>
          <ConversionResultList
            items={conversionItems}
            compressionQuality={compressionQuality}
            useAiForName={useAiForName}
          />
        </AnimatedSection>
      </div>
    </div>
  );
}
