import CardImage from "@/components/card-image";
import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { getEvents } from "@/lib/events";
import { formatCurrency } from "@/lib/utils";
import { Icon } from "@iconify/react";

type TypeEventGroup = {
  title: string;
  count: number;
  icon: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function HomePage() {
  const eventGroup: TypeEventGroup[] = [
    { title: "Musik", count: 1204, icon: "lucide:music" },
    { title: "Konferensi", count: 610, icon: "lucide:presentation" },
    { title: "Seni", count: 388, icon: "lucide:palette" },
    { title: "Olahraga", count: 271, icon: "lucide:trophy" },
    { title: "Workshop", count: 194, icon: "lucide:wrench" },
    { title: "Gratis", count: 412, icon: "lucide:ticket" },
  ];

  // Loads 12 events at a time as the user scrolls.
  const { items: events, loading, error, sentinelRef } = useInfiniteList((cursor) => getEvents({ cursor }));

  return (
    <div className="flex border-none p-0 flex-col gap-8">
      <div className="h-fit relative isolate overflow-hidden pt-[38px] flex flex-col px-20 gap-7">
        <div className="absolute inset-0 -z-10 bg-primary h-7/8"></div>
        <div className="flex flex-col gap-2">
          <div className="text-[44px] font-bold text-white">
            Cari acara, amankan kursinya.
          </div>
          <div className="text-white/70">
            4200 acara aktif di 61 kota - konser, konferensi, lari, workshop.
          </div>
        </div>
        <Card className="p-3">
          <CardContent className="p-0">
            <form className="grid grid-cols-[4fr_4fr_4fr_1fr] items-end gap-1">
              <TextField label="Cari"/>
              <TextField label="Kota"/>
              <TextField label="Tanggal"/>
              <Button>Cari Acara</Button>
            </form>
          </CardContent>
        </Card>
        <div className="grid grid-cols-6 gap-3">
          {eventGroup.map((group) => (
            <Card key={group.title}>
              <CardContent className="flex flex-col items-center gap-1">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon icon={group.icon} className="size-4" />
                </div>
                <div className="font-semibold">{group.title}</div>
                <div className="text-sm text-muted-foreground">
                  {group.count.toLocaleString("id-ID")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="px-20 flex justify-between">
        <div className="flex flex-col gap-4">
          <div className="type-section">Acara Terdekat</div>
          <div className="flex items-center">
            Oktober 2026 <Icon icon={"mdi:dot"} /> Jakarta dan sekitarnya
          </div>
        </div>

        <Button variant={"link"} appendIcon={<Icon icon="mdi:arrow-right" />}>
          Lihat semua 4.200
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2 px-20">
        {events.map((e) => (
          <CardImage
            key={e.id}
            title={e.name}
            place={e.location}
            startDate={formatDate(e.startDate)}
            endDate={formatDate(e.endDate)}
            price={Number(e.lowestPrice ?? 0)}
            seats={e.availableSeats}
            tags={<Badge variant={"default"}>{e.category}</Badge>}
            topLeft={
              e.bestVoucher && (
                <Badge variant={"destructive"}>
                  Voucher {formatCurrency(Number(e.bestVoucher.discountAmount), "IDR")}
                </Badge>
              )
            }
          />
        ))}
      </div>
      <div ref={sentinelRef} />
      {loading && <div className="px-20 text-muted-foreground">Memuat acara…</div>}
      {error && <div className="px-20 text-destructive">{error}</div>}
    </div>
  );
}
