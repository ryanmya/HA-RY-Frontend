import CardImage from "@/components/card-image";
import CustomerAccessDialog from "@/components/customer-access-dialog";
import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { getEvents } from "@/lib/events";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { Icon } from "@iconify/react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

type EventFilters = {
  category: string;
  availability: "all" | "free" | "paid";
  location: string;
};

const EMPTY_FILTERS: EventFilters = {
  category: "",
  availability: "all",
  location: "",
};

const filterSelectClass =
  "h-12 w-full rounded-xl border border-border bg-field px-4 text-[15px] text-foreground outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function HomePage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => Boolean(state.accessToken));
  const userType = useAuthStore((state) => state.user?.userType);
  const isCustomer = isLoggedIn && userType === "CUSTOMER";
  const listRef = useRef<HTMLDivElement>(null);
  const [draftFilters, setDraftFilters] = useState<EventFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const { items: events, loading, error, hasMore, loadMore, sentinelRef } = useInfiniteList(
    (cursor) => getEvents({ limit: 4, cursor }),
  );

  const categories = useMemo(
    () => [...new Set(events.map((event) => event.category).filter(Boolean))].sort(),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const category = filters.category.trim().toLocaleLowerCase("id-ID");
    const location = filters.location.trim().toLocaleLowerCase("id-ID");

    return events.filter((event) => {
      return (
        (!category || event.category.toLocaleLowerCase("id-ID").includes(category)) &&
        (filters.availability === "all" ||
          (filters.availability === "free" ? event.isFree : !event.isFree)) &&
        (!location || event.location.toLocaleLowerCase("id-ID").includes(location))
      );
    });
  }, [events, filters]);

  const updateDraft = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) =>
    setDraftFilters((current) => ({ ...current, [key]: value }));

  const resetFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  };

  return (
    <div className="flex flex-col gap-10 pb-12">
      <section className="bg-primary px-6 py-12 text-primary-foreground md:px-12 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Temukan pengalaman berikutnya
            </p>
            <h1 className="text-3xl font-bold md:text-5xl">
              Cari acara, amankan kursinya.
            </h1>
            <p className="text-white/75">
              Jelajahi acara berdasarkan kategori, harga, dan lokasi.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon icon="lucide:sliders-horizontal" className="size-5 text-primary" />
                Temukan acara
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setFilters(draftFilters);
                  listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="event-category"
                    className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Kategori
                  </Label>
                  <select
                    id="event-category"
                    className={filterSelectClass}
                    value={draftFilters.category}
                    onChange={(event) => updateDraft("category", event.target.value)}
                  >
                    <option value="">Semua kategori</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="event-availability"
                    className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    Harga tiket
                  </Label>
                  <select
                    id="event-availability"
                    className={filterSelectClass}
                    value={draftFilters.availability}
                    onChange={(event) =>
                      updateDraft("availability", event.target.value as EventFilters["availability"])
                    }
                  >
                    <option value="all">Semua acara</option>
                    <option value="free">Gratis</option>
                    <option value="paid">Berbayar</option>
                  </select>
                </div>
                <TextField
                  label="Lokasi"
                  placeholder="Kota atau tempat acara"
                  value={draftFilters.location}
                  onChange={(event) => updateDraft("location", event.target.value)}
                />
                <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3 lg:justify-end">
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button type="submit" appendIcon={<Icon icon="lucide:search" />}>
                    Cari acara
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        ref={listRef}
        className="mx-auto flex w-full max-w-7xl scroll-mt-24 flex-col gap-5 px-6 md:px-12"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Pilihan untuk Anda</p>
            <h2 className="type-section">Acara Terdekat</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredEvents.length} acara ditampilkan
          </p>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((event) => (
              <CardImage
                key={event.id}
                imageUrl={event.eventPicture ?? undefined}
                title={event.name}
                place={event.location}
                startDate={formatDate(event.startDate)}
                endDate={formatDate(event.endDate)}
                price={event.isFree ? 0 : Number(event.lowestPrice ?? event.ticketTypes?.[0]?.price ?? 0)}
                priceLabel={
                  event.isFree
                    ? "FREE"
                    : event.minTicketPrice != null && event.maxTicketPrice != null
                      ? `${formatCurrency(Number(event.minTicketPrice), "IDR")} - ${formatCurrency(Number(event.maxTicketPrice), "IDR")}`
                      : undefined
                }
                seats={event.availableSeats}
                tags={
                  <div className="flex flex-wrap gap-2">
                    <Badge>{event.category}</Badge>
                    {event.isFree && <Badge variant="success">Gratis</Badge>}
                  </div>
                }
                topLeft={
                  event.bestVoucher?.discountAmount && (
                    <Badge variant="destructive">
                      Voucher {formatCurrency(Number(event.bestVoucher.discountAmount), "IDR")}
                    </Badge>
                  )
                }
                onClick={() => {
                  if (isCustomer) {
                    navigate(`/events-details/${event.id}`);
                  } else {
                    setAccessDialogOpen(true);
                  }
                }}
              />
            ))}
          </div>
        ) : !loading && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <Icon icon="lucide:calendar-search" className="size-8 text-muted-foreground" />
              <p className="font-semibold">Acara tidak ditemukan</p>
              <p className="text-sm text-muted-foreground">
                Coba ubah kategori, harga, atau lokasi pencarian.
              </p>
            </CardContent>
          </Card>
        )}
        {events.length === 0 && <div ref={sentinelRef} />}
        {loading && <p className="py-2 text-center text-muted-foreground">Memuat acara…</p>}
        {error && <p className="py-2 text-center text-destructive">{error}</p>}
        {!loading && hasMore && (
          <div className="flex justify-center">
            <Button onClick={loadMore}>
              {error ? "Coba lagi" : "Lebih banyak acara"}
            </Button>
          </div>
        )}
      </section>
      <CustomerAccessDialog
        open={accessDialogOpen}
        onOpenChange={setAccessDialogOpen}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
