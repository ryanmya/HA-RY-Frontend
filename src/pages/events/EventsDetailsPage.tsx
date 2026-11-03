import CustomerAccessDialog from "@/components/customer-access-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventById } from "@/lib/events";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import type { OrganizerEvent } from "@/types/event";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function EventsDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => {
    if (location.key === "default") {
      navigate("/");
    } else {
      navigate(-1);
    }
  };
  const accessToken = useAuthStore((state) => state.accessToken);
  const userType = useAuthStore((state) => state.user?.userType);
  const isLoggedIn = Boolean(accessToken);
  const isCustomer = isLoggedIn && userType === "CUSTOMER";
  const [result, setResult] = useState<{
    id: string;
    event?: OrganizerEvent;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (!id || !isCustomer) return;

    let active = true;
    getEventById(id)
      .then((result) => {
        if (active) setResult({ id, event: result });
      })
      .catch(() => {
        if (active) setResult({ id, error: "Gagal memuat detail acara. Silakan coba lagi." });
      });

    return () => {
      active = false;
    };
  }, [id, isCustomer]);

  if (!isCustomer) {
    return (
      <>
        <CustomerAccessDialog
          open
          onOpenChange={(open) => {
            if (!open) navigate("/", { replace: true });
          }}
          isLoggedIn={isLoggedIn}
        />
      </>
    );
  }

  const currentResult = id && result?.id === id ? result : null;
  const event = currentResult?.event;
  const error = currentResult?.error;
  const loading = Boolean(id) && isCustomer && !currentResult;

  if (loading) {
    return <p className="p-8 text-center text-muted-foreground">Memuat detail acara…</p>;
  }

  if (error || !event) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{error ?? "Acara tidak ditemukan."}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/")}>
          Kembali ke acara
        </Button>
      </div>
    );
  }

  const ticketPrices = event.ticketTypes?.map((ticket) => Number(ticket.price)).filter(Number.isFinite) ?? [];
  const minPrice = ticketPrices.length ? Math.min(...ticketPrices) : undefined;
  const maxPrice = ticketPrices.length ? Math.max(...ticketPrices) : undefined;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div className="flex flex-col gap-6">
        {event.eventPicture ? (
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
            <CardDescription>{event.availableSeats} kursi tersedia</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
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
              <div key={ticket.id} className="flex justify-between gap-4 text-sm">
                <span>{ticket.name}</span>
                <span className="font-semibold">
                  {event.isFree ? "FREE" : formatCurrency(Number(ticket.price), "IDR")}
                </span>
              </div>
            ))}
            <Button disabled title="Pembelian tiket belum tersedia.">
              Pembelian tiket belum tersedia
            </Button>
          </CardContent>
        </Card>
        <Button className="w-full" variant="outline" onClick={goBack}>
          <ArrowLeft />
          Kembali ke halaman sebelumnya
        </Button>
      </div>
    </div>
  );
}
