import { Card, CardContent } from "@/components/ui/card";

type ActionTableProps = {
  data: Record<string, unknown>;
};

export function ActionTable({ data }: ActionTableProps) {
  const headers = (data.headers as string[]) ?? [];
  const rows = (data.rows as string[][]) ?? [];

  if (headers.length === 0) return null;

  return (
    <Card className="my-2 overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 border-b">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
