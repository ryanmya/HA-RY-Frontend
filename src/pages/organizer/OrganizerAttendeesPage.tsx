import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { getOrganizerEventAttendees, type OrganizerAttendee } from "@/lib/organizer-attendees";
import { getEventsByOrganizer } from "@/lib/events";
import type { EventSummary } from "@/types/event";
import { LoaderCircle, RefreshCw, Ticket, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("id-ID");

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Gagal memuat data peserta. Silakan coba lagi.";
}

async function getAllOrganizerEvents() {
  const allEvents: EventSummary[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | null = null;

  while (true) {
    const page = await getEventsByOrganizer({ limit: 50, cursor });
    allEvents.push(...page.items);
    if (!page.nextCursor) return allEvents;
    if (seenCursors.has(page.nextCursor)) {
      throw new Error("Invalid cursor returned while loading organizer events.");
    }
    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }
}

export default function OrganizerAttendeesPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendees, setAttendees] = useState<OrganizerAttendee[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);
  const retryCursorRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const loadAttendees = async (eventId: string, cursor: string | null = null, append = false) => {
    const requestId = ++requestIdRef.current;
    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      setAttendees([]);
      setTotalAttendees(0);
      setHasNextPage(false);
    }
    setAttendeesError(null);
    retryCursorRef.current = cursor;

    try {
      const page = await getOrganizerEventAttendees(eventId, { cursor });
      if (requestId !== requestIdRef.current) return;
      setAttendees((current) => append ? [...current, ...page.data] : page.data);
      setTotalAttendees(page.pagination.total);
      setNextCursor(page.pagination.nextCursor);
      setHasNextPage(page.pagination.hasNextPage);
      retryCursorRef.current = null;
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setAttendeesError(getErrorMessage(error));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const allEvents = await getAllOrganizerEvents();
      setEvents(allEvents);
      const initialEventId = allEvents[0]?.id ?? "";
      setSelectedEventId(initialEventId);
      if (initialEventId) void loadAttendees(initialEventId);
    } catch (error) {
      setEventsError(getErrorMessage(error));
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getAllOrganizerEvents()
      .then((allEvents) => {
        if (!active) return;
        setEvents(allEvents);
        const initialEventId = allEvents[0]?.id ?? "";
        setSelectedEventId(initialEventId);
        if (!initialEventId) return;

        setLoading(true);
        getOrganizerEventAttendees(initialEventId)
          .then((page) => {
            if (!active) return;
            setAttendees(page.data);
            setTotalAttendees(page.pagination.total);
            setNextCursor(page.pagination.nextCursor);
            setHasNextPage(page.pagination.hasNextPage);
          })
          .catch((error: unknown) => {
            if (active) setAttendeesError(getErrorMessage(error));
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      })
      .catch((error: unknown) => {
        if (active) setEventsError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setEventsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <Users className="size-4" aria-hidden="true" />
            PUSAT ACARA
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Daftar peserta</h1>
          <p className="mt-2 text-muted-foreground">
            Lihat peserta, jumlah tiket, dan total pembayaran untuk setiap acara.
          </p>
        </div>
        {selectedEvent && (
          <Badge variant="muted" className="px-3 py-1.5 text-sm">
            {numberFormatter.format(totalAttendees)} peserta
          </Badge>
        )}
      </header>

      {eventsError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive-subtle/20 p-4 text-sm text-destructive">
          <span role="alert">{eventsError}</span>
          <Button variant="outline" onClick={() => void loadEvents()} disabled={eventsLoading}>
            <RefreshCw aria-hidden="true" />
            Coba lagi
          </Button>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pilih acara</CardTitle>
              <CardDescription>Pilih acara untuk melihat daftar pesertanya.</CardDescription>
            </CardHeader>
            <CardContent>
              <label htmlFor="attendees-event" className="sr-only">Pilih acara</label>
              <select
                id="attendees-event"
                className="h-11 w-full rounded-lg border border-input bg-field px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-xl"
                value={selectedEventId}
                disabled={eventsLoading || events.length === 0}
                onChange={(event) => {
                  const eventId = event.target.value;
                  setSelectedEventId(eventId);
                  void loadAttendees(eventId);
                }}
              >
                {events.length === 0 && <option value="">Belum ada acara</option>}
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
              {eventsLoading && (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground" role="status">
                  <LoaderCircle className="size-4 animate-spin" />
                  Memuat daftar acara…
                </p>
              )}
            </CardContent>
          </Card>

          {selectedEvent && (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{selectedEvent.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {selectedEvent.category} · {selectedEvent.location}
                  </CardDescription>
                </div>
                <span className="hidden rounded-xl bg-primary-subtle p-3 text-primary sm:inline-flex">
                  <Ticket className="size-5" aria-hidden="true" />
                </span>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground" role="status">
                    <LoaderCircle className="size-4 animate-spin" />
                    Memuat peserta…
                  </div>
                ) : attendeesError && attendees.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-10 text-center">
                    <p className="text-sm text-destructive" role="alert">{attendeesError}</p>
                    <Button
                      variant="outline"
                      onClick={() => void loadAttendees(selectedEventId, retryCursorRef.current)}
                    >
                      <RefreshCw aria-hidden="true" />
                      Coba lagi
                    </Button>
                  </div>
                ) : attendees.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    Belum ada peserta pada acara ini.
                  </p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted-subtle/30 hover:bg-muted-subtle/30">
                          <TableHead>Nama peserta</TableHead>
                          <TableHead className="text-right">Jumlah tiket</TableHead>
                          <TableHead className="text-right">Total pembayaran</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendees.map((attendee) => (
                          <TableRow key={attendee.transactionId}>
                            <TableCell className="font-medium">{attendee.name}</TableCell>
                            <TableCell className="text-right">
                              {numberFormatter.format(attendee.ticketQuantity)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {currencyFormatter.format(attendee.totalPricePaid)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {attendeesError && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive-subtle/20 p-3 text-sm text-destructive">
                        <span role="alert">{attendeesError}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void loadAttendees(selectedEventId, retryCursorRef.current, true)}
                        >
                          Coba lagi
                        </Button>
                      </div>
                    )}
                    {hasNextPage && !attendeesError && (
                      <div className="flex justify-center pt-5">
                        <Button
                          variant="outline"
                          disabled={loadingMore}
                          onClick={() => void loadAttendees(selectedEventId, nextCursor, true)}
                        >
                          {loadingMore ? "Memuat…" : "Muat peserta lainnya"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
