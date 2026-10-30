import CardImage from "@/components/card-image";
import { DateRangeField, type DateRange } from "@/components/date-range-field";
import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { toDateParam } from "@/lib/date";
import { getEvents } from "@/lib/events";
import { cn, formatCurrency } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

// Height of the sticky Navbar (h-16); the search bar pins right below it.
const NAV_HEIGHT = 64;

type TypeEventGroup = {
  title: string;
  count: number;
  icon: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function HomePage() {

  const nav = useNavigate()

  const eventGroup: TypeEventGroup[] = [
    { title: "Musik", count: 1204, icon: "lucide:music" },
    { title: "Konferensi", count: 610, icon: "lucide:presentation" },
    { title: "Seni", count: 388, icon: "lucide:palette" },
    { title: "Olahraga", count: 271, icon: "lucide:trophy" },
    { title: "Workshop", count: 194, icon: "lucide:wrench" },
    { title: "Gratis", count: 412, icon: "lucide:ticket" },
  ];

  // "Cari" matches any text field on the backend; "Tanggal" filters by a date range.
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<DateRange>();
  const debouncedSearch = useDebounce(search.trim());
  // With only a start picked, filter by that single day.
  const from = toDateParam(range?.from);
  const to = toDateParam(range?.to ?? range?.from);

  // Loads 12 events at a time as the user scrolls; restarts from page 1 when the filters change.
  const { items: events, loading, error, sentinelRef } = useInfiniteList(
    (cursor) => getEvents({ cursor, search: debouncedSearch, from, to }),
    [debouncedSearch, from, to],
  );

  // The search bar's spot in the hero. Once it scrolls under the navbar, the bar is pinned
  // with `fixed` and this spot keeps its height so the page doesn't jump.
  const searchSlotRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [searchHeight, setSearchHeight] = useState(0);

  useEffect(() => {
    const slot = searchSlotRef.current;
    if (!slot) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSearchHeight(entry.boundingClientRect.height);
        setStuck(entry.boundingClientRect.top < NAV_HEIGHT);
      },
      { rootMargin: `-${NAV_HEIGHT}px 0px 0px 0px`, threshold: [0, 1] },
    );
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  // Scrolls to the list; the search bar pins itself on the way down.
  const scrollToList = () => listRef.current?.scrollIntoView({ behavior: "smooth" });
  console.log(events)
  return (
    <div className="flex border-none p-0 flex-col gap-8">
      <div className="h-fit relative isolate overflow-hidden pt-[38px] flex flex-col px-20 gap-7 z-40">
        <div className="absolute inset-0 -z-10 bg-primary h-7/8"></div>
        <div className="flex flex-col gap-2">
          <div className="text-[44px] font-bold text-white">
            Cari acara, amankan kursinya.
          </div>
          <div className="text-white/70">
            {events.length || 0} acara aktif di 61 kota - konser, konferensi, lari, workshop.
          </div>
        </div>
        <div ref={searchSlotRef} style={stuck ? { height: searchHeight } : undefined}>
          <div
            className={cn(
              stuck &&
                "fixed inset-x-0 top-16 z-20 bg-primary px-20 py-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200",
            )}
          >
            <Card className="p-3">
              <CardContent className="p-0">
                <form
                  className="grid grid-cols-[8fr_4fr_1fr] items-end gap-1"
                  // Results already update as you type; the button just jumps to them.
                  onSubmit={(e) => {
                    e.preventDefault();
                    scrollToList();
                  }}
                >
                  <TextField
                    label="Cari"
                    placeholder="Nama acara, kota, kategori…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <DateRangeField label="Tanggal" value={range} onChange={setRange} />
                  <Button type="submit">Cari Acara</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-3 hidden">
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
      <div
        ref={listRef}
        // Leaves room for the navbar and the pinned search bar (plus its py-3) when scrolled to.
        style={{ scrollMarginTop: NAV_HEIGHT + searchHeight + 24 + 16 }}
        // Fades out (keeping its space so the grid doesn't jump) while the search bar is pinned.
        className={cn(
          "px-20 flex justify-between transition-opacity duration-200",
          stuck && "pointer-events-none opacity-0",
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="type-section">Acara Terdekat</div>
          <div className="flex items-center">
            {new Date().toLocaleDateString("id-ID", {month: "long"})} {new Date().getFullYear()} <Icon icon={"mdi:dot"} /> Jakarta dan sekitarnya
          </div>
        </div>

        <Button variant={"link"} appendIcon={<Icon icon="mdi:arrow-right" />} onClick={scrollToList}>
          Lihat semua {events.length || 0}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2 px-20 z-10">
        {events.map((e) => (
          <CardImage
            key={e.id}
            imageUrl={e.eventPicture ?? undefined}
            title={e.name}
            place={e.location}
            startDate={formatDate(e.startDate)}
            endDate={formatDate(e.endDate)}
            price={Number(e.ticketTypes?.[0]?.price ?? 0)}
            seats={e.availableSeats}
            tags={<Badge variant={"default"}>{e.category}</Badge>}
            topLeft={
              e.vouchers?.[0]?.discountAmount && (
                <Badge variant={"destructive"}>
                  Voucher {formatCurrency(Number(e.vouchers?.[0].discountAmount), "IDR")}
                </Badge>
              )
            }
            onClick={() => nav("/events-details/" + e.id)}
          />
        ))}
      </div>
      <div ref={sentinelRef} />
      {loading && <div className="px-20 text-muted-foreground">Memuat acara…</div>}
      {error && <div className="px-20 text-destructive">{error}</div>}
    </div>
  );
}
