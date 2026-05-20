import { useState, useEffect, useCallback } from "react";
import { EntryForm } from "@/features/entry/EntryForm";
import { Skeleton } from "@/components/ui/skeleton";

type EntryPanelProps = {
  token: string;
};

export function EntryPanel({ token }: EntryPanelProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json() as Promise<{ success: boolean; data: { name: string }[] }>)
      .then((data) => {
        if (data.success) {
          setCategories(data.data.map((c) => c.name));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleAddCategory = useCallback(
    async (name: string) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to create category");
      const data = await response.json() as { success: boolean };
      if (data.success) {
        setCategories((prev) => [...prev, name]);
      }
    },
    [token],
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-lg">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return <EntryForm token={token} categories={categories} onAddCategory={handleAddCategory} />;
}
