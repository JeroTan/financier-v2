import { useState, useEffect, useCallback } from "react";
import { EntryForm } from "@/features/entry/EntryForm";

type EntryPanelProps = {
  token?: string;
};

const DEFAULT_CATEGORY_NAMES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Salary",
  "Freelance",
  "Investment",
  "Other",
];

export function EntryPanel({ token }: EntryPanelProps) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORY_NAMES);

  useEffect(() => {
    fetch("/api/categories", {
      credentials: "same-origin",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => res.json() as Promise<{ success: boolean; data: { name: string }[] }>)
      .then((data) => {
        if (data.success) {
          setCategories(data.data.map((c) => c.name));
        }
      })
      .catch(() => {})
  }, [token]);

  const handleAddCategory = useCallback(
    async (name: string) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  return <EntryForm token={token} categories={categories} onAddCategory={handleAddCategory} />;
}
