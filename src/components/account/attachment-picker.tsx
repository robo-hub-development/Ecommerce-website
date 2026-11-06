"use client";

import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RETURN_ACCEPTED_TYPES, RETURN_MAX_FILES, RETURN_MAX_FILE_BYTES, validateReturnFile } from "@/lib/validations/return";

interface AttachmentPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  onReject: (messages: string[]) => void;
}

export function AttachmentPicker({ files, onChange, onReject }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  // Free the blob URLs when the selection changes or the form unmounts.
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const handlePick = (picked: FileList | null) => {
    if (!picked) return;
    const errors: string[] = [];
    const accepted: File[] = [];
    for (const file of Array.from(picked)) {
      const problem = validateReturnFile(file);
      if (problem) {
        errors.push(problem);
      } else if (files.length + accepted.length >= RETURN_MAX_FILES) {
        errors.push(`You can attach up to ${RETURN_MAX_FILES} files.`);
        break;
      } else {
        accepted.push(file);
      }
    }
    onReject(errors);
    if (accepted.length) onChange([...files, ...accepted]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        id="return-files"
        type="file"
        multiple
        accept={RETURN_ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => handlePick(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={files.length >= RETURN_MAX_FILES}
        className="w-fit"
      >
        <ImagePlus aria-hidden /> Add photos or videos
      </Button>
      <p className="text-xs text-muted-foreground">
        Up to {RETURN_MAX_FILES} files, {RETURN_MAX_FILE_BYTES / 1024 / 1024} MB each (JPG, PNG, WebP, MP4, MOV).
      </p>
      {previews.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map(({ file, url }, index) => (
            <li key={url} className="relative overflow-hidden rounded-lg bg-surface ring-1 ring-foreground/10">
              {file.type.startsWith("video/") ? (
                <video src={url} muted playsInline aria-label={file.name} className="aspect-square w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimisable
                <img src={url} alt={file.name} className="aspect-square w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                aria-label={`Remove ${file.name}`}
                className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
