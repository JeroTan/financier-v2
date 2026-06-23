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
  const [amount, setAmount] = useState(String(data.amount ?? ""));
  const [type, setType] = useState(String(data.type ?? "expense"));
  const [category, setCategory] = useState(String(data.category ?? ""));
  const [date, setDate] = useState(String(data.date ?? new Date().toISOString().split("T")[0]));
  const [description, setDescription] = useState(String(data.description ?? ""));
  const [categoryError, setCategoryError] = useState("");

  const accentClass = type === "income" ? "income" : "expense";

  const handleConfirm = () => {
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
