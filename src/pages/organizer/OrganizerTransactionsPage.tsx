import { DateRangeField } from "@/components/date-range-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateOrganizerTransactionStatus,
  getOrganizerEventTransactions,
  getOrganizerTransactionSummaries,
  type OrganizerEventTransaction,
  type OrganizerTransactionSummary,
} from "@/lib/organizer-transactions";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { ApiError } from "@/lib/api";
import { CalendarDays, CheckCircle2, Clock3, Eye, LoaderCircle, Search, Ticket, X, ExternalLink, Check, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "@/components/date-range-field";

type TransactionFilter = "ALL" | "PENDING" | "DONE" | "EXPIRED" | "CANCELLED" | "REJECTED";

const transactionFilters: { value: TransactionFilter; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Pending" },
  { value: "DONE", label: "Selesai" },
  { value: "EXPIRED", label: "Kedaluwarsa" },
  { value: "CANCELLED", label: "Dibatalkan" },
  { value: "REJECTED", label: "Ditolak" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatDateRangeValue = (range: DateRange | undefined) => ({
  from: range?.from ? toDateInput(range.from) : "",
  to: range?.to ? toDateInput(range.to) : "",
});

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function matchesDateRange(iso: string, range: DateRange | undefined) {
  if (!range?.from && !range?.to) return true;
  const date = iso.slice(0, 10);
  const { from, to } = formatDateRangeValue(range);
  return (!from || date >= from) && (!to || date <= to);
}

function countPending(transactions: OrganizerEventTransaction[]) {
  return transactions.filter(
    (transaction) =>
      transaction.status === "WAITING_PAYMENT" ||
      transaction.status === "WAITING_CONFIRMATION",
  ).length;
}

function transactionMatchesFilter(
  transaction: OrganizerEventTransaction,
  filter: TransactionFilter,
) {
  if (filter === "ALL") return true;
  if (filter === "PENDING") {
    return (
      transaction.status === "WAITING_PAYMENT" ||
      transaction.status === "WAITING_CONFIRMATION"
    );
  }
  if (filter === "CANCELLED") return transaction.status === "CANCELED";
  return transaction.status === filter;
}

function TransactionStatusBadge({ status }: { status: OrganizerEventTransaction["status"] }) {
  const details: Record<
    OrganizerEventTransaction["status"],
    { label: string; variant: "warning" | "success" | "muted" | "destructive" }
  > = {
    WAITING_PAYMENT: { label: "Menunggu pembayaran", variant: "warning" },
    WAITING_CONFIRMATION: { label: "Menunggu konfirmasi", variant: "warning" },
    DONE: { label: "Selesai", variant: "success" },
    EXPIRED: { label: "Kedaluwarsa", variant: "muted" },
    CANCELED: { label: "Dibatalkan", variant: "muted" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
  };
  const detail = details[status];
  return <Badge variant={detail.variant}>{detail.label}</Badge>;
}

function StatusCount({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "warning" | "success" | "muted" | "destructive";
}) {
  const toneClass = {
    warning: "bg-warning-subtle text-warning",
    success: "bg-success-subtle text-success",
    muted: "bg-muted-subtle text-muted-foreground",
    destructive: "bg-destructive-subtle text-destructive",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${toneClass}`}>
      {label} <span className="font-bold">{count}</span>
    </span>
  );
}

function DetailStatusCount({
  event,
  count,
  onClick,
}: {
  event: OrganizerTransactionSummary;
  count: number;
  onClick: (event: OrganizerTransactionSummary, filter: TransactionFilter) => void;
}) {
  const options: {
    filter: Exclude<TransactionFilter, "ALL">;
    count: number;
    tone: "warning" | "success" | "muted" | "destructive";
    label: string;
  }[] = [
    { filter: "PENDING", count: event.pendingTransaction, tone: "warning", label: "Pending" },
    { filter: "DONE", count: event.doneTransaction, tone: "success", label: "Selesai" },
    { filter: "EXPIRED", count: event.expiredTransaction, tone: "muted", label: "Expired" },
    { filter: "CANCELLED", count: event.cancelledTransaction, tone: "muted", label: "Batal" },
    { filter: "REJECTED", count: event.rejectedTransaction, tone: "destructive", label: "Ditolak" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.filter}
          type="button"
          disabled={!event.eventId || option.count === 0}
          onClick={() => onClick(event, option.filter)}
          className="disabled:cursor-default disabled:opacity-60"
          aria-label={`Lihat ${option.count} transaksi ${option.label.toLowerCase()}`}
        >
          <StatusCount label={option.label} count={option.count} tone={option.tone} />
        </button>
      ))}
      {count === 0 && <span className="text-xs text-muted-foreground">Belum ada transaksi</span>}
    </div>
  );
}

export default function OrganizerTransactionsPage() {
  const isSuperAdmin = useAuthStore((state) => state.user?.role === "SUPER_ADMIN");
  const [events, setEvents] = useState<OrganizerTransactionSummary[]>([]);
  const [eventTotal, setEventTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [eventNameSearch, setEventNameSearch] = useState("");
  const [startDateRange, setStartDateRange] = useState<DateRange>();
  const [endDateRange, setEndDateRange] = useState<DateRange>();
  const [selectedEvent, setSelectedEvent] = useState<OrganizerTransactionSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<OrganizerEventTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>("ALL");
  const [proofTransaction, setProofTransaction] = useState<OrganizerEventTransaction | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingTransactionId, setUpdatingTransactionId] = useState<string | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;
    getOrganizerTransactionSummaries()
      .then((result) => {
        if (!active) return;
        setEvents(result.events);
        setEventTotal(result.eventTotal);
        setLoadError(null);
      })
      .catch(() => {
        if (active) setLoadError("Gagal memuat ringkasan transaksi. Silakan coba lagi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const search = eventNameSearch.trim().toLocaleLowerCase("id-ID");
    return events.filter((event) => {
      const matchesName = !search || event.eventName.toLocaleLowerCase("id-ID").includes(search);
      return (
        matchesName &&
        matchesDateRange(event.start_date, startDateRange) &&
        matchesDateRange(event.end_date, endDateRange)
      );
    });
  }, [events, eventNameSearch, startDateRange, endDateRange]);

  const totals = useMemo(
    () =>
      events.reduce(
        (sum, event) => ({
          transactions: sum.transactions + event.totalTransaction,
          pending: sum.pending + event.pendingTransaction,
          done: sum.done + event.doneTransaction,
        }),
        { transactions: 0, pending: 0, done: 0 },
      ),
    [events],
  );

  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => transactionMatchesFilter(transaction, transactionFilter)),
    [transactions, transactionFilter],
  );

  const viewTransactions = async (
    event: OrganizerTransactionSummary,
    filter: TransactionFilter = "ALL",
  ) => {
    if (!event.eventId) return;
    const currentRequestId = ++requestId.current;
    setSelectedEvent(event);
    setTransactionFilter(filter);
    setTransactions([]);
    setTransactionsError(null);
    setActionError(null);
    setActionSuccess(null);
    setTransactionsLoading(true);
    setDialogOpen(true);

    try {
      const result = await getOrganizerEventTransactions(event.eventId);
      if (currentRequestId === requestId.current) setTransactions(result ?? []);
    } catch {
      if (currentRequestId === requestId.current) {
        setTransactionsError("Gagal memuat transaksi acara ini.");
      }
    } finally {
      if (currentRequestId === requestId.current) setTransactionsLoading(false);
    }
  };

  const closeDetails = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      requestId.current++;
      setActionError(null);
      setActionSuccess(null);
    }
  };

  const handleTransactionDecision = async (
    transaction: OrganizerEventTransaction,
    status: "DONE" | "REJECTED",
  ) => {
    setActionError(null);
    setActionSuccess(null);
    setUpdatingTransactionId(transaction.transactionId);
    try {
      const response = await updateOrganizerTransactionStatus(
        transaction.transactionId,
        status,
      );
      setActionSuccess(response.message);
      setTransactions((current) =>
        current.map((item) =>
          item.transactionId === transaction.transactionId ? { ...item, status } : item,
        ),
      );
      setProofTransaction((current) =>
        current?.transactionId === transaction.transactionId ? { ...current, status } : current,
      );

      try {
        const result = await getOrganizerTransactionSummaries();
        setEvents(result.events);
        setEventTotal(result.eventTotal);
      } catch {
        setActionError("Status berhasil diperbarui, tetapi ringkasan transaksi gagal dimuat ulang.");
      }
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : `Gagal ${status === "DONE" ? "menerima" : "menolak"} bukti pembayaran.`,
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  };

  const openProof = (transaction: OrganizerEventTransaction) => {
    setProofError(null);
    setProofTransaction(transaction);
    setProofDialogOpen(true);
  };

  const resetFilters = () => {
    setEventNameSearch("");
    setStartDateRange(undefined);
    setEndDateRange(undefined);
  };

  const retryLoad = () => {
    setLoadError(null);
    setLoading(true);
    getOrganizerTransactionSummaries()
      .then((result) => {
        setEvents(result.events);
        setEventTotal(result.eventTotal);
      })
      .catch(() => setLoadError("Gagal memuat ringkasan transaksi. Silakan coba lagi."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <Ticket className="size-4" />
            PUSAT TRANSAKSI
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Transaksi acara</h1>
          <p className="mt-2 text-muted-foreground">
            Pantau aktivitas tiket dan lihat transaksi berdasarkan statusnya.
          </p>
        </div>
        <Badge variant="muted" className="px-3 py-1.5 text-sm">
          {eventTotal} acara
        </Badge>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan transaksi">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Acara</p>
              <p className="mt-1 text-2xl font-bold">{loading ? "—" : eventTotal}</p>
              <p className="mt-1 text-xs text-muted-foreground">Total acara terbit</p>
            </div>
            <span className="rounded-xl bg-primary-subtle p-3 text-primary"><CalendarDays className="size-5" /></span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total transaksi</p>
              <p className="mt-1 text-2xl font-bold">{loading ? "—" : totals.transactions.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-xs text-muted-foreground">Semua status</p>
            </div>
            <span className="rounded-xl bg-primary-subtle p-3 text-primary"><Ticket className="size-5" /></span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Menunggu</p>
              <p className="mt-1 text-2xl font-bold">{loading ? "—" : totals.pending.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-xs text-muted-foreground">Perlu ditindaklanjuti</p>
            </div>
            <span className="rounded-xl bg-warning-subtle p-3 text-warning"><Clock3 className="size-5" /></span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Selesai</p>
              <p className="mt-1 text-2xl font-bold">{loading ? "—" : totals.done.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-xs text-muted-foreground">Transaksi berhasil</p>
            </div>
            <span className="rounded-xl bg-success-subtle p-3 text-success"><CheckCircle2 className="size-5" /></span>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filter acara</CardTitle>
          <CardDescription>
            Cari berdasarkan nama acara, tanggal mulai, atau tanggal selesai.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(220px,1.4fr)_1fr_1fr_auto] md:items-end">
          <div className="flex flex-col gap-2">
            <label htmlFor="event-name-search" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Nama acara
            </label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="event-name-search"
                value={eventNameSearch}
                onChange={(e) => setEventNameSearch(e.target.value)}
                placeholder="Cari nama acara…"
                className="h-12 pl-9"
              />
            </div>
          </div>
          <DateRangeField
            label="Tanggal mulai acara"
            value={startDateRange}
            onChange={setStartDateRange}
            placeholder="Pilih rentang tanggal"
          />
          <DateRangeField
            label="Tanggal selesai acara"
            value={endDateRange}
            onChange={setEndDateRange}
            placeholder="Pilih rentang tanggal"
          />
          <Button variant="outline" onClick={resetFilters} className="h-12">
            <X className="size-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      {loadError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-destructive">{loadError}</p>
            <Button variant="outline" onClick={retryLoad}>Coba lagi</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-end justify-between gap-4">
            <div>
              <CardTitle>Ringkasan per acara</CardTitle>
              <CardDescription className="mt-1">
                Menampilkan {filteredEvents.length} dari {events.length} acara
              </CardDescription>
            </div>
            {loading && <LoaderCircle className="size-5 animate-spin text-primary" aria-label="Memuat acara" />}
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="bg-muted-subtle/30 hover:bg-muted-subtle/30">
                    <TableHead className="pl-6">Acara</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Kursi tersedia</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Rincian status</TableHead>
                    <TableHead className="pr-6 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loading && filteredEvents.map((event) => (
                    <TableRow key={`${event.eventName}-${event.start_date}-${event.end_date}`}>
                      <TableCell className="max-w-64 whitespace-normal pl-6">
                        <span className="font-semibold">{event.eventName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{formatDate(event.start_date)}</div>
                        <div className="text-xs text-muted-foreground">s.d. {formatDate(event.end_date)}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {event.availableSeats.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {event.totalTransaction.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <DetailStatusCount
                          event={event}
                          count={event.totalTransaction}
                          onClick={viewTransactions}
                        />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!event.eventId}
                          onClick={() => viewTransactions(event)}
                        >
                          <Eye className="size-4" />
                          Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && filteredEvents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        Tidak ada acara yang cocok dengan filter.
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        Memuat ringkasan transaksi…
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={closeDetails}>
        <DialogContent className="w-[min(96vw,1400px)] max-h-[92vh] overflow-y-auto sm:max-w-[min(96vw,1400px)]">
          <DialogHeader>
            <DialogTitle className="pr-8">{selectedEvent?.eventName ?? "Transaksi acara"}</DialogTitle>
            <DialogDescription>
              {selectedEvent
                ? `${formatDate(selectedEvent.start_date)} – ${formatDate(selectedEvent.end_date)}`
                : "Rincian transaksi berdasarkan status"}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="flex flex-wrap gap-2">
              <StatusCount label="Semua" count={transactions.length} tone="muted" />
              <StatusCount label="Pending" count={countPending(transactions)} tone="warning" />
              <StatusCount label="Selesai" count={transactions.filter((transaction) => transaction.status === "DONE").length} tone="success" />
              <StatusCount label="Expired" count={transactions.filter((transaction) => transaction.status === "EXPIRED").length} tone="muted" />
              <StatusCount label="Dibatalkan" count={transactions.filter((transaction) => transaction.status === "CANCELED").length} tone="muted" />
              <StatusCount label="Ditolak" count={transactions.filter((transaction) => transaction.status === "REJECTED").length} tone="destructive" />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {transactionFilters.map((filter) => (
              <Button
                key={filter.value}
                size="sm"
                variant={transactionFilter === filter.value ? "default" : "outline"}
                onClick={() => setTransactionFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {transactionsError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive-subtle/20 p-4 text-sm text-destructive">
              <span>{transactionsError}</span>
              {selectedEvent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewTransactions(selectedEvent, transactionFilter)}
                >
                  Coba lagi
                </Button>
              )}
            </div>
          )}
          {actionError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive-subtle/20 p-3 text-sm text-destructive">
              {actionError}
            </p>
          )}
          {actionSuccess && (
            <p
              role="status"
              className="rounded-lg border border-success/30 bg-success-subtle/40 p-3 text-sm text-success"
            >
              {actionSuccess}
            </p>
          )}

          <div className="min-h-36 overflow-x-auto rounded-lg border">
            <Table className={isSuperAdmin ? "min-w-[1120px]" : "min-w-[900px]"}>
              <TableHeader>
                <TableRow className="bg-muted-subtle/30 hover:bg-muted-subtle/30">
                  <TableHead className="pl-4">Pelanggan</TableHead>
                  <TableHead>Tiket</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="pr-4">Status</TableHead>
                  <TableHead>Bukti pembayaran</TableHead>
                  {isSuperAdmin && <TableHead className="pr-4">Tindakan</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 7 : 6} className="h-28 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <LoaderCircle className="size-4 animate-spin" /> Memuat transaksi…
                      </span>
                    </TableCell>
                  </TableRow>
                ) : transactionsError ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 7 : 6} className="h-28 text-center text-muted-foreground">
                      Transaksi belum dapat ditampilkan.
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.transactionId}>
                      <TableCell className="pl-4">
                        <div className="font-semibold">{transaction.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID {transaction.customerId.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.ticketTypeName}</TableCell>
                      <TableCell className="text-center tabular-nums">{transaction.quantity}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(transaction.totalPrice, "IDR")}
                      </TableCell>
                      <TableCell className="pr-4">
                        <TransactionStatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        {transaction.paymentProofUrl ? (
                          <Button variant="outline" size="sm" onClick={() => openProof(transaction)}>
                            <Eye className="size-4" />
                            Lihat bukti
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Belum ada</span>
                        )}
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell className="pr-4">
                          {transaction.paymentProofUrl &&
                          transaction.status === "WAITING_CONFIRMATION" ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                disabled={updatingTransactionId === transaction.transactionId}
                                onClick={() => handleTransactionDecision(transaction, "DONE")}
                              >
                                {updatingTransactionId === transaction.transactionId ? (
                                  <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                  <Check className="size-4" />
                                )}
                                Terima
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={updatingTransactionId === transaction.transactionId}
                                onClick={() => handleTransactionDecision(transaction, "REJECTED")}
                              >
                                <XCircle className="size-4" />
                                Tolak
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 7 : 6} className="h-28 text-center text-muted-foreground">
                      Tidak ada transaksi pada status ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {!transactionsLoading && !transactionsError && (
            <p className="text-right text-xs text-muted-foreground">
              {filteredTransactions.length} transaksi ditampilkan
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent className="w-[min(96vw,1100px)] max-h-[92vh] overflow-y-auto sm:max-w-[min(96vw,1100px)]">
          <DialogHeader>
            <DialogTitle>Bukti pembayaran</DialogTitle>
            <DialogDescription>
              {proofTransaction
                ? `${proofTransaction.name} · ${proofTransaction.ticketTypeName} · ${formatCurrency(proofTransaction.totalPrice, "IDR")}`
                : "Bukti pembayaran transaksi"}
            </DialogDescription>
          </DialogHeader>
          {proofTransaction?.paymentProofUrl && (
            <div className="flex flex-col gap-4">
              {proofError ? (
                <p className="rounded-lg bg-destructive-subtle p-4 text-sm text-destructive">
                  Bukti tidak dapat ditampilkan di sini. Gunakan tombol untuk membukanya di tab baru.
                </p>
              ) : /\.pdf(?:$|[?#])/i.test(proofTransaction.paymentProofUrl) ? (
                <iframe
                  src={proofTransaction.paymentProofUrl}
                  title="Bukti pembayaran PDF"
                  className="h-[70vh] w-full rounded-lg border"
                  onError={() => setProofError("pdf")}
                />
              ) : (
                <img
                  src={proofTransaction.paymentProofUrl}
                  alt={`Bukti pembayaran dari ${proofTransaction.name}`}
                  className="max-h-[70vh] w-full rounded-lg border bg-muted-subtle object-contain"
                  onError={() => setProofError("image")}
                />
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" render={<a href={proofTransaction.paymentProofUrl} target="_blank" rel="noreferrer" />}>
                  <ExternalLink className="size-4" />
                  Buka di tab baru
                </Button>
                {isSuperAdmin && proofTransaction.status === "WAITING_CONFIRMATION" && (
                  <>
                    <Button
                      disabled={updatingTransactionId === proofTransaction.transactionId}
                      onClick={() => handleTransactionDecision(proofTransaction, "DONE")}
                    >
                      <Check className="size-4" />
                      Terima pembayaran
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={updatingTransactionId === proofTransaction.transactionId}
                      onClick={() => handleTransactionDecision(proofTransaction, "REJECTED")}
                    >
                      <XCircle className="size-4" />
                      Tolak pembayaran
                    </Button>
                  </>
                )}
              </div>
              {actionError && <p className="text-sm text-destructive">{actionError}</p>}
              {actionSuccess && (
                <p
                  role="status"
                  className="rounded-lg border border-success/30 bg-success-subtle/40 p-3 text-sm text-success"
                >
                  {actionSuccess}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
