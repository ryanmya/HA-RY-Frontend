import CardImage from "@/components/card-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { getEventsByOrganizer } from "@/lib/events";
import { formatCurrency } from "@/lib/utils";
import { useEventEditorStore } from "@/stores/event-editor";
import { ChevronDown, LoaderCircle, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const getResponsivePageSize = () => {
  if (typeof window === "undefined") return 3;

  const columns = window.innerWidth >= 1280 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const cardRowHeight = columns === 3 ? 420 : columns === 2 ? 360 : 400;
  const contentHeight = Math.max(0, window.innerHeight - 200);
  const rows = Math.max(1, Math.floor(contentHeight / cardRowHeight));

  return columns * rows;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const getEventPrice = (event: { isFree: boolean; lowestPrice?: string | number; ticketTypes?: { price: string | number }[] }) => {
  if (event.isFree) return 0;
  if (event.lowestPrice != null) return Number(event.lowestPrice);
  const prices = (event.ticketTypes ?? []).map((ticket) => Number(ticket.price));
  return prices.length ? Math.min(...prices) : 0;
};

export default function OrganizerEventsPage() {
  const navigate = useNavigate();
  const eventsVersion = useEventEditorStore((s) => s.eventsVersion);
  const [pageSize, setPageSize] = useState(getResponsivePageSize);

  useEffect(() => {
    const updatePageSize = () => setPageSize(getResponsivePageSize());
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  // Starts over whenever an event is published from the Buat Acara dialog.
  const { items: events, loading, error, hasMore, loadMore, sentinelRef } = useInfiniteList(
    (cursor) => getEventsByOrganizer({ cursor, limit: pageSize }),
    [eventsVersion],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <Trophy className="size-4" />
            PUSAT ACARA
          </div>
          <h1 className="text-2xl font-bold">Acara</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola acara yang telah Anda terbitkan.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {events.length} acara ditampilkan
        </span>
      </div>

      {events.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => (
            <CardImage
              key={e.id}
              imageUrl={e.eventPicture ?? ""}
              title={e.name}
              place={e.location}
              startDate={formatDate(e.startDate)}
              endDate={formatDate(e.endDate)}
              price={getEventPrice(e)}
              seats={e.availableSeats}
              topLeft={
                e.bestVoucher && (
                  <Badge variant="destructive">
                    Voucher · {formatCurrency(Number(e.bestVoucher.discountAmount), "IDR")}
                  </Badge>
                )
              }
              onClick={() => navigate(`/organizer/events/${e.id}`)}
            />
          ))}
        </div>
      )}
      {events.length === 0 && hasMore && (
        <div ref={sentinelRef} aria-hidden="true" />
      )}

      {!loading && !error && events.length === 0 && (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Belum ada acara yang terbit.
        </div>
      )}
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive-subtle/20 p-4 text-sm text-destructive">
          <span>{error}</span>
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            Coba lagi
          </Button>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="size-4 animate-spin" />
          Memuat acara…
        </div>
      )}
      {!loading && !error && hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>
            Muat lebih banyak
            <ChevronDown />
          </Button>
        </div>
      )}
    </div>
  );
}
