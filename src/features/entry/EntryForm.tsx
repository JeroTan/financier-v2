import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { transactionFormSchema, type TransactionFormValues } from "./schema";
import { CategorySelector } from "./CategorySelector";
import { ImageUpload } from "./ImageUpload";

type EntryFormProps = {
  token?: string;
  categories: string[];
  onAddCategory: (name: string) => Promise<void>;
};

export function EntryForm({ token, categories, onAddCategory }: EntryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "",
      description: "",
      receiptUrl: "",
    },
  });

  const [hasUnsaved, setHasUnsaved] = useState(false);

  const type = watch("type");
  const receiptUrl = watch("receiptUrl");

  useEffect(() => {
    setHasUnsaved(isDirty);
  }, [isDirty]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  const onSubmit = useCallback(
    async (data: TransactionFormValues) => {
      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            type: data.type,
            amount: parseFloat(data.amount),
            date: data.date,
            category: data.category,
            description: data.description,
            receiptUrl: data.receiptUrl || undefined,
          }),
        });

        if (!response.ok) {
          const error = await response.json() as { error?: { message?: string } };
          throw new Error(error.error?.message ?? "Failed to save transaction");
        }

        toast.success("Transaction saved!");
        window.dispatchEvent(new CustomEvent("transaction_saved"));
        reset();
        setHasUnsaved(false);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save transaction");
      }
    },
    [token, reset],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {/* Type Toggle */}
      <div>
        <Label>Type</Label>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => setValue("type", "expense")}
            className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${
              type === "expense"
                ? "bg-red-500/10 border-red-500 text-red-600"
                : "bg-background hover:bg-muted/50"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setValue("type", "income")}
            className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${
              type === "income"
                ? "bg-green-500/10 border-green-500 text-green-600"
                : "bg-background hover:bg-muted/50"
            }`}
          >
            Income
          </button>
        </div>
        {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
      </div>

      {/* Amount */}
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          {...register("amount")}
          className="mt-1"
        />
        {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} className="mt-1" />
        {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <div className="mt-1">
          <CategorySelector
            categories={categories}
            value={watch("category")}
            onChange={(v) => setValue("category", v, { shouldValidate: true, shouldDirty: true })}
            onAddCategory={onAddCategory}
          />
        </div>
        {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What was this for?"
          rows={2}
          {...register("description")}
          className="mt-1"
        />
        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <Label>Receipt (optional)</Label>
        <div className="mt-1">
          <ImageUpload
            value={receiptUrl}
            onChange={(url) => setValue("receiptUrl", url, { shouldDirty: true })}
            onClear={() => setValue("receiptUrl", "", { shouldDirty: true })}
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold-500 text-gold-950 hover:bg-gold-600"
      >
        {isSubmitting ? "Saving..." : "Save Transaction"}
      </Button>
    </form>
  );
}
