import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X } from "lucide-react";

type ChatInputProps = {
  onSend: (message: string, image?: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }

    if (file.size > MAX_SIZE) {
      alert("Image must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(",")[1] ?? "");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !imageBase64) return;
    onSend(trimmed, imageBase64 ?? undefined);
    setText("");
    clearImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-3">
      {imagePreview && (
        <div className="relative inline-block mb-2">
          <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted-foreground text-background flex items-center justify-center text-xs"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Type a message..."}
          disabled={disabled}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={disabled || (!text.trim() && !imageBase64)} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
