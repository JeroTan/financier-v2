import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CategorySelectorProps = {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputId?: string;
};

const PAGE_SIZE = 15;

export function CategorySelector({
  categories,
  value,
  onChange,
  placeholder = "Select or type category",
  inputId,
}: CategorySelectorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const normalizedCategories = useMemo(
    () => Array.from(new Set(categories.map((category) => category.trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b)),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return normalizedCategories;
    return normalizedCategories.filter((category) => category.toLowerCase().includes(needle));
  }, [normalizedCategories, query]);

  const visibleCategories = filteredCategories.slice(0, visibleCount);
  const exactCategory = normalizedCategories.find(
    (category) => category.toLowerCase() === query.trim().toLowerCase(),
  );
  const canUseTyped = Boolean(query.trim() && !exactCategory);

  const selectCategory = (category: string) => {
    onChange(category);
    setQuery(category);
    setOpen(false);
    setVisibleCount(PAGE_SIZE);
  };

  const commitTypedCategory = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (exactCategory) {
      selectCategory(exactCategory);
      return;
    }

    selectCategory(trimmed);
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      if (rootRef.current?.contains(document.activeElement)) return;
      if (query.trim() && query.trim() !== value) {
        commitTypedCategory();
        return;
      }
      setOpen(false);
    }, 120);
  };

  return (
    <div ref={rootRef} className="relative" onBlur={handleBlur}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={inputId}
          value={query}
          placeholder={placeholder}
          className="pr-9 pl-9"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setVisibleCount(PAGE_SIZE);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const first = exactCategory ?? filteredCategories[0];
              if (first && query.trim().length === 0) {
                selectCategory(first);
                return;
              }
              commitTypedCategory();
            }
            if (event.key === "Escape") {
              setQuery(value);
              setOpen(false);
            }
          }}
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-chat-border bg-surface-container-lowest shadow-card">
          {visibleCategories.length > 0 ? (
            <div className="max-h-64 overflow-y-auto py-1">
              {visibleCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCategory(category)}
                >
                  <span className="truncate">{category}</span>
                  {value.toLowerCase() === category.toLowerCase() && (
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">No matching categories.</p>
          )}

          {filteredCategories.length > visibleCount && (
            <button
              type="button"
              className="w-full border-t border-chat-border px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-surface-container"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Show more
            </button>
          )}

          {canUseTyped && (
            <div className="border-t border-chat-border p-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 rounded-full"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commitTypedCategory()}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {`Use "${query.trim()}"`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
