import CardImageShell from "@/components/card-image-shell";
import CustomerAccessDialog from "@/components/customer-access-dialog";
import QuantityStepper from "@/components/quantity-stepper";
import RadioCard from "@/components/radio-card";
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
import { formatDMY } from "@/lib/date";
import { getEventById } from "@/lib/events";
import { getOrganizerReviews } from "@/lib/reviews";
import {
  getPublicOrganizer,
  type PublicOrganizer,
} from "@/lib/organizer-profile";
import { checkout, getMyTransactions } from "@/lib/transactions";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import type { OrganizerEvent } from "@/types/event";
import type { ReviewPage } from "@/types/review";
import { Icon } from "@iconify/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

// const formatDate = (iso: string) =>
//   new Date(iso).toLocaleDateString("id-ID", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });

const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { month: "short", year: "numeric" });

export default function EventsDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const userType = useAuthStore((state) => state.user?.userType);
  const isLoggedIn = Boolean(accessToken);
  const isCustomer = isLoggedIn && userType === "CUSTOMER";
  const goBack = () => {
    if (location.key === "default") {
      navigate("/");
    } else {
      navigate(-1);
    }
  };
  const [result, setResult] = useState<{
    id: string;
    event?: OrganizerEvent;
    error?: string;
  } | null>(null);
  // Loaded after the event, since it needs event.organizerId. The page still works without it.
  const [loadedOrganizer, setOrganizer] = useState<PublicOrganizer | null>(
    null,
  );

  // The organizer's reviews across all their events, keyed by the event they were loaded for.
  const [loadedReviews, setReviews] = useState<{
    eventId: string;
    page: ReviewPage;
  } | null>(null);

  const [ticketTypeId, setTicketTypeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !isCustomer) return;

    let active = true;
    getEventById(id)
      .then((event) => {
        if (!active) return;
        setResult({ id, event });
        getPublicOrganizer(event.organizerId)
          .then((o) => active && setOrganizer(o))
          .catch(() => {});
        getOrganizerReviews(event.eventOrganizerName, { limit: 3 })
          .then((page) => active && setReviews({ eventId: event.id, page }))
          .catch(() => {});
      })
      .catch(() => {
        if (active) {
          setResult({
            id,
            error: "Gagal memuat detail acara. Silakan coba lagi.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id, isCustomer]);

  if (!isCustomer) {
    return (
      <CustomerAccessDialog
        open
        onOpenChange={(open) => {
          if (!open) navigate("/", { replace: true });
        }}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  const currentResult = id && result?.id === id ? result : null;
  const event = currentResult?.event;
  const error = currentResult?.error;
  const loading = Boolean(id) && !currentResult;

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8">
        <Button className="self-start" variant="outline" onClick={goBack}>
          <ArrowLeft />
          Kembali
        </Button>
        <p className="text-center text-muted-foreground">
          Memuat detail acara…
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-8 text-center">
        <Button className="mb-4" variant="outline" onClick={goBack}>
          <ArrowLeft />
          Kembali
        </Button>
        <p className="text-destructive">{error ?? "Acara tidak ditemukan."}</p>
      </div>
    );
  }

  const ticketPrices =
    event.ticketTypes
      ?.map((ticket) => Number(ticket.price))
      .filter(Number.isFinite) ?? [];
  const minPrice = ticketPrices.length ? Math.min(...ticketPrices) : undefined;
  const maxPrice = ticketPrices.length ? Math.max(...ticketPrices) : undefined;
  // Ignore an organizer left over from the previously opened event.
  const organizer =
    loadedOrganizer?.id === event.organizerId ? loadedOrganizer : null;
  const reviews = loadedReviews?.eventId === event.id ? loadedReviews.page : null;

  // Defaults to the first ticket type until the customer picks one.
  const selectedTicketId = ticketTypeId ?? event.ticketTypes?.[0]?.id ?? null;
  const selectedTicket = event.ticketTypes?.find(
    (t) => t.id === selectedTicketId,
  );
  const maxQuantity = Math.max(1, Math.min(10, event.availableSeats));
  const soldOut = event.availableSeats <= 0;

  const handleBuy = async () => {
    if (!selectedTicketId) return;
    setBuyError(null);
    setBuying(true);
    try {
      const transaction = await checkout({
        ticketTypeId: selectedTicketId,
        quantity,
      });
      navigate(`/transactions/${transaction.id}`);
    } catch (err) {
      // 409: there's already an open cart for this event, so continue that one.
      if (err instanceof ApiError && err.status === 409) {
        const open = await getMyTransactions("WAITING_PAYMENT").catch(() => []);
        const existing = open.find((t) => t.eventId === event.id);
        if (existing) return navigate(`/transactions/${existing.id}`);
      }
      setBuyError(
        err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <Button className="self-start" variant="outline" onClick={goBack}>
        <ArrowLeft />
        Kembali
      </Button>
      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-6">
          <CardImageShell
            imageUrl={event.eventPicture ?? undefined}
            contentClassName="flex flex-col gap-4"
          >
            <div className="mb-2 flex gap-4">
              {event.category && <Badge>{event.category}</Badge>}
              {event.location && (
                <Badge variant="muted">{event.location}</Badge>
              )}
              {event.vouchers && event.vouchers.length > 0 && (
                <Badge variant="destructive">Voucher Tersedia</Badge>
              )}
            </div>
            <CardTitle className="type-card-title text-4xl">
              {event.name}
            </CardTitle>
            <div className="flex gap-4">
              <Badge variant={!organizer?.averageRating ? "muted" : "default"}>
                {organizer?.averageRating
                  ? organizer.averageRating.toLocaleString("id-ID", {
                      maximumFractionDigits: 1,
                    })
                  : 0}{" "}
                <Icon icon="mdi:star" />
              </Badge>
              {organizer && <span>{organizer.totalReviews} ulasan</span>}.
              <span className="text-primary">
                {organizer?.eventOrganizerName ?? event.eventOrganizerName}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-2 rounded-md bg-muted-subtle">
                <CardContent className="p-0 flex flex-col">
                  <span>Mulai</span>
                  <span className="font-bold">
                    {formatDMY(event.startDate)}
                  </span>
                </CardContent>
              </Card>
              <Card className="p-2 rounded-md bg-muted-subtle">
                <CardContent className="p-0 flex flex-col">
                  <span>Selesai</span>
                  <span className="font-bold">{formatDMY(event.endDate)}</span>
                </CardContent>
              </Card>
              <Card className="p-2 rounded-md bg-muted-subtle">
                <CardContent className="p-0 flex flex-col">
                  <span>Kursi tersedia</span>
                  <span className="font-bold">
                    {event.availableSeats.toLocaleString("id-ID")}
                  </span>
                </CardContent>
              </Card>
            </div>
          </CardImageShell>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <span className="type-card-title">Tentang Acara</span>
              <span className="type-body">{event.description}</span>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="flex justify-start items-center gap-4">
              <img
                src={organizer?.profilePicture ?? ""}
                alt=""
                className="size-full rounded-full object-cover h-10 w-10"
              />
              <div className="flex flex-col">
                <span className="type-card-title">{organizer?.name}</span>
                <span className="type-body flex gap-2 items-center">
                  <span className="flex items-center">
                    {organizer?.averageRating ?? "0.0"}
                    <Icon icon="mdi:star" />
                  </span>{" "}
                  .<span>{organizer?.totalReviews} ulasan</span>.
                  <span>{organizer?.totalEvents} acara</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="type-card-title">Ulasan peserta</span>
                {reviews && reviews.totalReviews > 0 && (
                  <span className="text-sm font-bold text-muted-foreground">
                    {reviews.totalReviews} ulasan
                  </span>
                )}
              </div>
              {!reviews ? (
                <span className="text-sm text-muted-foreground">Memuat ulasan…</span>
              ) : reviews.totalReviews === 0 ? (
                <span className="text-sm text-muted-foreground">Belum ada ulasan.</span>
              ) : (
                reviews.items.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-foreground/10"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="success">
                        {review.rating.toLocaleString("id-ID", {
                          minimumFractionDigits: 1,
                        })}{" "}
                        ★
                      </Badge>
                      <span className="text-sm font-bold">{review.customer.name}</span>
                      <Badge>Peserta terverifikasi</Badge>
                    </div>
                    <p className="type-body text-foreground/80">{review.comment}</p>
                    {review.event && (
                      <span className="text-xs text-muted-foreground">
                        pada {review.event.name} ({formatMonthYear(review.event.endDate)})
                      </span>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* {event.eventPicture ? (
            <img
              src={event.eventPicture}
              alt={`Poster ${event.name}`}
              className="aspect-video w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              Tidak ada gambar acara
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge>{event.category}</Badge>
            {event.isFree && <Badge variant="success">Gratis</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">{event.description}</p>
          <Card>
            <CardHeader>
              <CardTitle>Informasi acara</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <CardDescription>Lokasi: {event.location}</CardDescription>
              <CardDescription>
                Tanggal: {formatDate(event.startDate)}
                {event.endDate && event.endDate !== event.startDate
                  ? ` – ${formatDate(event.endDate)}`
                  : ""}
              </CardDescription>
              <CardDescription>
                {event.availableSeats} kursi tersedia
              </CardDescription>
            </CardContent>
          </Card> */}
        </div>

        <div className="flex flex-col gap-4 self-start md:sticky md:top-20">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Tiket</CardTitle>
              <CardDescription>
                {event.isFree
                  ? "FREE"
                  : minPrice !== undefined && maxPrice !== undefined
                    ? minPrice === maxPrice
                      ? formatCurrency(minPrice, "IDR")
                      : `${formatCurrency(minPrice, "IDR")} - ${formatCurrency(maxPrice, "IDR")}`
                    : "Harga tiket belum tersedia"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {event.ticketTypes?.map((ticket) => (
                <RadioCard
                  key={ticket.id}
                  name="ticketType"
                  value={ticket.id}
                  checked={ticket.id === selectedTicketId}
                  onChange={() => setTicketTypeId(ticket.id)}
                  title={ticket.name}
                  description={
                    event.isFree
                      ? "FREE"
                      : formatCurrency(Number(ticket.price), "IDR")
                  }
                />
              ))}
              {selectedTicket && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Jumlah (maks. 10)
                  </span>
                  <QuantityStepper
                    value={quantity}
                    min={1}
                    max={maxQuantity}
                    onChange={setQuantity}
                  />
                </div>
              )}
              {!selectedTicket && (
                <span className="text-sm text-muted-foreground">
                  Tiket untuk acara ini belum tersedia.
                </span>
              )}
              {buyError && (
                <Badge variant="destructive" size="lg">
                  <span>{buyError}</span>
                </Badge>
              )}
              <Button
                onClick={handleBuy}
                disabled={!selectedTicket || soldOut || buying}
              >
                {soldOut
                  ? "Tiket habis"
                  : buying
                    ? "Memproses…"
                    : event.isFree
                      ? "Daftar gratis"
                      : "Beli tiket"}
              </Button>
            </CardContent>
          </Card>
          <Button className="w-full" variant="outline" onClick={goBack}>
            <ArrowLeft />
            Kembali ke halaman sebelumnya
          </Button>
        </div>
      </div>
    </div>
  );
}
