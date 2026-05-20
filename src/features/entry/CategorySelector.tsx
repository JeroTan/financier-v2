import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X } from "lucide-react";

type CategorySelectorProps = {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  onAddCategory?: (name: string) => Promise<void>;
};

export function CategorySelector({ categories, value, onChange, onAddCategory }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = categories.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed || !onAddCategory) return;
    setSaving(true);
    try {
      await onAddCategory(trimmed);
      onChange(trimmed);
      setAdding(false);
      setNewCategory("");
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full h-10 px-3 text-left border rounded-md bg-background hover:bg-muted/50 transition-colors flex items-center justify-between"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value || "Select category"}
          </span>
          <span className="text-xs text-muted-foreground">▼</span>
        </button>
      ) : (
        <div className="absolute z-50 w-full mt-1 border rounded-md bg-background shadow-lg">
          <div className="p-2">
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onChange(cat);
                  setIsOpen(false);
                  setSearch("");
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between"
              >
                {cat}
                {value === cat && <Check className="h-3 w-3 text-gold-500" />}
              </button>
            ))}
          </div>
          {onAddCategory && (
            <div className="border-t p-2">
              {!adding ? (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="w-full px-3 py-2 text-left text-sm text-gold-600 hover:bg-muted/50 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add new category
                </button>
              ) : (
                <div className="flex gap-1">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Category name"
                    className="h-8 text-sm flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") setAdding(false);
                    }}
                  />
                  <Button type="button" size="sm" onClick={handleAdd} disabled={saving || !newCategory.trim()}>
                    {saving ? "..." : "✓"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
