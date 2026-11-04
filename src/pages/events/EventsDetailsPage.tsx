import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getEventById } from "@/lib/events";
import { cn } from "@/lib/utils";
import type { OrganizerEvent } from "@/types";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";

// Dummy content until the backend serves ratings, organizer profiles and reviews.
// Real event fields replace these once the event loads.
const dummy = {
  name: "Java Jazz Festival 2026",
  category: "Musik",
  location: "Jakarta Pusat",
  startDate: "2026-10-04T16:00:00",
  endDate: "2026-10-06T23:00:00",
  availableSeats: 1240,
  totalSeats: 6000,
  description:
    "Nusantara Live kembali ke JIExpo Kemayoran dengan tiga panggung dan 48 penampil selama tiga malam. Edisi 2026 menambah panggung larut malam yang dikurasi bersama label independen Jakarta, serta trek workshop siang untuk pemusik.\n\nGerbang dibuka 15:00. Masuk dengan tiket QR; keluar-masuk diperbolehkan dengan gelang.",
  rating: 4.7,
  reviewCount: 38,
  organizer: { name: "Nusantara Live", eventCount: 26 },
  reviews: [
    {
      id: "1",
      name: "Dimas A.",
      rating: 5,
      verified: true,
      text: "Suara di panggung utama sangat bagus dan antrean gerbang 3 cepat. Harga makanan masih wajar.",
    },
    {
      id: "2",
      name: "Sari P.",
      rating: 4,
      verified: true,
      text: "Line-up bagus. Panggung larut malam agak padat — sebaiknya dibatasi tahun depan.",
    },
  ],
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":");
  return `${date}, ${time}`;
};

const formatRating = (n: number) => n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function RatingBadge({ value }: { value: number }) {
  return (
    <Badge variant="success" className="font-semibold">
      {formatRating(value)} ★
    </Badge>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-background px-4 py-3">
      <span className="type-label text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

// White block; blocks are separated by the page background, like the mockup's gray bands.
function Block({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("flex flex-col gap-4 bg-card px-8 py-6", className)}>{children}</section>;
}

export default function EventsDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<OrganizerEvent>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEventById(id)
      .then(setEvent)
      .finally(() => setTimeout(() => setLoading(false), 1000));
  }, [id]);

  if (loading) return <div>Memuat .........</div>;

  const e = { ...dummy, ...event };
  const hasVoucher = event ? (event.vouchers?.length ?? 0) > 0 : true;

  return (
    <div className="grid grid-cols-7 gap-10 p-6">
      <div className="col-span-4 flex flex-col gap-2 overflow-hidden rounded-2xl">
        {event?.eventPicture && <img src={event.eventPicture} alt={e.name} className="aspect-21/9 w-full object-cover" />}

        <Block className="gap-3">
          <div className="flex gap-2">
            <Badge variant="muted">{e.category}</Badge>
            <Badge variant="muted">{e.location}</Badge>
            {hasVoucher && <Badge variant="destructive">Voucher tersedia</Badge>}
          </div>
          <h1 className="type-page-title">{e.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RatingBadge value={e.rating} />
            <span>
              {e.reviewCount} ulasan ·{" "}
              <span className="text-primary">{event?.eventOrganizerName ?? e.organizer.name}</span>
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <Stat label="Mulai" value={formatDateTime(e.startDate)} />
            <Stat label="Selesai" value={formatDateTime(e.endDate)} />
            <Stat
              label="Kursi tersisa"
              value={`${e.availableSeats.toLocaleString("id-ID")} / ${e.totalSeats.toLocaleString("id-ID")}`}
            />
          </div>
        </Block>

        <Block>
          <h2 className="type-section text-xl">Tentang acara</h2>
          <div className="flex flex-col gap-3 type-body text-foreground/80">
            {e.description.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Block>

        <Block className="flex-row items-center gap-4">
          <div className="size-14 shrink-0 rounded-full bg-muted-subtle" />
          <div className="flex flex-1 flex-col">
            <span className="font-bold">{event?.eventOrganizerName ?? e.organizer.name}</span>
            <span className="type-meta text-muted-foreground">
              {formatRating(e.rating)} ★ · {e.reviewCount} ulasan · {e.organizer.eventCount} acara
            </span>
          </div>
          <NavLink to="#" className={cn(buttonVariants({ variant: "link" }), "font-bold")}>
            Lihat profil <Icon icon="mdi:arrow-right" />
          </NavLink>
        </Block>

        <Block>
          <div className="flex items-center justify-between">
            <h2 className="type-section text-xl">Ulasan peserta</h2>
            <NavLink to="#" className={cn(buttonVariants({ variant: "link" }), "font-bold")}>
              Semua {e.reviewCount} <Icon icon="mdi:arrow-right" />
            </NavLink>
          </div>
          {e.reviews.map((r) => (
            <div key={r.id} className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2">
                <RatingBadge value={r.rating} />
                <span className="text-sm font-bold">{r.name}</span>
                {r.verified && <Badge>Peserta terverifikasi</Badge>}
              </div>
              <p className="type-body text-foreground/80">{r.text}</p>
            </div>
          ))}
        </Block>
      </div>
      <div className="col-span-3"></div>
    </div>
  );
}
