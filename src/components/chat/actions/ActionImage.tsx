type ActionImageProps = {
  data: string | Record<string, unknown>;
};

export function ActionImage({ data }: ActionImageProps) {
  let src = "";
  let alt = "Image";

  if (typeof data === "string") {
    src = data;
  } else {
    src = (data.url as string) ?? (data.src as string) ?? "";
    alt = (data.alt as string) ?? "Image";
  }

  if (!src) return null;

  return (
    <div className="my-2 rounded-lg overflow-hidden border">
      <img src={src} alt={alt} className="w-full max-h-64 object-contain bg-muted" />
    </div>
  );
}
