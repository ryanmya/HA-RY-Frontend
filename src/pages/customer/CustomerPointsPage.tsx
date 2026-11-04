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
import { getCustomerPoints, type CustomerPoint } from "@/lib/customer-points";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const pointsFormatter = new Intl.NumberFormat("id-ID");
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const statusDetails = {
  AVAILABLE: { label: "Tersedia", variant: "success" },
  REDEEMED: { label: "Ditukar", variant: "muted" },
  EXPIRED: { label: "Kedaluwarsa", variant: "destructive" },
} as const;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Gagal memuat riwayat poin. Silakan coba lagi.";
}

export default function CustomerPointsPage() {
  const [points, setPoints] = useState<CustomerPoint[]>([]);
  const [pointTotal, setPointTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryCursor, setRetryCursor] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadMorePoints = async (cursor: string | null) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await getCustomerPoints({ cursor });
      setPoints((currentPoints) => [...currentPoints, ...page.data]);
      setPointTotal(page.pagination.pointTotal);
      setNextCursor(page.pagination.nextCursor);
      setHasNextPage(page.pagination.hasNextPage);
      setRetryCursor(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setRetryCursor(cursor);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getCustomerPoints()
      .then((page) => {
        if (!active) return;
        setPoints(page.data);
        setPointTotal(page.pagination.pointTotal);
        setNextCursor(page.pagination.nextCursor);
        setHasNextPage(page.pagination.hasNextPage);
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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Button variant="outline" className="self-start" render={<Link to="/" />}>
        <ArrowLeft aria-hidden="true" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat poin</CardTitle>
          <CardDescription>
            Riwayat poin yang Anda dapatkan, masa berlaku, dan statusnya.
            {!loading && !error && ` Menampilkan ${points.length} dari ${pointTotal} riwayat.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="py-8 text-center text-muted-foreground" role="status">
              Memuat riwayat poin…
            </p>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <p className="text-destructive" role="alert">{error}</p>
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={() => void loadMorePoints(retryCursor)}
              >
                <RefreshCw aria-hidden="true" />
                Coba lagi
              </Button>
            </div>
          )}

          {!loading && !error && points.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada riwayat poin.
            </p>
          )}

          {!loading && points.length > 0 && (
            <div className="divide-y">
              {points.map((point) => {
                const status = statusDetails[point.status];
                return (
                  <article
                    key={point.id}
                    className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">
                        +{pointsFormatter.format(Number(point.amount))} pts
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Didapat {formatDate(point.createdAt)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Berlaku hingga {formatDate(point.expiresAt)}
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </article>
                );
              })}
              {error && (
                <div className="flex flex-col items-center gap-3 py-5">
                  <p className="text-sm text-destructive" role="alert">{error}</p>
                  <Button
                    variant="outline"
                    disabled={loadingMore}
                    onClick={() => void loadMorePoints(retryCursor)}
                  >
                    <RefreshCw aria-hidden="true" />
                    Coba lagi
                  </Button>
                </div>
              )}
              {hasNextPage && !error && (
                <div className="flex justify-center pt-5">
                  <Button
                    variant="outline"
                    disabled={loadingMore}
                    onClick={() => void loadMorePoints(nextCursor)}
                  >
                    {loadingMore ? "Memuat…" : "Muat riwayat lainnya"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
