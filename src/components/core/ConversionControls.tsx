import { Label } from "@/components/ui/label";
import { SpainFlag, USAFlag } from "@/components/ui/flag-icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Crop, Loader2, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  ASPECT_RATIO_PRESETS,
  IMAGE_SIZE_PRESETS,
  MAX_CUSTOM_DIMENSION,
  type ResizeMode,
} from "@/lib/imageUtils";

interface ConversionControlsProps {
  canUseAi: boolean;
  isLoggedIn: boolean;
  authLoaded: boolean;
  useAiForName: boolean;
  setUseAiForName: (value: boolean) => void;
  prefix: string;
  setPrefix: (value: string) => void;
  brandPrompt: string;
  setBrandPrompt: (value: string) => void;
  useSuffix: boolean;
  setUseSuffix: (value: boolean) => void;
  language: "spanish" | "english";
  setLanguage: (value: "spanish" | "english") => void;
  compressionQuality: number;
  setCompressionQuality: (value: number) => void;
  resizeMode: ResizeMode;
  setResizeMode: (value: ResizeMode) => void;
  selectedPresetId: string;
  setSelectedPresetId: (value: string) => void;
  selectedAspectRatioId: string;
  setSelectedAspectRatioId: (value: string) => void;
  customWidth: string;
  setCustomWidth: (value: string) => void;
  customHeight: string;
  setCustomHeight: (value: string) => void;
  sizingSummary: string;
  sizingError: string | null;
  isSizingValid: boolean;
  onConvert: () => void;
  onClearFiles: () => void;
  isLoading: boolean;
  hasFile: boolean;
  hasResult: boolean;
}

export function ConversionControls({
  canUseAi,
  isLoggedIn,
  authLoaded,
  useAiForName,
  setUseAiForName,
  prefix,
  setPrefix,
  brandPrompt,
  setBrandPrompt,
  useSuffix,
  setUseSuffix,
  language,
  setLanguage,
  compressionQuality,
  setCompressionQuality,
  resizeMode,
  setResizeMode,
  selectedPresetId,
  setSelectedPresetId,
  selectedAspectRatioId,
  setSelectedAspectRatioId,
  customWidth,
  setCustomWidth,
  customHeight,
  setCustomHeight,
  sizingSummary,
  sizingError,
  isSizingValid,
  onConvert,
  onClearFiles,
  isLoading,
  hasFile,
  hasResult,
}: ConversionControlsProps) {
  const effectiveUseAi = canUseAi && useAiForName;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="use-ai-name"
          checked={useAiForName}
          onCheckedChange={setUseAiForName}
          disabled={!canUseAi || !authLoaded}
        />
        <Label htmlFor="use-ai-name" className="text-sm font-medium">
          Usar IA para el nombre del archivo
        </Label>
      </div>

      {!canUseAi && authLoaded && !isLoggedIn && (
        <p className="text-xs text-muted-foreground">
          La conversión a WebP está disponible sin cuenta. La IA para renombrar
          archivos está disponible solo con un plan de pago. {" "}
          <Link href="/signup" className="text-primary underline underline-offset-4">
            crea una cuenta
          </Link>
          {" "}o{" "}
          <Link href="/login" className="text-primary underline underline-offset-4">
            inicia sesión
          </Link>
          {" "}para elegir tu plan.
        </p>
      )}

      {!canUseAi && authLoaded && isLoggedIn && (
        <p className="text-xs text-muted-foreground">
          El renombrado con IA está disponible solo en planes de pago.{" "}
          <Link href="/dashboard/usage" className="text-primary underline underline-offset-4">
            Mejora tu plan
          </Link>{" "}
          para desbloquearlo.
        </p>
      )}

      <div>
        <Label
          htmlFor="prefix"
          className="text-xs font-medium text-muted-foreground"
        >
          {effectiveUseAi
            ? "Prefijo opcional para el nombre"
            : "Nombre manual del archivo"}
        </Label>
        <Input
          id="prefix"
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder={effectiveUseAi ? "ej. imagen-producto-" : "nombre-del-archivo"}
          className="mt-1 bg-input text-foreground border-border focus:bg-background placeholder:text-muted-foreground/70"
        />
      </div>

      {effectiveUseAi && (
        <>
          <div>
            <Label htmlFor="ai-language" className="text-xs font-medium text-muted-foreground">
              Idioma del nombre generado por IA
            </Label>
            <Select
              value={language}
              onValueChange={(value: "spanish" | "english") => setLanguage(value)}
            >
              <SelectTrigger id="ai-language" className="mt-1 bg-input text-foreground border-border focus:bg-background">
                <SelectValue placeholder="Selecciona idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spanish">
                  <span className="flex items-center gap-2">
                    <SpainFlag className="h-3.5 w-5 rounded-[2px] flex-shrink-0" />{" "}
                    Español
                  </span>
                </SelectItem>
                <SelectItem value="english">
                  <span className="flex items-center gap-2">
                    <USAFlag className="h-3.5 w-5 rounded-[2px] flex-shrink-0" />{" "}
                    English
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand-prompt" className="text-xs font-medium text-muted-foreground">
              Contexto de marca o sitio web{" "}
              <span className="text-muted-foreground/60">(opcional)</span>
            </Label>
            <Textarea
              id="brand-prompt"
              value={brandPrompt}
              onChange={(e) => setBrandPrompt(e.target.value)}
              placeholder="ej. Tienda de ropa deportiva para mujeres, enfocada en yoga y fitness. Palabras clave: activewear, ropa deportiva, yoga."
              className="mt-1 bg-input text-foreground border-border focus:bg-background placeholder:text-muted-foreground/70 resize-none text-sm"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              La IA usará este contexto para generar nombres más relevantes y SEO-friendly para tu marca.
            </p>
          </div>
        </>
      )}

      <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Crop className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">Tamaño y proporción</p>
            <p className="text-xs text-muted-foreground">
              Elige cómo adaptar todas las imágenes del lote.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="resize-mode" className="text-xs font-medium text-muted-foreground">
            Modo de tamaño
          </Label>
          <Select value={resizeMode} onValueChange={(value: ResizeMode) => setResizeMode(value)}>
            <SelectTrigger id="resize-mode" className="mt-1 bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">Original</SelectItem>
              <SelectItem value="preset">Tamaño popular</SelectItem>
              <SelectItem value="aspect-ratio">Relación de aspecto</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {resizeMode === "preset" && (
          <div>
            <Label htmlFor="size-preset" className="text-xs font-medium text-muted-foreground">
              Tamaño popular
            </Label>
            <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
              <SelectTrigger id="size-preset" className="mt-1 bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Web</SelectLabel>
                  {IMAGE_SIZE_PRESETS.filter((preset) => preset.category === "web").map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name} · {preset.width}×{preset.height}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Redes</SelectLabel>
                  {IMAGE_SIZE_PRESETS.filter((preset) => preset.category === "social").map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name} · {preset.width}×{preset.height}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {resizeMode === "aspect-ratio" && (
          <div>
            <Label htmlFor="aspect-ratio" className="text-xs font-medium text-muted-foreground">
              Relación de aspecto
            </Label>
            <Select value={selectedAspectRatioId} onValueChange={setSelectedAspectRatioId}>
              <SelectTrigger id="aspect-ratio" className="mt-1 bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIO_PRESETS.map((ratio) => (
                  <SelectItem key={ratio.id} value={ratio.id}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {resizeMode === "custom" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="custom-width" className="text-xs font-medium text-muted-foreground">
                  Ancho (px)
                </Label>
                <Input
                  id="custom-width"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_CUSTOM_DIMENSION}
                  step={1}
                  value={customWidth}
                  onChange={(event) => setCustomWidth(event.target.value)}
                  aria-invalid={Boolean(sizingError)}
                  aria-describedby={sizingError ? "custom-size-error" : undefined}
                  className="mt-1 bg-input"
                />
              </div>
              <div>
                <Label htmlFor="custom-height" className="text-xs font-medium text-muted-foreground">
                  Alto (px)
                </Label>
                <Input
                  id="custom-height"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_CUSTOM_DIMENSION}
                  step={1}
                  value={customHeight}
                  onChange={(event) => setCustomHeight(event.target.value)}
                  aria-invalid={Boolean(sizingError)}
                  aria-describedby={sizingError ? "custom-size-error" : undefined}
                  className="mt-1 bg-input"
                />
              </div>
            </div>
            {sizingError && (
              <p id="custom-size-error" className="text-xs text-destructive" role="alert">
                {sizingError}
              </p>
            )}
          </div>
        )}

        <div className="rounded-lg bg-background/60 px-3 py-2 text-xs">
          <p className="font-medium text-foreground" aria-live="polite">{sizingSummary}</p>
          {resizeMode !== "original" && (
            <p className="mt-1 text-muted-foreground">
              La imagen se recortará desde el centro.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="compressionQuality" className="text-xs font-medium text-muted-foreground">
            Calidad WebP
          </Label>
          <span className="text-sm font-semibold text-primary" aria-live="polite">
            {compressionQuality}%
          </span>
        </div>
        <Slider
          id="compressionQuality"
          min={5}
          max={100}
          step={1}
          value={[compressionQuality]}
          onValueChange={(value) => setCompressionQuality(value[0])}
          className="w-full [&>span:last-child]:bg-primary [&>span:last-child]:border-primary-foreground"
          aria-label="Calidad de compresión WebP"
          aria-valuetext={`${compressionQuality}%`}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Valores más bajos generan archivos más pequeños con menor calidad.
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-suffix"
            checked={useSuffix}
            onCheckedChange={setUseSuffix}
          />
          <Label htmlFor="use-suffix" className="text-sm font-medium">
            Agregar sufijo de fecha al nombre
          </Label>
        </div>
        <p className="text-xs text-muted-foreground pl-[3.25rem]">
          ej.{" "}
          <span className="font-mono">
            nombre-imagen<span className="text-primary">-260416-12345</span>.webp
          </span>
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onConvert}
          disabled={isLoading || !hasFile || !isSizingValid}
          className="flex-grow font-semibold py-3 text-base"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
          )}
          {isLoading
            ? "Procesando..."
            : effectiveUseAi
              ? "Convertir y Analizar"
              : "Convertir a WebP"}
        </Button>
        <Button
          onClick={onClearFiles}
          variant="outline"
          className="font-semibold py-3 text-base"
          disabled={!hasFile && !hasResult}
          aria-label="Limpiar archivos seleccionados"
        >
          <Trash2 className="mr-2 h-5 w-5" aria-hidden="true" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}
