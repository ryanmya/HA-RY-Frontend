import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import {
  getOrganizerReport,
  type OrganizerReport,
  type OrganizerReportTimelineItem,
} from "@/lib/organizer-reports";
import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  RefreshCw,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const numberFormatter = new Intl.NumberFormat("id-ID");
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short" });
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function formatMonth(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : monthFormatter.format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Gagal memuat ringkasan organizer. Silakan coba lagi.";
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CalendarDays;
  tone: "blue" | "green" | "violet" | "amber";
}) {
  const toneClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function RevenueTimeline({ items }: { items: OrganizerReportTimelineItem[] }) {
  const maxRevenue = Math.max(...items.map((item) => item.revenue), 1);
  const chartItems = items.slice(-12);

  return (
    <div className="mt-6">
      {chartItems.every((item) => item.revenue === 0) ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          Belum ada pendapatan pada periode ini.
        </div>
      ) : (
        <div
          className="grid h-52 grid-cols-6 items-end gap-3 sm:grid-cols-12"
          role="img"
          aria-label="Grafik pendapatan bulanan"
        >
          {chartItems.map((item) => {
            const height = Math.max((item.revenue / maxRevenue) * 100, item.revenue ? 8 : 2);
            return (
              <div key={item.period} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                <span className="max-w-full truncate text-[10px] text-muted-foreground sm:text-xs">
                  {item.revenue ? currencyFormatter.format(item.revenue) : ""}
                </span>
                <div className="flex h-[72%] w-full items-end rounded-t-md bg-muted/60">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/65 transition-all"
                    style={{ height: `${height}%` }}
                    title={`${formatMonth(item.period)}: ${currencyFormatter.format(item.revenue)}`}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatMonth(item.period)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrganizerHomePage() {
  const [report, setReport] = useState<OrganizerReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await getOrganizerReport());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getOrganizerReport()
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 p-10 text-center">
        <Activity className="size-10 text-muted-foreground" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-bold">Ringkasan belum tersedia</h1>
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error ?? "Data laporan tidak tersedia."}
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadReport()}>
          <RefreshCw aria-hidden="true" />
          Coba lagi
        </Button>
      </main>
    );
  }

  const { overview } = report;
  const transactionStatuses = [
    { label: "Selesai", value: overview.transactions.done, color: "bg-emerald-500" },
    { label: "Menunggu pembayaran", value: overview.transactions.waitingPayment, color: "bg-amber-500" },
    { label: "Menunggu konfirmasi", value: overview.transactions.waitingConfirmation, color: "bg-blue-500" },
    { label: "Ditolak", value: overview.transactions.rejected, color: "bg-rose-500" },
    { label: "Kedaluwarsa", value: overview.transactions.expired, color: "bg-slate-400" },
    { label: "Dibatalkan", value: overview.transactions.canceled, color: "bg-violet-400" },
  ];
  const eventStatusTotal = overview.events.upcoming + overview.events.ongoing + overview.events.completed;
  const eventStatuses = [
    { label: "Akan datang", value: overview.events.upcoming, color: "bg-blue-500" },
    { label: "Berlangsung", value: overview.events.ongoing, color: "bg-emerald-500" },
    { label: "Selesai", value: overview.events.completed, color: "bg-slate-400" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-primary uppercase">
            <TrendingUp className="size-4" aria-hidden="true" />
            Dashboard organizer
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Ringkasan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Performa acara dan transaksi Anda dari {formatDate(report.dateRange.from)} hingga{" "}
            {formatDate(report.dateRange.to)}.
          </p>
        </div>
        <Badge variant="muted" className="px-3 py-1.5">
          Diperbarui dari laporan terbaru
        </Badge>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistik utama">
        <SummaryCard
          label="Total pendapatan"
          value={currencyFormatter.format(overview.revenue)}
          detail={`${currencyFormatter.format(overview.pendingPaymentAmount)} menunggu pembayaran`}
          icon={CircleDollarSign}
          tone="green"
        />
        <SummaryCard
          label="Tiket terjual"
          value={numberFormatter.format(overview.ticketsSold)}
          detail={`${numberFormatter.format(overview.transactions.total)} total transaksi`}
          icon={Ticket}
          tone="blue"
        />
        <SummaryCard
          label="Total acara"
          value={numberFormatter.format(overview.events.total)}
          detail={`${numberFormatter.format(overview.events.upcoming)} acara akan datang`}
          icon={CalendarDays}
          tone="violet"
        />
        <SummaryCard
          label="Transaksi selesai"
          value={numberFormatter.format(overview.transactions.done)}
          detail={`${numberFormatter.format(overview.transactions.waitingPayment + overview.transactions.waitingConfirmation)} perlu diproses`}
          icon={Activity}
          tone="amber"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Tren pendapatan</CardTitle>
            <CardDescription>Pendapatan per bulan selama periode laporan.</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueTimeline items={report.timeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status transaksi</CardTitle>
            <CardDescription>
              {numberFormatter.format(overview.transactions.total)} transaksi tercatat.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-label="Distribusi transaksi">
              {transactionStatuses.map((status) =>
                status.value > 0 && overview.transactions.total > 0 ? (
                  <div
                    key={status.label}
                    className={status.color}
                    style={{ width: `${(status.value / overview.transactions.total) * 100}%` }}
                    title={`${status.label}: ${status.value}`}
                  />
                ) : null,
              )}
            </div>
            <div className="flex flex-col gap-3">
              {transactionStatuses.map((status) => (
                <div key={status.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={`size-2.5 rounded-full ${status.color}`} />
                    {status.label}
                  </span>
                  <span className="font-semibold">{numberFormatter.format(status.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.6fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Status acara</CardTitle>
            <CardDescription>Ringkasan kondisi seluruh acara Anda.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-label="Distribusi status acara">
              {eventStatuses.map((status) =>
                status.value > 0 && eventStatusTotal > 0 ? (
                  <div
                    key={status.label}
                    className={status.color}
                    style={{ width: `${(status.value / eventStatusTotal) * 100}%` }}
                    title={`${status.label}: ${status.value}`}
                  />
                ) : null,
              )}
            </div>
            {eventStatuses.map((status) => (
              <div key={status.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className={`size-2.5 rounded-full ${status.color}`} />
                  {status.label}
                </span>
                <span className="font-semibold">{numberFormatter.format(status.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performa acara</CardTitle>
            <CardDescription>Penjualan dan pendapatan dari setiap acara.</CardDescription>
          </CardHeader>
          <CardContent>
            {report.events.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada acara untuk ditampilkan.
              </p>
            ) : (
              <div className="flex flex-col divide-y">
                {report.events.map((event) => (
                  <article key={event.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{event.name}</h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {event.category} · {event.location}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(event.startDate)}
                      </p>
                    </div>
                    <div className="grid w-full grid-cols-3 gap-4 text-left sm:w-[min(100%,24rem)] sm:text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Transaksi</p>
                        <p className="mt-1 font-semibold">{numberFormatter.format(event.transactionCount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tiket</p>
                        <p className="mt-1 font-semibold">{numberFormatter.format(event.ticketsSold)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pendapatan</p>
                        <p className="mt-1 font-semibold">{currencyFormatter.format(event.revenue)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
