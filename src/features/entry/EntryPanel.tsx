import { useState, useEffect, useCallback } from "react";
import { EntryForm } from "@/features/entry/EntryForm";

type EntryPanelProps = {
  token?: string;
};

const DEFAULT_CATEGORY_NAMES = [
  "Bills",
  "Entertainment",
  "Food",
  "Freelance",
  "Investment",
  "Other",
  "Salary",
  "Shopping",
  "Transport",
];

function mergeCategoryNames(current: string[], next: string[]): string[] {
  return Array.from(new Set([...current, ...next].map((category) => category.trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
}

export function EntryPanel({ token }: EntryPanelProps) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORY_NAMES);

  const loadCategories = useCallback(() => {
    fetch("/api/categories", {
      credentials: "same-origin",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => res.json() as Promise<{ success: boolean; data: { name: string }[] }>)
      .then((data) => {
        if (data.success) {
          setCategories((current) => mergeCategoryNames(current, data.data.map((category) => category.name)));
        }
      })
      .catch(() => {})
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const handler = () => loadCategories();
    window.addEventListener("transaction_saved", handler);
    return () => window.removeEventListener("transaction_saved", handler);
  }, [loadCategories]);

  return <EntryForm token={token} categories={categories} />;
}
