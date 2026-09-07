import Link from "next/link";
import { ChevronDown, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SpainFlag, USAFlag } from "@/components/ui/flag-icons";
import { ASPECT_RATIO_PRESETS, IMAGE_SIZE_PRESETS, MAX_CUSTOM_DIMENSION, type ResizeMode } from "@/lib/imageUtils";

interface ConversionControlsProps {
  canUseAi: boolean; isLoggedIn: boolean; authLoaded: boolean;
  useAiForName: boolean; setUseAiForName: (value: boolean) => void;
  prefix: string; setPrefix: (value: string) => void;
  brandPrompt: string; setBrandPrompt: (value: string) => void;
  useSuffix: boolean; setUseSuffix: (value: boolean) => void;
  language: "spanish" | "english"; setLanguage: (value: "spanish" | "english") => void;
  compressionQuality: number; setCompressionQuality: (value: number) => void;
  resizeMode: ResizeMode; setResizeMode: (value: ResizeMode) => void;
  selectedPresetId: string; setSelectedPresetId: (value: string) => void;
  selectedAspectRatioId: string; setSelectedAspectRatioId: (value: string) => void;
  customWidth: string; setCustomWidth: (value: string) => void;
  customHeight: string; setCustomHeight: (value: string) => void;
  sizingSummary: string; sizingError: string | null; isSizingValid: boolean;
  onConvert: () => void; onClearFiles: () => void; isLoading: boolean; hasFile: boolean; hasResult: boolean;
}

export function ConversionControls(props: ConversionControlsProps) {
  const {
    canUseAi, isLoggedIn, authLoaded, useAiForName, setUseAiForName, prefix, setPrefix,
    brandPrompt, setBrandPrompt, useSuffix, setUseSuffix, language, setLanguage,
    compressionQuality, setCompressionQuality, resizeMode, setResizeMode,
    selectedPresetId, setSelectedPresetId, selectedAspectRatioId, setSelectedAspectRatioId,
    customWidth, setCustomWidth, customHeight, setCustomHeight, sizingSummary, sizingError,
    isSizingValid, onConvert, onClearFiles, isLoading, hasFile, hasResult,
  } = props;
  const effectiveUseAi = canUseAi && useAiForName;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between"><Label htmlFor="compressionQuality" className="text-sm font-semibold">Calidad WebP</Label><span className="font-semibold tabular-nums text-primary">{compressionQuality}%</span></div>
        <Slider id="compressionQuality" min={5} max={100} step={1} value={[compressionQuality]} onValueChange={(value) => setCompressionQuality(value[0])} aria-label="Calidad de compresión WebP" aria-valuetext={`${compressionQuality}%`} />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Reduce el valor para obtener archivos más pequeños. Comprueba siempre el resultado visual.</p>
      </div>

      <details className="group border-y border-border py-1">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold">Dimensiones y recorte <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
        <div className="space-y-4 pb-5">
          <Select value={resizeMode} onValueChange={(value: ResizeMode) => setResizeMode(value)}><SelectTrigger aria-label="Modo de tamaño"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="original">Conservar original</SelectItem><SelectItem value="preset">Tamaño habitual</SelectItem><SelectItem value="aspect-ratio">Relación de aspecto</SelectItem><SelectItem value="custom">Medidas personalizadas</SelectItem></SelectContent></Select>
          {resizeMode === "preset" && <Select value={selectedPresetId} onValueChange={setSelectedPresetId}><SelectTrigger aria-label="Tamaño habitual"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>Web</SelectLabel>{IMAGE_SIZE_PRESETS.filter((p) => p.category === "web").map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {p.width}×{p.height}</SelectItem>)}</SelectGroup><SelectGroup><SelectLabel>Redes</SelectLabel>{IMAGE_SIZE_PRESETS.filter((p) => p.category === "social").map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {p.width}×{p.height}</SelectItem>)}</SelectGroup></SelectContent></Select>}
          {resizeMode === "aspect-ratio" && <Select value={selectedAspectRatioId} onValueChange={setSelectedAspectRatioId}><SelectTrigger aria-label="Relación de aspecto"><SelectValue /></SelectTrigger><SelectContent>{ASPECT_RATIO_PRESETS.map((ratio) => <SelectItem key={ratio.id} value={ratio.id}>{ratio.label}</SelectItem>)}</SelectContent></Select>}
          {resizeMode === "custom" && <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="custom-width" className="text-xs">Ancho (px)</Label><Input id="custom-width" type="number" min={1} max={MAX_CUSTOM_DIMENSION} value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} aria-invalid={Boolean(sizingError)} /></div><div><Label htmlFor="custom-height" className="text-xs">Alto (px)</Label><Input id="custom-height" type="number" min={1} max={MAX_CUSTOM_DIMENSION} value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} aria-invalid={Boolean(sizingError)} /></div></div>}
          <div className="rounded-xl bg-muted/60 px-4 py-3 text-xs leading-5"><p className="font-semibold text-foreground">{sizingSummary}</p>{resizeMode !== "original" && <p className="mt-1 text-muted-foreground">El recorte se realiza desde el centro.</p>}{sizingError && <p className="mt-1 text-destructive" role="alert">{sizingError}</p>}</div>
        </div>
      </details>

      <details className="group border-b border-border pb-1">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold">Nombre del archivo e IA <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
        <div className="space-y-4 pb-5">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/60 p-4"><div><Label htmlFor="use-ai-name" className="font-semibold">Proponer nombre con IA</Label><p className="mt-1 text-xs leading-5 text-muted-foreground">Envía una versión reducida de la imagen al servicio de IA.</p></div><Switch id="use-ai-name" checked={useAiForName} onCheckedChange={setUseAiForName} disabled={!canUseAi || !authLoaded} /></div>
          {!canUseAi && authLoaded && <p className="text-xs leading-5 text-muted-foreground">La IA requiere un plan de pago. {isLoggedIn ? <Link className="font-semibold text-primary underline" href="/dashboard/usage">Ver planes</Link> : <Link className="font-semibold text-primary underline" href="/signup">Crear cuenta</Link>}.</p>}
          <div><Label htmlFor="prefix" className="text-xs font-semibold">{effectiveUseAi ? "Prefijo opcional" : "Nombre base opcional"}</Label><Input id="prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder={effectiveUseAi ? "producto-verano" : "nombre-del-archivo"} className="mt-1.5" /></div>
          {effectiveUseAi && <><div><Label htmlFor="ai-language" className="text-xs font-semibold">Idioma</Label><Select value={language} onValueChange={(value: "spanish" | "english") => setLanguage(value)}><SelectTrigger id="ai-language" className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="spanish"><span className="flex gap-2"><SpainFlag className="h-4 w-5" /> Español</span></SelectItem><SelectItem value="english"><span className="flex gap-2"><USAFlag className="h-4 w-5" /> English</span></SelectItem></SelectContent></Select></div><div><Label htmlFor="brand-prompt" className="text-xs font-semibold">Contexto del sitio (opcional)</Label><Textarea id="brand-prompt" value={brandPrompt} onChange={(e) => setBrandPrompt(e.target.value)} rows={3} maxLength={500} placeholder="Ej.: catálogo de mobiliario de roble para interiores" className="mt-1.5 resize-none" /></div></>}
          <div className="flex items-center justify-between gap-4"><div><Label htmlFor="use-suffix" className="font-semibold">Añadir sufijo único</Label><p className="mt-1 text-xs text-muted-foreground">Evita nombres duplicados en un lote.</p></div><Switch id="use-suffix" checked={useSuffix} onCheckedChange={setUseSuffix} /></div>
        </div>
      </details>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_auto]">
        <Button onClick={onConvert} disabled={isLoading || !hasFile || !isSizingValid} className="h-12 text-base">{isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />} {isLoading ? "Procesando lote…" : effectiveUseAi ? "Convertir y proponer nombres" : "Convertir a WebP"}</Button>
        <Button onClick={onClearFiles} variant="outline" className="h-12" disabled={!hasFile && !hasResult}><Trash2 /> Limpiar</Button>
      </div>
    </div>
  );
}
