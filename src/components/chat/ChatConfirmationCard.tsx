import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySelector } from "@/components/categories/CategorySelector";

type ChatConfirmationCardProps = {
  data: Record<string, unknown>;
  onConfirm: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  categories: string[];
};

export function ChatConfirmationCard({ data, onConfirm, onCancel, categories }: ChatConfirmationCardProps) {
  const operation = data.operation === "update" || data.operation === "delete" ? data.operation : "create";
  const [amount, setAmount] = useState(String(data.amount ?? ""));
  const [type, setType] = useState(String(data.type ?? "expense"));
  const [category, setCategory] = useState(String(data.category ?? ""));
  const [date, setDate] = useState(String(data.date ?? new Date().toISOString().split("T")[0]));
  const [description, setDescription] = useState(String(data.description ?? ""));
  const [categoryError, setCategoryError] = useState("");

  const accentClass = type === "income" ? "income" : "expense";

  const handleConfirm = () => {
    if (operation === "delete") {
      onConfirm(data);
      return;
    }

    if (operation === "update") {
      onConfirm(data);
      return;
    }

    if (!category.trim()) {
      setCategoryError("Category is required");
      return;
    }
    onConfirm({
      amount: parseFloat(amount) || 0,
      type,
      category: category.trim(),
      date,
      description,
    });
  };

  if (operation === "delete" || operation === "update") {
    const detailRows = getMutationDetails(data);
    return (
      <div className="flex gap-3">
        <div className="w-8 flex-shrink-0" />
        <Card className="financial-card w-full max-w-md border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {operation === "delete" ? "Confirm Delete" : "Confirm Update"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {operation === "delete"
                ? "Remove selected transaction from ledger?"
                : "Apply these changes to selected transaction?"}
            </p>
            {detailRows.length > 0 && (
              <dl className="space-y-2 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                {detailRows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="text-right font-semibold text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1 rounded-full">Cancel</Button>
            <Button
              onClick={handleConfirm}
              className={`flex-1 rounded-full ${operation === "delete" ? "bg-expense text-white hover:bg-expense/80" : "bg-primary text-white hover:bg-primary-container hover:text-on-primary-container"}`}
              style={{ color: operation === "delete" ? "#fff" : "var(--on-primary)" }}
            >
              {operation === "delete" ? "Delete" : "Update"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 flex-shrink-0" />
      <Card
        className={`financial-card w-full max-w-md border-0 shadow-card ${accentClass}`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Confirm Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="conf-amount">Amount</Label>
              <Input id="conf-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" />
            </div>
            <div>
              <Label htmlFor="conf-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="conf-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="conf-category">Category</Label>
            <CategorySelector
              inputId="conf-category"
              categories={categories}
              value={category}
              onChange={(value) => {
                setCategory(value);
                setCategoryError("");
              }}
              placeholder="Select or type category"
            />
            {categoryError && <p className="mt-1 text-xs text-destructive">{categoryError}</p>}
          </div>
          <div>
            <Label htmlFor="conf-date">Date</Label>
            <Input id="conf-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="conf-desc">Description</Label>
            <Input id="conf-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-full">Cancel</Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 rounded-full bg-primary text-white hover:bg-primary-container hover:text-on-primary-container"
            style={{ color: "var(--on-primary)" }}
          >
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function getMutationDetails(data: Record<string, unknown>): Array<{ label: string; value: string }> {
  const details: Array<{ label: string; value: string }> = [];
  if (typeof data.type === "string") details.push({ label: "Type", value: data.type });
  if (typeof data.amount === "number") details.push({ label: "Amount", value: `PHP ${data.amount.toFixed(2)}` });
  if (typeof data.category === "string") details.push({ label: "Category", value: data.category });
  if (typeof data.description === "string") details.push({ label: "Description", value: data.description });
  if (typeof data.date === "string") details.push({ label: "Date", value: data.date });
  return details;
}
