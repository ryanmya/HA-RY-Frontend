import Navbar from "@/components/navbar";
import { TextAreaField, TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { createEvent } from "@/lib/events";
import { useEventDraftsStore } from "@/stores/event-drafts";
import { useEventEditorStore } from "@/stores/event-editor";
import type { EventDraft, EventInput, TicketTypeInput } from "@/types/event";
import { Section, Segmented } from "./event-form";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

const emptyEvent = (): EventInput => ({
  name: "",
  description: "",
  category: "",
  location: "",
  startDate: "",
  endDate: "",
  availableSeats: 0,
  isFree: false,
  ticketTypes: [{ name: "", price: 0 }],
});

export default function EventEditorDialog() {
  const { open, draft, closeEditor, markEventsChanged } = useEventEditorStore();
  const { saveDraft, removeDraft } = useEventDraftsStore();

  const [event, setEvent] = useState<EventInput>(emptyEvent);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Reset the form each time the dialog opens, prefilled from the draft if there is one.
  useEffect(() => {
    if (!open) return;
    setEvent(draft?.event ?? emptyEvent());
    setError(null);
  }, [open, draft]);

  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) =>
    setEvent((e) => ({ ...e, [key]: value }));

  const setTicket = (i: number, patch: Partial<TicketTypeInput>) =>
    set("ticketTypes", event.ticketTypes.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  const handleSaveDraft = () => {
    const saved: EventDraft = {
      id: draft?.id ?? crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      event,
    };
    saveDraft(saved);
    closeEditor();
  };

  const handlePublish = async () => {
    setError(null);
    setPublishing(true);
    try {
      await createEvent({
        ...event,
        // Free events don't need ticket types; drop empty rows either way.
        ticketTypes: event.isFree ? [] : event.ticketTypes.filter((t) => t.name.trim()),
      });
      if (draft) removeDraft(draft.id);
      markEventsChanged();
      closeEditor();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeEditor()}>
      <DialogContent
        showCloseButton={false}
        className="z-200 top-0 left-0 flex h-screen w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none bg-muted-subtle/30 p-0 ring-0 sm:max-w-none"
      >
        <Navbar
          left={
            <div className="flex flex-col">
              <DialogTitle className="text-xl font-bold text-foreground">
                {event.name || "Acara baru"}
              </DialogTitle>
              <span className="text-xs font-normal text-muted-foreground">Draf · belum terbit</span>
            </div>
          }
          right={
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={closeEditor}>
                Batal
              </Button>
              <Button variant="outline" onClick={handleSaveDraft}>
                Simpan draf
              </Button>
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing ? "Menerbitkan…" : "Terbitkan acara"}
              </Button>
            </div>
          }
        />

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
          <div className="flex flex-col gap-6">
            {error && (
              <Badge variant="destructive" size="lg">
                <span>{error}</span>
              </Badge>
            )}

            {/* 1. Informasi dasar */}
            <Section title="Informasi dasar">
              <TextField label="Nama acara" value={event.name} onChange={(e) => set("name", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Kategori" value={event.category} onChange={(e) => set("category", e.target.value)} />
                <TextField label="Lokasi" value={event.location} onChange={(e) => set("location", e.target.value)} />
                <TextField
                  label="Mulai"
                  type="date"
                  value={event.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
                <TextField
                  label="Selesai"
                  type="date"
                  value={event.endDate}
                  min={event.startDate || undefined}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </div>
              <TextField
                label="Jumlah kursi"
                type="number"
                min={1}
                value={event.availableSeats || ""}
                onChange={(e) => set("availableSeats", Number(e.target.value))}
              />
              <TextAreaField
                label="Deskripsi"
                value={event.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Section>

            {/* 2. Jenis tiket */}
            <Section
              title="Jenis tiket"
              action={
                <Segmented
                  value={event.isFree ? "free" : "paid"}
                  options={[
                    { value: "paid", label: "Berbayar" },
                    { value: "free", label: "Gratis" },
                  ]}
                  onChange={(v) => set("isFree", v === "free")}
                />
              }
            >
              {event.isFree ? (
                <p className="text-sm text-muted-foreground">Acara gratis tidak memerlukan jenis tiket.</p>
              ) : (
                <>
                  <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-4 bg-muted-subtle/40 px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      <span>Nama</span>
                      <span className="text-right">Harga (IDR)</span>
                      <span className="w-8" />
                    </div>
                    {event.ticketTypes.map((t, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 border-t px-4 py-3">
                        <Input value={t.name} placeholder="Presale" onChange={(e) => setTicket(i, { name: e.target.value })} />
                        <Input
                          type="number"
                          min={0}
                          className="text-right"
                          value={t.price || ""}
                          placeholder="0"
                          onChange={(e) => setTicket(i, { price: Number(e.target.value) })}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Hapus jenis tiket"
                          onClick={() => set("ticketTypes", event.ticketTypes.filter((_, j) => j !== i))}
                        >
                          <XIcon />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="self-start text-primary"
                    onClick={() => set("ticketTypes", [...event.ticketTypes, { name: "", price: 0 }])}
                  >
                    + Tambah jenis tiket
                  </Button>
                </>
              )}
            </Section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
