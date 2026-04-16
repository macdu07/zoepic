import { Label } from "@/components/ui/label";
import { SpainFlag, USAFlag } from "@/components/ui/flag-icons";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

interface ConversionControlsProps {
  useAiForName: boolean;
  setUseAiForName: (value: boolean) => void;
  prefix: string;
  setPrefix: (value: string) => void;
  useSuffix: boolean;
  setUseSuffix: (value: boolean) => void;
  language: "spanish" | "english";
  setLanguage: (value: "spanish" | "english") => void;
  compressionQuality: number;
  setCompressionQuality: (value: number) => void;
  onConvert: () => void;
  onClearFiles: () => void;
  isLoading: boolean;
  hasFile: boolean;
  hasResult: boolean;
}

export function ConversionControls({
  useAiForName,
  setUseAiForName,
  prefix,
  setPrefix,
  useSuffix,
  setUseSuffix,
  language,
  setLanguage,
  compressionQuality,
  setCompressionQuality,
  onConvert,
  onClearFiles,
  isLoading,
  hasFile,
  hasResult,
}: ConversionControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="use-ai-name"
          checked={useAiForName}
          onCheckedChange={setUseAiForName}
        />
        <Label htmlFor="use-ai-name" className="text-sm font-medium">
          Usar IA para el nombre del archivo
        </Label>
      </div>

      <div>
        <Label
          htmlFor="prefix"
          className="text-xs font-medium text-muted-foreground"
        >
          {useAiForName
            ? "Prefijo opcional para el nombre"
            : "Nombre manual del archivo"}
        </Label>
        <Input
          id="prefix"
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder={useAiForName ? "ej. imagen-producto-" : "nombre-del-archivo"}
          className="mt-1 bg-input text-foreground border-border focus:bg-background placeholder:text-muted-foreground/70"
        />
      </div>

      {useAiForName && (
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
      )}

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

      <div className="flex gap-4">
        <Button
          onClick={onConvert}
          disabled={isLoading || !hasFile}
          className="flex-grow font-semibold py-3 text-base"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
          )}
          {isLoading ? "Procesando..." : "Convertir y Analizar"}
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
