import { TextAreaField, TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { FREE_TICKET_TYPES, getEventById, updateEvent } from "@/lib/events";
import type { OrganizerEvent, TicketTypeInput } from "@/types/event";
import { PlusIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";
import { ImagePicker, Section, Segmented, VoucherPanel } from "./components/event-form";

const toDateInput = (iso: string) => iso.slice(0, 10);

export default function OrganizerEventsEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<OrganizerEvent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [seats, setSeats] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventById(id)
      .then((loadedEvent) => {
        setEvent(loadedEvent);
        setDescription(loadedEvent.description);
        setLocation(loadedEvent.location);
        setStartDate(toDateInput(loadedEvent.startDate));
        setEndDate(toDateInput(loadedEvent.endDate));
        setSeats(loadedEvent.availableSeats);
        setIsFree(loadedEvent.isFree);
        setTicketTypes(
          (loadedEvent.ticketTypes ?? []).map(({ name, price }) => ({
            name,
            price: Number(price),
          })),
        );
      })
      .catch(() => setLoadError("Gagal memuat acara."));
  }, [id]);

  if (loadError) return <div className="p-6 text-destructive">{loadError}</div>;
  if (!event) return <div className="p-6 text-muted-foreground">Memuat acara…</div>;

  const currentTicketTypes = (event.ticketTypes ?? []).map(({ name, price }) => ({
    name,
    price: Number(price),
  }));
  const dirty =
    image !== null ||
    description !== event.description ||
    location !== event.location ||
    startDate !== toDateInput(event.startDate) ||
    endDate !== toDateInput(event.endDate) ||
    seats !== event.availableSeats ||
    isFree !== event.isFree ||
    JSON.stringify(ticketTypes) !== JSON.stringify(currentTicketTypes);
  const invalid =
    !startDate ||
    !endDate ||
    endDate < startDate ||
    !Number.isInteger(seats) ||
    seats < 1 ||
    (!isFree &&
      (ticketTypes.length === 0 ||
        ticketTypes.some((ticket) => !ticket.name.trim() || !Number.isFinite(ticket.price) || ticket.price < 0)));

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const updated = await updateEvent({
        id: event.id,
        name: event.name,
        description,
        category: event.category,
        location,
        isFree,
        ticketTypes: isFree
          ? FREE_TICKET_TYPES
          : ticketTypes.map((ticket) => ({ name: ticket.name.trim(), price: ticket.price })),
        availableSeats: seats,
        startDate,
        endDate,
        eventPicture: image ?? undefined,
      });

      const updatedEvent: OrganizerEvent = {
        ...event,
        ...updated,
        description,
        location,
        startDate,
        endDate,
        availableSeats: seats,
        isFree,
        ticketTypes:
          updated.ticketTypes ??
          (isFree
            ? []
            : ticketTypes.map((ticket, index) => ({
                id: event.ticketTypes?.[index]?.id ?? `local-ticket-${index}`,
                ...ticket,
              }))),
      };
      setEvent(updatedEvent);
      setDescription(updatedEvent.description);
      setLocation(updatedEvent.location);
      setStartDate(toDateInput(updatedEvent.startDate));
      setEndDate(toDateInput(updatedEvent.endDate));
      setSeats(updatedEvent.availableSeats);
      setIsFree(updatedEvent.isFree);
      setTicketTypes(
        (updatedEvent.ticketTypes ?? []).map(({ name, price }) => ({
          name,
          price: Number(price),
        })),
      );
      setImage(null);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const updateTicket = (index: number, patch: Partial<TicketTypeInput>) => {
    setTicketTypes((current) =>
      current.map((ticket, ticketIndex) =>
        ticketIndex === index ? { ...ticket, ...patch } : ticket,
      ),
    );
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
          <Badge
            variant="success"
            size="lg"
            className="bg-green-500/20 text-green-800"
          >
            <span>Perubahan tersimpan.</span>
          </Badge>
        )}

        <Section title="Informasi dasar">
          <ImagePicker file={image} currentUrl={event.eventPicture} onChange={setImage} />
          <TextField label="Nama acara" value={event.name} disabled />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Kategori" value={event.category} disabled />
            <TextField
              label="Lokasi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
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
            type="number"
            min={1}
            value={seats || ""}
            aria-invalid={seats < 1}
            onChange={(e) => setSeats(Number(e.target.value))}
          />
          <TextAreaField
            label="Deskripsi"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Section>

        <Section
          title="Jenis tiket"
          action={
            <Segmented
              value={isFree ? "free" : "paid"}
              options={[
                { value: "paid", label: "Berbayar" },
                { value: "free", label: "Gratis" },
              ]}
              onChange={(value) => setIsFree(value === "free")}
            />
          }
        >
          {isFree ? (
            <p className="text-sm text-muted-foreground">
              Acara gratis tidak memerlukan jenis tiket.
            </p>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-4 bg-muted-subtle/40 px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <span>Nama tiket</span>
                  <span className="text-right">Harga (IDR)</span>
                  <span className="w-8" />
                </div>
                {ticketTypes.map((ticket, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 border-t px-4 py-3"
                  >
                    <Input
                      value={ticket.name}
                      placeholder="Presale"
                      aria-label={`Nama tiket ${index + 1}`}
                      onChange={(e) => updateTicket(index, { name: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={0}
                      className="text-right"
                      value={ticket.price}
                      aria-label={`Harga tiket ${index + 1}`}
                      onChange={(e) => updateTicket(index, { price: Number(e.target.value) })}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Hapus jenis tiket"
                      onClick={() =>
                        setTicketTypes((current) => current.filter((_, ticketIndex) => ticketIndex !== index))
                      }
                    >
                      <XIcon />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="self-start text-primary"
                onClick={() => setTicketTypes((current) => [...current, { name: "", price: 0 }])}
              >
                <PlusIcon />
                Tambah jenis tiket
              </Button>
            </>
          )}
        </Section>
      </div>

      {/* Stays in view below the navbar while the form scrolls. */}
      <div className="flex flex-col gap-6 self-start lg:sticky lg:top-20">
        <VoucherPanel eventId={event.id} initialVouchers={event.vouchers} />
      </div>
    </div>
  );
}
