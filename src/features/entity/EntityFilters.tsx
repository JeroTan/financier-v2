import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

type EntityFiltersProps = {
  typeFilter: string;
  search: string;
  startDate: string;
  endDate: string;
  onTypeChange: (type: string) => void;
  onSearchChange: (search: string) => void;
  onDateChange: (start: string, end: string) => void;
  onReset: () => void;
};

export function EntityFilters({ typeFilter, search, startDate, endDate, onTypeChange, onSearchChange, onDateChange, onReset }: EntityFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const hasFilters = typeFilter !== "all" || search || startDate || endDate;

  return (
    <div className="space-y-3">
      {/* Type Toggle */}
      <div className="flex gap-2">
        {["all", "expense", "income"].map((t) => (
          <Button
            key={t}
            variant={typeFilter === t ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(t)}
            className={typeFilter === t ? "bg-gold-500 text-gold-950 hover:bg-gold-600" : ""}
          >
            {t === "all" ? "All" : t === "expense" ? "Expenses" : "Income"}
          </Button>
        ))}
      </div>

      {/* Search + Dates */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input type="date" value={startDate} onChange={(e) => onDateChange(e.target.value, endDate)} className="sm:w-40" />
        <Input type="date" value={endDate} onChange={(e) => onDateChange(startDate, e.target.value)} className="sm:w-40" />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <Filter className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
