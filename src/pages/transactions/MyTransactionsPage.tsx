import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/api";
import { statusLabel, statusVariant } from "@/lib/transaction-status";
import { getMyTransactions } from "@/lib/transactions";
import { cn, formatCurrency } from "@/lib/utils";
import type { TransactionListItem, TransactionStatus } from "@/types/transaction";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";

const tabs: { key: string; label: string; statuses: TransactionStatus[] }[] = [
  { key: "active", label: "Aktif", statuses: ["WAITING_PAYMENT", "WAITING_CONFIRMATION"] },
  { key: "done", label: "Selesai", statuses: ["DONE"] },
  { key: "closed", label: "Ditutup", statuses: ["REJECTED", "CANCELED", "EXPIRED"] },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function MyTransactionsPage() {
  const [items, setItems] = useState<TransactionListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(tabs[0].key);

  // One request for every status; the tabs filter locally.
  useEffect(() => {
    getMyTransactions()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Gagal memuat pesanan."));
  }, []);

  const current = tabs.find((t) => t.key === tab)!;
  const shown = (items ?? []).filter((t) => current.statuses.includes(t.status));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <h1 className="type-page-title">Pesanan saya</h1>

      <div className="flex gap-2">
        {tabs.map((t) => {
          const count = (items ?? []).filter((i) => t.statuses.includes(i.status)).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t.key ? "border-primary bg-primary-subtle text-primary" : "bg-field hover:border-primary",
              )}
            >
              {t.label} {items && `(${count})`}
            </button>
          );
        })}
      </div>

      {error && <div className="text-destructive">{error}</div>}
      {!items && !error && <div className="text-muted-foreground">Memuat pesanan…</div>}
      {items && shown.length === 0 && (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Belum ada pesanan di sini.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {shown.map((t) => (
          <NavLink
            key={t.id}
            to={`/transactions/${t.id}`}
            className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
          >
            <img
              src={t.event.eventPicture || "/images/events/event1.png"}
              alt=""
              className="size-16 shrink-0 rounded-xl object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-bold">{t.event.name}</span>
              <span className="text-sm text-muted-foreground">
                {t.ticketType.name} × {t.quantity} · {formatDate(t.event.startDate)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="type-price">{formatCurrency(Number(t.totalPrice), "IDR")}</span>
              <Badge variant={statusVariant[t.status]}>{statusLabel[t.status]}</Badge>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
