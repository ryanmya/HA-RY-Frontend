import CardImage from "@/components/card-image";
import { Badge } from "@/components/ui/badge";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { getEventsByOrganizer } from "@/lib/events";
import { formatCurrency } from "@/lib/utils";
import { useEventEditorStore } from "@/stores/event-editor";
import { useNavigate } from "react-router";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function OrganizerEventsPage() {
  const navigate = useNavigate();
  const eventsVersion = useEventEditorStore((s) => s.eventsVersion);
  // Starts over whenever an event is published from the Buat Acara dialog.
  const { items: events, loading, error, hasMore, sentinelRef } = useInfiniteList(
    (cursor) => getEventsByOrganizer({ cursor }),
    [eventsVersion],
  );
  console.log(events)
  if (!loading && !error && !hasMore && events.length === 0)
    return <div className="p-6 text-muted-foreground">Belum ada acara yang terbit.</div>;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((e) => (
          <CardImage
            key={e.id}
            title={e.name}
            place={e.location}
            startDate={formatDate(e.startDate)}
            endDate={formatDate(e.endDate)}
            price={Number(e.lowestPrice ?? 0)}
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
      <div ref={sentinelRef} />
      {loading && <div className="text-muted-foreground">Memuat acara…</div>}
      {error && <div className="text-destructive">{error}</div>}
    </div>
  );
}
