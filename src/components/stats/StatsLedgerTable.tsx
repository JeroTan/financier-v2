import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

type LedgerEntry = {
  label: string;
  icon: string;
  amount: number;
  type: "income" | "expense";
};

type StatsLedgerTableProps = {
  entries: LedgerEntry[];
  loading?: boolean;
};

export function StatsLedgerTable({ entries, loading }: StatsLedgerTableProps) {
  if (loading) {
    return <SkeletonTable />;
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <div className="text-3xl mb-2">📋</div>
          <p>No transactions for this period.</p>
        </CardContent>
      </Card>
    );
  }

  const totalIncome = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpenses = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ledger</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground w-8"></th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="px-4 py-2 text-lg">{entry.icon}</td>
                  <td className="px-4 py-2">{entry.label}</td>
                  <td className={`px-4 py-2 text-right font-medium ${entry.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {entry.type === "income" ? "+" : "-"}${entry.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold bg-muted/30">
                <td colSpan={2} className="px-4 py-2">Total Income</td>
                <td className="px-4 py-2 text-right text-green-600">+${totalIncome.toFixed(2)}</td>
              </tr>
              <tr className="border-t font-semibold bg-muted/30">
                <td colSpan={2} className="px-4 py-2">Total Expenses</td>
                <td className="px-4 py-2 text-right text-red-600">-${totalExpenses.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
