import { useState, useEffect, useCallback } from "react";
import { Inbox } from "lucide-react";
import { TransactionCard } from "./TransactionCard";
import { EntityFilters } from "./EntityFilters";
import { EntityPagination } from "./EntityPagination";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

function hasActiveFilters(typeFilter: string, search: string, startDate: string, endDate: string): boolean {
  return typeFilter !== "all" || !!search || !!startDate || !!endDate;
}

type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string | null;
  categoryId: string | null;
  receiptUrl: string | null;
  category?: { name: string; icon: string };
};

type EntityCardListProps = {
  token?: string;
};

export function EntityCardList({ token }: EntityCardListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Record<string, { name: string; icon: string }>>({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (search) params.set("search", search);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("page", String(page));
    params.set("limit", String(limit));

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const [txRes, catRes] = await Promise.all([
        fetch(`/api/transactions?${params}`, {
          credentials: "same-origin",
          headers,
        }),
        fetch("/api/categories", {
          credentials: "same-origin",
          headers,
        }),
      ]);

      const txData = await txRes.json() as { success: boolean; data: { transactions: Transaction[]; total: number; totalPages: number } };
      const catData = await catRes.json() as { success: boolean; data: { id: string; name: string; icon: string }[] };

      if (txData.success) {
        setTransactions(txData.data.transactions);
        setTotal(txData.data.total);
        setTotalPages(txData.data.totalPages);
      }

      if (catData.success) {
        const catMap: Record<string, { name: string; icon: string }> = {};
        catData.data.forEach((c) => { catMap[c.id] = { name: c.name, icon: c.icon }; });
        setCategories(catMap);
      }
    } catch {
      // Error handled by UI
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter, search, startDate, endDate, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, search, startDate, endDate]);

  const handleReset = () => {
    setTypeFilter("all");
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-4">
      <EntityFilters
        typeFilter={typeFilter}
        search={search}
        startDate={startDate}
        endDate={endDate}
        onTypeChange={setTypeFilter}
        onSearchChange={setSearch}
        onDateChange={(start, end) => { setStartDate(start); setEndDate(end); }}
        onReset={handleReset}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <Inbox className="mx-auto mb-2 h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-muted-foreground">
            {hasActiveFilters(typeFilter, search, startDate, endDate) ? "No transactions match your filters." : "No transactions yet. Start by adding one!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                id={tx.id}
                type={tx.type}
                amount={tx.amount}
                date={tx.date}
                description={tx.description}
                categoryId={tx.categoryId}
                categoryName={tx.categoryId ? categories[tx.categoryId]?.name : undefined}
                categoryIcon={tx.categoryId ? categories[tx.categoryId]?.icon : undefined}
                receiptUrl={tx.receiptUrl}
              />
            ))}
          </div>
          <EntityPagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </>
      )}
    </div>
  );
}
