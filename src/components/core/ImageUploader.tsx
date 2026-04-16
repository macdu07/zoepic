import { useRef, useEffect, useMemo, type ChangeEvent, type DragEvent, type KeyboardEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { UploadCloud, X } from "lucide-react";

interface ImageUploaderProps {
  selectedFiles: File[];
  onFilesSelect: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onError: (msg: string) => void;
  onClear: () => void;
  maxFiles?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export function ImageUploader({
  selectedFiles,
  onFilesSelect,
  onRemoveFile,
  onError,
  onClear,
  maxFiles = 10,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate object URLs for thumbnails and clean up on change
  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const filesArray = Array.from(fileList);
    const validFiles: File[] = [];
    for (const file of filesArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError(
          `El archivo "${file.name}" no es una imagen válida (JPG, JPEG, PNG).`,
        );
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > maxFiles) {
      onError(`Puedes subir un máximo de ${maxFiles} imágenes a la vez.`);
      onFilesSelect(validFiles.slice(0, maxFiles));
    } else if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    // Reset input value so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      triggerFileInput();
    }
  };

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label={
          selectedFiles.length > 0
            ? `${selectedFiles.length} imagen(es) seleccionada(s). Haz clic para cambiar.`
            : `Subir imágenes. Haz clic o arrastra archivos JPG, JPEG o PNG. Máximo ${maxFiles} archivos.`
        }
        onClick={triggerFileInput}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-1 flex flex-col items-center justify-center p-8 rounded-md border-2 border-dashed cursor-pointer bg-background/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-primary/40 hover:border-primary"
        }`}
      >
        <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" aria-hidden="true" />
        <p className="text-sm font-medium text-card-foreground">
          {selectedFiles.length > 0
            ? `${selectedFiles.length} imagen(es) seleccionada(s)`
            : "Haz clic o arrastra y suelta"}
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, JPEG o PNG (máx. {maxFiles} archivos)
        </p>
        <Input
          id="file-upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png"
          multiple
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 border-border/60 hover:border-primary/50 transition-colors shadow-sm"
            >
              <img
                src={previewUrls[index]}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
                aria-label={`Quitar ${file.name}`}
                className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer hover:bg-destructive shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
