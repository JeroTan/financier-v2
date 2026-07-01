import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  onClear: () => void;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024;

export function ImageUpload({ value, onChange, onClear }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, WebP, and GIF images are allowed.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Image must be under 10MB.");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/receipts", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json() as { url?: string; data?: { url?: string } };
        const url = data.data?.url ?? data.url;
        if (!url) throw new Error("Upload response missing URL");

        onChange(url);
      } catch {
        setError("Failed to upload image. You can still submit without it.");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-4 w-4 mr-1" />
          {uploading ? "Uploading..." : "Attach Receipt"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="Receipt" className="h-24 w-24 rounded-lg object-cover border" />
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
