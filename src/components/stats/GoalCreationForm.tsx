import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

type GoalCreationFormProps = {
  onCreate: (label: string, target: number) => Promise<void>;
};

export function GoalCreationForm({ onCreate }: GoalCreationFormProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !target) return;
    setSaving(true);
    try {
      await onCreate(label.trim(), parseFloat(target));
      setLabel("");
      setTarget("");
      setOpen(false);
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Goal
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">New Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="goal-label">Goal Name</Label>
            <Input
              id="goal-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Monthly Savings"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="goal-target">Target Amount</Label>
            <Input
              id="goal-target"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="1000"
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gold-500 text-gold-950" disabled={saving || !label || !target}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
