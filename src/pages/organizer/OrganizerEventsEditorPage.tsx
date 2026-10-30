import { TextAreaField, TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { getEventById, updateEvent } from "@/lib/events";
import type { OrganizerEvent } from "@/types/event";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";
import { ImagePicker, Section, Segmented, VoucherPanel } from "./components/event-form";

// The backend sends full ISO date-times; date inputs need YYYY-MM-DD.
const toDateInput = (iso: string) => iso.slice(0, 10);

// Edits a published event. Only seats (increase only) and dates can change;
// everything else is shown read-only so existing ticket sales stay valid.
export default function OrganizerEventsEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<OrganizerEvent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [seats, setSeats] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventById(id)
      .then((e) => {
        setEvent(e);
        setSeats(e.availableSeats);
        setStartDate(toDateInput(e.startDate));
        setEndDate(toDateInput(e.endDate));
      })
      .catch(() => setLoadError("Gagal memuat acara."));
  }, [id]);
  
  if (loadError) return <div className="p-6 text-destructive">{loadError}</div>;
  if (!event)
    return <div className="p-6 text-muted-foreground">Memuat acara…</div>;

  const minSeats = event.availableSeats;
  const dirty =
    image !== null ||
    seats !== event.availableSeats ||
    startDate !== toDateInput(event.startDate) ||
    endDate !== toDateInput(event.endDate);
  const invalid =
    seats < minSeats || !startDate || !endDate || endDate < startDate;

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      // The backend validates the whole event, so send the unchanged fields back as they are.
      const updated = await updateEvent({
        id: event.id,
        name: event.name,
        description: event.description,
        category: event.category,
        location: event.location,
        isFree: event.isFree,
        ticketTypes: (event.ticketTypes ?? []).map((t) => ({
          name: t.name,
          price: Number(t.price),
        })),
        availableSeats: seats,
        startDate,
        endDate,
        eventPicture: image ?? undefined,
      });
      setEvent({ ...event, ...updated });
      setImage(null);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <NavLink
              to="/organizer/events"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Kembali ke Acara
            </NavLink>
            <h1 className="text-2xl font-bold">{event.name}</h1>
          </div>
          <Button onClick={handleSave} disabled={!dirty || invalid || saving}>
            {saving ? "Menyimpan…" : "Simpan perubahan"}
          </Button>
        </div>

        {error && (
          <Badge variant="destructive" size="lg">
            <span>{error}</span>
          </Badge>
        )}
        {saved && !dirty && (
          <Badge variant="success" size="lg">
            <span>Perubahan tersimpan.</span>
          </Badge>
        )}

        <ImagePicker file={image} currentUrl={event.eventPicture} onChange={setImage} />

        <Section title="Informasi dasar">
          <TextField label="Nama acara" value={event.name} disabled />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Kategori" value={event.category} disabled />
            <TextField label="Lokasi" value={event.location} disabled />
            <TextField
              label="Mulai"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              label="Selesai"
              type="date"
              value={endDate}
              min={startDate || undefined}
              aria-invalid={endDate < startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <TextField
            label="Jumlah kursi"
            topRight={
              <span className="text-xs text-muted-foreground">
                Hanya bisa ditambah (min. {minSeats})
              </span>
            }
            type="number"
            min={minSeats}
            value={seats || ""}
            aria-invalid={seats < minSeats}
            onChange={(e) => setSeats(Number(e.target.value))}
          />
          <TextAreaField label="Deskripsi" value={event.description} disabled />
        </Section>

        <Section
          title="Jenis tiket"
          action={
            <Segmented
              disabled
              value={event.isFree ? "free" : "paid"}
              options={[
                { value: "paid", label: "Berbayar" },
                { value: "free", label: "Gratis" },
              ]}
              onChange={() => {}}
            />
          }
        >
          {event.isFree ? (
            <p className="text-sm text-muted-foreground">
              Acara gratis tidak memerlukan jenis tiket.
            </p>
          ) : !event.ticketTypes?.length ? (
            <p className="text-sm text-muted-foreground">
              Jenis tiket tidak tersedia.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
              <div className="grid grid-cols-2 gap-4 bg-muted-subtle/40 px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <span>Nama</span>
                <span className="text-right">Harga (IDR)</span>
              </div>
              {event.ticketTypes.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-2 items-center gap-4 border-t px-4 py-3"
                >
                  <Input value={t.name} disabled />
                  <Input
                    value={Number(t.price).toLocaleString("id-ID")}
                    className="text-right"
                    disabled
                  />
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <div className="flex flex-col gap-6">
        <VoucherPanel eventId={event.id} initialVouchers={event.vouchers} />
      </div>
    </div>
  );
}
